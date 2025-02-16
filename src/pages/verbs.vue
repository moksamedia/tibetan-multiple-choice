<script setup>
import { ref, computed, reactive } from 'vue'
import { useVerbStore } from '@/stores/verbStore'

import * as EnglishVerbs from 'english-verbs-helper'
import Irregular from '../../node_modules/english-verbs-irregular/dist/verbs.json'
import Gerunds from '../../node_modules/english-verbs-gerunds/dist/gerunds.json'

const VerbsData = EnglishVerbs.mergeVerbsData(Irregular, Gerunds);

const verbStore = useVerbStore()

const selectedVerb = ref('')
const persons = ['First', 'Second', 'Second Exp', 'Third', 'Third Exp']

const conjugations = reactive({
  First: { past: {}, present: {}, future: {}, imperative: {} },
  Second: { past: {}, present: {}, future: {}, imperative: {} },
  "Second Exp": { past: {}, present: {}, future: {}, imperative: {} },
  Third: { past: {}, present: {}, future: {}, imperative: {} },
  "Third Exp": { past: {}, present: {}, future: {}, imperative: {} },
})

const verbs = computed(() => verbStore.verbs)

const playAudio = (audioUrl) => {
  if (audioUrl) {
    const audio = new Audio(audioUrl)
    audio.play()
  } else {
    console.log('Audio not available for this conjugation')
  }
}

const conjugateVerb = () => {
  if (!selectedVerb.value) return

  const verbObj = verbs.value.find(v => v.base === selectedVerb.value)
  if (!verbObj) return

  const { english, isVolitional, forms } = verbObj

  const auxiliaries = {
    volitional: {
      past: {
        First: { tibetan: 'པ་ཡིན།', english: 'I', person: 1 },
        Second: { tibetan: 'པ་རེད།', english: 'You', person: 2 },
        "Second Exp": { tibetan: 'སོང་།', english: 'You', person: 2 },
        Third: { tibetan: 'པ་རེད།', english: 'He/She/They', person: 3 },
        "Third Exp": { tibetan: 'སོང་།', english: 'He/She/They', person: 3 },
      },
      present: {
        First: { tibetan: 'གི་ཡོད།', english: 'I', person: 1 },
        Second: { tibetan: 'གི་ཡོད་རེད།', english: 'You', person: 2  },
        "Second Exp": { tibetan: 'གི་འདུག', english: 'You', person: 2  },
        Third: { tibetan: 'གི་ཡོད་རེད།', english: 'He/She/They', person: 3 },
        "Third Exp": { tibetan: 'གི་འདུག', english: 'He/She/They', person: 3 },
      },
      future: {
        First: { tibetan: 'གི་ཡིན།', english: 'I', person: 1 },
        Second: { tibetan: 'གི་རེད།', english: 'You', person: 2  },
        Third: { tibetan: 'གི་རེད།', english: 'He/She/They', person: 3 },
        "Second Exp": { tibetan: '', english: '', person: 0 },
        "Third Exp": {  tibetan: '', english: '', person: 0 },
      },
      imperative: {
        First: { tibetan: '', english: 'Let me', person: 1 },
        Second: { tibetan: '', english: '', person: 2  },
        Third: { tibetan: 'པར་ཤོག', english: 'Let him/her/them', person: 3 },
        "Second Exp": { tibetan: '', english: '', person: 0 },
        "Third Exp": {  tibetan: '', english: '', person: 0 },
      },
    },
    nonVolitional: {
      past: {
        First: { tibetan: 'བྱུང་།', english: 'I', person: 1 },
        Second: { tibetan: 'བྱུང་སོང་།', english: 'You', person: 2  },
        Third: { tibetan: 'བྱུང་སོང་།', english: 'He/She/Them', person: 3 },
        "Second Exp": { tibetan: '', english: '', person: 0 },
        "Third Exp": {  tibetan: '', english: '', person: 0 },
      },
      present: {
        First: { tibetan: 'གི་འདུག', english: 'I', person: 1 },
        Second: { tibetan: 'གི་འདུག', english: 'You', person: 2  },
        Third: { tibetan: 'གི་འདུག', english: 'He/She/Them', person: 3 },
        "Second Exp": { tibetan: '', english: '', person: 0 },
        "Third Exp": {  tibetan: '', english: '', person: 0 },
      },
      future: {
        First: { tibetan: 'གི་རེད།', english: 'I', person: 1 },
        Second: { tibetan: 'གི་རེད།', english: 'You', person: 2  },
        Third: { tibetan: 'གི་རེད།', english: 'He/She/They', person: 3 },
        "Second Exp": { tibetan: '', english: '', person: 0 },
        "Third Exp": {  tibetan: '', english: '', person: 0 },
      },
      imperative: {
        First: { tibetan: '', english: '', person: 1 },
        Second: { tibetan: '', english: '', person: 2  },
        Third: { tibetan: '', english: '', person: 3 },
        "Second Exp": { tibetan: '', english: '', person: 0 },
        "Third Exp": {  tibetan: '', english: '', person: 0 },
      },
    },
  }

  const auxSet = isVolitional ? auxiliaries.volitional : auxiliaries.nonVolitional

  const getEnglishVerb = (tense, person, verb) => {
    const personPrefix = auxSet[tense][person].english
    const _person = auxSet[tense][person].person // 1,2, or 3
    const _tense = tense == "imperative" ? "PRESENT" : tense.toUpperCase()
    const englishVerb = EnglishVerbs.getConjugation(VerbsData, verb, _tense, _person)
    return personPrefix + " " + englishVerb
  }

  const getTibetanSentence = (tense, person, verbForms) => {
    if (!auxSet[tense][person].tibetan) return ""
    const pronoun = /first/i.test(person) ? 'ང་' : /second/i.test(person) ? 'ཁྱེད་རང་' : /third/i.test(person) ? 'ཁོང་' : ''
    return `${pronoun}${forms[tense]}${auxSet[tense][person].tibetan}`
  }

  for (const [person, value] of Object.entries(conjugations)) { // First, Second, Second Experiential, Third, Third Exp..
    conjugations[person] = {
      past: {
        tibetan: getTibetanSentence('past', person, forms),
        english: getEnglishVerb('past', person, english),
        audio: `path/to/audio/${forms.past}_${person}_past.mp3`, // Placeholder
      },
      present: {
        tibetan: getTibetanSentence('present', person, forms),
        english: getEnglishVerb('present', person, english),
        audio: `path/to/audio/${forms.present}_${person}_present.mp3`, // Placeholder
      },
      future: {
        tibetan: getTibetanSentence('future', person, forms),
        english: getEnglishVerb('future', person, english),
        audio: `path/to/audio/${forms.future}_${person}_future.mp3`, // Placeholder
      },
      imperative: {
        tibetan: isVolitional ? (person === 'Second' ? forms.imperative : `${forms.imperative}${auxSet.imperative[person].tibetan}`) : '',
        english: isVolitional ? getEnglishVerb('imperative', person, english) : 'N/A',
        audio: isVolitional ? `path/to/audio/${forms.imperative}_${person}_imperative.mp3` : '', // Placeholder
      },
    }
  }
  console.log("conjugations",conjugations)
}
</script>


