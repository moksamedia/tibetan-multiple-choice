<template>
  <v-container class="pa-0" fluid>
    <v-row justify="center" v-if="questions.length" class="ma-0 progress-bar-sticky">
      <v-col cols="8" class="pa-0">
        <progress-bar
          :completed-questions="completedQuestions"
          :total-questions="questions.length"
        />
        <div class="easy-questions">Current question #{{ nextQuestionIndex+1 }}. {{ easyQuestions.length }} easy. {{ incorrectAnswers.length }} incorrect. <v-btn variant="text" size="x-small" @click="clearEasy">clear easy</v-btn><v-btn variant="text" size="x-small" @click="resetValues">reset all</v-btn></div>
      </v-col>
    </v-row>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-file-input
            v-model="file"
            label="Upload CSV or JSON"
            accept=".csv,.json"
            @change="loadCSV"
          ></v-file-input>
        </v-col>
      </v-row>
      <v-row justify="center" v-if="visibleQuestions.length">
        <v-col cols="12" md="8" v-for="(question, index) in visibleQuestions" :key="index">
          <multiple-choice-question
            :question="question.question"
            :answers="question.answers"
            :dataRow="question.dataRow"
            :answeredQuestions="answeredQuestions"
            :index="index"
            :nextQuestionIndex="nextQuestionIndex"
            :correctAnswer="question.correctAnswer"
            :answered="answeredQuestions[index]"
            @answer="handleAnswer(index, $event)"
            @easy="handleEasy(question.question, $event)"
            :isEasy="easyQuestions.includes(question.question)"
          />
        </v-col>
        <infinite-loading  @infinite="infiniteHandler"></infinite-loading>
      </v-row>
    </v-container>
    <v-snackbar v-model="snackbar" :color="snackbarColor">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { ref, computed } from 'vue';
import { useStorage } from '@vueuse/core'
import Papa from 'papaparse';
import MultipleChoiceQuestion from '../components/MultipleChoiceQuestion.vue';
import ProgressBar from '../components/ProgressBar.vue';
import InfiniteLoading from 'v3-infinite-loading'

const STORE_NAME="multiple_choice_vuejs"

