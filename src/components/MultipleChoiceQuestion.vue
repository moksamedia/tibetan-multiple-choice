<template>
  <v-card :id="'question-'+index" :class="{disabled: props.index > props.nextQuestionIndex}">
    <div class="question-num">{{  "#" + (props.index+1)  }}, nqi {{ props.nextQuestionIndex }}</div>
    <v-card-title>{{ question }}<v-btn variant="text" size="x-small" v-if="tibetanSound" @click="playTibetan">play</v-btn><v-btn variant="text" size="x-small" v-if="tibetanSoundUtsang" @click="playTibetanUtsang">play</v-btn></v-card-title>
    <v-card-text>
      <v-radio-group v-model="selectedAnswer" @change="checkAnswer" :disabled="props.index > props.nextQuestionIndex">
        <v-radio
          v-for="(answer, i) in answers"
          :key="i"
          :label="answer"
          :value="answer"
          :disabled="answeredCorrectly && answer != props.correctAnswer"
        ></v-radio>
      </v-radio-group>
      <v-btn variant="text" size="x-small" @click="skip" v-if="!answeredCorrectly">skip</v-btn>
      <v-btn v-if="!props.isEasy" variant="text" size="x-small" @click="easy">easy</v-btn>
      <v-btn v-else variant="text" size="x-small" @click="easy" style="color:green" disabled>easy</v-btn>
      <!--<div>{{ props.answered === null ? "null" : answered }}, {{ selectedAnswer }}</div>-->
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'MultipleChoiceQuestion',
  props: {
    question: {
      type: String,
      required: true
    },
    answers: {
      type: Array,
      required: true
    },
    correctAnswer: {
      type: String,
      required: true
    },
    dataRow: {
      type: Object
    },
    index: {
      type: Number
    },
    nextQuestionIndex: {
      type: Number
    },
    answered: {
    },
    answeredQuestions: {
      type: Array,
      required: true
    },
    isEasy: {
      type: Boolean
    }
  },
  emits: ['answer', 'easy'],
  setup(props, { emit }) {

    const selectedAnswer = ref('');
    const isEasyLocal = ref(false)

    if (props.isEasy) isEasyLocal.value = true

    function getSoundForNote(fieldname) {
      //console.log("Checking " + fieldname)
      const soundField = props.dataRow?.[fieldname]
      if (soundField) {
        const match = soundField.match(/\[sound:([^\]]*)\]/)
        if (match) {
          return new Audio("./collection.media/"+match[1]);
        }
        else {
          return null
        }
      }
      else {
        return null;
      }
    }


    const elemId = "question-"+props.index

    const chime = new Audio('./chime.mp3');
    const error = new Audio('./error-message.mp3');
    const tibetanSound = getSoundForNote("Sound")
    const tibetanSoundUtsang = getSoundForNote("Sound_utsang")

    const skip = () => {
      // if is already correct, do nothing
      if (props.answeredQuestions[index] == true) return
      selectedAnswer.value = props.correctAnswer;
      emit('answer', true);
      scrollUp();
    }

    const scrollUp = () => {
      const elem = document.getElementById(elemId)
      const position = elem.offsetTop + elem.offsetHeight/2;
      window.scrollTo({ top: position, behavior: "smooth" });
    }

    if (props.answeredQuestions[props.index] === true) {
      selectedAnswer.value = props.correctAnswer;
    }

    const answeredCorrectly = computed(() => {
      return selectedAnswer.value === props.correctAnswer;
    });

    //console.log("answeredCorrectly=",answeredCorrectly.value)

    if (answeredCorrectly.value) {
        selectedAnswer.value = props.correctAnswer
    }

    const playTibetan = () => {
      tibetanSound?.play()
    }

    const playTibetanUtsang = () => {
      tibetanSoundUtsang?.play()
    }

    const playBoth = () => {
      if (!tibetanSound) {
        playTibetanUtsang()
      }
      else if (!tibetanSoundUtsang) {
        playTibetan()
      }
      else {
        tibetanSound.onended = ()=> {
          playTibetanUtsang()
          tibetanSound.onended = null
        }
        playTibetan()
      }
    }

    const checkAnswer = () => {
      const isCorrect = selectedAnswer.value === props.correctAnswer;
      //tibetanSound?.play()
      emit('answer', isCorrect);
      if (isCorrect) {
        scrollUp();
      }
      else {
        error.play()
      }
    };

    const playCorrectSound = (done) => {
      chime.volume = 0.3
      chime.onended = () => {
        if (done) done()
        chime.onended = null
      }
      chime.play()
    };

    const easy = () => {
      selectedAnswer.value = props.correctAnswer
      isEasyLocal.value = true
      emit('answer', true);
      emit('easy', props.question)
      scrollUp()
    }

    watch(() => props.question, () => {
      selectedAnswer.value = '';
    });

    watch(() => props.nextQuestionIndex, (newVal, oldVal) => {
      if (props.index == newVal) {
        playBoth()
      }
    });

    return {
      selectedAnswer,
      answeredCorrectly,
      checkAnswer,
      skip,
      easy,
      tibetanSound,
      tibetanSoundUtsang,
      playTibetan,
      playTibetanUtsang,
      props
    };
  }
};
</script>
<style scoped>
.question-num {
  font-size:12px;
  float:right;
  margin-right:15px;
  font-color:gray;
}
div.v-card.disabled {
  background-color: lightgray;
}
</style>
