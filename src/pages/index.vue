<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-file-input
          v-model="file"
          label="Upload CSV file"
          accept=".csv"
          @change="loadCSV"
        ></v-file-input>
      </v-col>
    </v-row>
    <v-row justify="center" v-if="questions.length">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</v-card-title>
          <v-card-text>
            <p class="text-h6 mb-4">{{ currentQuestion.question }}</p>
            <v-radio-group v-model="selectedAnswer">
              <v-radio
                v-for="(answer, index) in currentQuestion.answers"
                :key="index"
                :label="answer"
                :value="answer"
              ></v-radio>
            </v-radio-group>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="checkAnswer" :disabled="!selectedAnswer">
              Check Answer
            </v-btn>
            <v-btn color="secondary" @click="nextQuestion" :disabled="!answeredCorrectly">
              Next Question
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar" :color="snackbarColor">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { ref, computed } from 'vue';
import Papa from 'papaparse';

export default {
  name: 'CSVQuizComponent',
  setup() {
    const file = ref(null);
    const csvData = ref([]);
    const questions = ref([]);
    const currentQuestionIndex = ref(0);
    const selectedAnswer = ref('');
    const answeredCorrectly = ref(false);
    const snackbar = ref(false);
    const snackbarText = ref('');
    const snackbarColor = ref('');

    const loadCSV = (event) => {
      const uploadedFile = event.target.files[0];
      Papa.parse(uploadedFile, {
        complete: (results) => {
          csvData.value = results.data.slice(1); // Remove header row
          generateQuestions();
        },
        header: true,
      });
    };

    const generateQuestions = () => {
      questions.value = csvData.value.map((row) => {
        const correctAnswer = row.English;
        const incorrectAnswers = getRandomIncorrectAnswers(correctAnswer, 3);
        const allAnswers = shuffleArray([...incorrectAnswers, correctAnswer]);

        return {
          question: `What is the English translation of "${row.Tibetan}"?`,
          answers: allAnswers,
          correctAnswer: correctAnswer,
        };
      });
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

    const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || {});

    const checkAnswer = () => {
      const isCorrect = selectedAnswer.value === currentQuestion.value.correctAnswer;
      answeredCorrectly.value = isCorrect;
      snackbar.value = true;
      snackbarText.value = isCorrect ? 'Correct!' : 'Incorrect. Try again.';
      snackbarColor.value = isCorrect ? 'success' : 'error';
    };

    const nextQuestion = () => {
      currentQuestionIndex.value = (currentQuestionIndex.value + 1) % questions.value.length;
      selectedAnswer.value = '';
      answeredCorrectly.value = false;
    };

    return {
      file,
      questions,
      currentQuestionIndex,
      currentQuestion,
      selectedAnswer,
      answeredCorrectly,
      snackbar,
      snackbarText,
      snackbarColor,
      loadCSV,
      checkAnswer,
      nextQuestion,
    };
  },
};
</script>