export default {
  name: 'CSVQuizComponent',
  components: {
    MultipleChoiceQuestion,
    ProgressBar,
    InfiniteLoading
  },
  setup() {
    const file = ref(null);
    const csvData = useStorage(STORE_NAME+"csvData",[]);
    const questions = useStorage(STORE_NAME+"questions", []);
    const visibleQuestions = useStorage(STORE_NAME+"visibleQuestions", []);
    const nextQuestionIndex = useStorage(STORE_NAME+"nextQuestionIndex", 0);
    const answeredQuestions = useStorage(STORE_NAME+"answeredQuestions", []);
    const incorrectAnswers = useStorage(STORE_NAME+"incorrectAnswers", []);
    const easyQuestions = useStorage(STORE_NAME+"easyQuestions", []);
    const snackbar = ref(false);
    const snackbarText = ref('');
    const snackbarColor = ref('');
    const questionsPerSet = 10
    const answersPerQuestion = 6

    //resetValues()

    function resetValues() {
      file.value = null
      csvData.value = []
      questions.value = []
      visibleQuestions.value = []
      answeredQuestions.value = []
      easyQuestions.value = []
      incorrectAnswers.value = []
      snackbar.value = false;
      snackbarText.value = '';
      snackbarColor.value = '';
      nextQuestionIndex.value = 0;
      answeredQuestions.value = new Array(questions.value.length).fill("no answer");
    }

    function stripHtml(html)
    {
      let tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }

    const isEasy = (question) => easyQuestions.value.includes(question)

    const loadCSV = async (event) => {
      resetValues()
      console.log("easyQuestions", easyQuestions.value)
      const uploadedFile = event.target.files[0];

      const cleanupAndPrep = (data) => {
        const stripped = data.map(row => {
          Object.keys(row).forEach(function(key, index) {
            row[key] = stripHtml(row[key]);
          });
          return row;
        })
        csvData.value.filter(row => row.Tibetan == '' || row.English == '' || isEasy(row.Tibetan))
        csvData.value = shuffleArray(stripped);
        generateQuestions();
        visibleQuestions.value.push(...questions.value.slice(0,10))
      }

      if (/.*\.json$/) {
        // convert JSON to array matching csv format (Tibetan, English, Sound)
        const jsonText = await uploadedFile.text();
        const jsonData = JSON.parse(jsonText)
        const synonyms = jsonData.reduce( (acc, curr) => {
          if (curr.fields.Synonymous) {
            acc.push({
              Tibetan:curr.fields?.Synonymous,
              English:curr.fields?.English,
              Sound:curr.fields?.Synonymous_sound,
              Sound_utsang:null,
              json:curr
            })
          }
          if (curr.fields.Synonym) {
            acc.push({
              Tibetan:curr.fields?.Synonym,
              English:curr.fields?.English,
              Sound:curr.fields?.Synonym_sound,
              Sound_utsang:null,
              json:curr
            })
          }
          if (curr.fields.Synonym2) {
            acc.push({
              Tibetan:curr.fields?.Synonym2,
              English:curr.fields?.English,
              Sound:curr.fields?.Synonym2_sound,
              Sound_utsang:null,
              json:curr
            })
          }
          return acc
        }, [])
        let csvTemp = jsonData.map(row => {
          return {
            Tibetan:row.fields?.Tibetan,
            English:row.fields?.English,
            Sound:row.fields?.Sound,
            Sound_utsang:row.fields?.Sound_utsang,
            json:row
          }
        })
        console.log("Synonyms", synonyms)
        csvTemp = csvTemp.concat(synonyms)
        cleanupAndPrep(csvTemp)
      }
      else {
        Papa.parse(uploadedFile, {
        complete: (results) => {
          cleanupAndPrep(results)
        },
        header: true,
      });
      }

    };

    const generateQuestions = () => {
      questions.value = csvData.value.map((row, index) => {
        const correctAnswer = row.English;
        const incorrectAnswers = getRandomIncorrectAnswers(correctAnswer, answersPerQuestion-1);
        const allAnswers = shuffleArray([...incorrectAnswers, correctAnswer]);
        return {
          question: `${row.Tibetan}`,
          answers: allAnswers,
          correctAnswer: correctAnswer,
          dataRow:row,
          globalIndex:index
        };
      });
      answeredQuestions.value = new Array(questions.value.length).fill("no answer");
    };

    const getRandomIncorrectAnswers = (correctAnswer, count) => {
      const incorrectAnswers = csvData.value
        .filter((row) => row.English !== correctAnswer)
        .map((row) => row.English);
      return shuffleArray(incorrectAnswers).slice(0, count);
    };

    const shuffleArray = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    const completedQuestions = computed(() => {
      return answeredQuestions.value.filter(v => v !== "no answer").length;
    });

    const handleAnswer = (index, isCorrect) => {
      console.log("Answering question " + index + ": "+ isCorrect)
      const wasAlreadyCorrectlyAnswered = answeredQuestions.value[index] !== true
      answeredQuestions.value[index] = isCorrect;
      if (isCorrect) {
        if (!wasAlreadyCorrectlyAnswered) nextQuestionIndex.value = index + 1
        //snackbar.value = true;
        //snackbarText.value = 'Correct!';
        //snackbarColor.value = 'success';
      }
      else {
        incorrectAnswers.value.push(questions[index])
        snackbar.value = true;
        snackbarText.value = 'Incorrect. Try again.';
        snackbarColor.value = 'error';
      }
      //console.log("nextQuestionIndex", nextQuestionIndex.value)
    };

    const handleEasy = (question) => {
      console.log("easy set " + question)
      if (!easyQuestions.value.includes(question)) {
        easyQuestions.value.push(question)
      }
    }

    const clearEasy = () => {
      easyQuestions.value.length = 0
    }

    /*
    const checkSetCompletion = () => {
      const start = currentSet.value * questionsPerSet;
      const end = start + questionsPerSet;
      const setCompleted = answeredQuestions.value.slice(start, end).every(answer => answer);

      if (setCompleted) {
        if (end < questions.value.length) {
          currentSet.value++;
          localStorage.setItem(STORE_NAME+"currentSet", JSON.stringify(currentSet.value))
          snackbar.value = true;
          snackbarText.value = 'Great job! Moving to the next set of questions.';
          snackbarColor.value = 'info';
        } else {
          snackbar.value = true;
          snackbarText.value = 'Congratulations! You\'ve completed all questions.';
          snackbarColor.value = 'success';
        }
      }
    };
    */

    const infiniteHandler = ($state) => {
      console.log("Loading more questions")
      const toAdd = questions.value.slice(visibleQuestions.value.length,visibleQuestions.value.length+questionsPerSet)
      visibleQuestions.value.push(...toAdd)
      $state.loaded()
    }

    return {
      file,
      questions,
      completedQuestions,
      answeredQuestions,
      snackbar,
      snackbarText,
      snackbarColor,
      loadCSV,
      handleAnswer,
      questionsPerSet,
      handleEasy,
      easyQuestions,
      clearEasy,
      nextQuestionIndex,
      visibleQuestions,
      infiniteHandler,
      resetValues,
      incorrectAnswers
    };
  },
};
</script>

<style scoped>
.v-container {
  max-width: 100%;
}
.progress-bar-sticky {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: white;
}
.easy-questions {
  text-align: center  ;
}
</style>