<template>
  <v-container>
    <h1 class="mb-4">Tibetan Verb Conjugator</h1>
    <v-select
      v-model="selectedVerb"
      :items="verbs"
      item-title="base"
      item-value="base"
      label="Select a verb"
      @update:model-value="conjugateVerb"
      class="mb-6"
    >
      <template v-slot:item="{ props, item }">
        <v-list-item v-bind="props">
          {{ item.raw.base }} ({{ item.raw.english }})
        </v-list-item>
      </template>
    </v-select>

    <v-row v-if="selectedVerb" class="font-weight-bold">
      <v-col cols="12" sm="2">Person</v-col>
      <v-col cols="12" sm="2">Past</v-col>
      <v-col cols="12" sm="2">Present</v-col>
      <v-col cols="12" sm="2">Future</v-col>
      <v-col cols="12" sm="2">Imperative</v-col>
    </v-row>

    <template v-for="(personVerbs, personName) in conjugations" :key="personName">
      <v-row class="mb-4">
        <v-col cols="12" sm="2" class="font-weight-medium">{{ personName }}</v-col>
        <v-col cols="12" sm="2" v-for="(tense, tenseName) in personVerbs" :key="tenseName">

          <v-card variant="outlined" class="pa-2" height="100%" v-if="tense.tibetan != ''">

            <div>{{ tense.tibetan }}</div>
            <div class="english-translation">{{ tense.english }}</div>

<!--             <v-btn size="x-small" @click="playAudio(conjugations[person][tense].audio)"
                   :disabled="!conjugations[person][tense].tibetan"
                   class="mt-2">
              Play
            </v-btn> -->

          </v-card>

        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<style scoped>
.english-translation {
  font-size: 0.8em;
  color: #666;
  font-style: italic;
}
</style>
