// stores/verbStore.js
import { defineStore } from 'pinia';

export const useVerbStore = defineStore('verb', {
  state: () => ({
    verbs: [
      {
        base: 'འགྲོ་',
        english: 'go',
        isVolitional: true,
        forms: {
          present: 'འགྲོ་',
          past: 'ཕྱིན་',
          future: 'འགྲོ་',
          imperative: 'སོང་',
        }
      },
      {
        base: 'ཟ་',
        english: 'eat',
        isVolitional: true,
        forms: {
          present: 'ཟ་',
          past: 'ཟོས་',
          future: 'ཟ་',
          imperative: 'ཟོ་',
        }
      },
      {
        base: 'འཐུང་',
        english: 'drink',
        isVolitional: true,
        forms: {
          present: 'འཐུང་',
          past: 'འཐུངས་',
          future: 'འཐུང་',
          imperative: 'ཐུངས་',
        }
      },
      {
        base: 'ཉལ་',
        english: 'sleep',
        isVolitional: true,
        forms: {
          present: 'ཉལ་',
          past: 'ཉལ་',
          future: 'ཉལ་',
          imperative: 'ཉོལ་',
        }
      },
      {
        base: 'ལྟ་',
        english: 'look',
        isVolitional: true,
        forms: {
          present: 'ལྟ་',
          past: 'བལྟས་',
          future: 'བལྟ་',
          imperative: 'ལྟོས་',
        }
      },
      {
        base: 'དགའ་',
        english: 'like',
        isVolitional: false,
        forms: {
          present: 'དགའ་',
          past: 'དགའ་',
          future: 'དགའ་',
          imperative: '',
        }
      },
      // Add more verbs as needed
    ],
  }),
  actions: {
    addVerb(base, english, isVolitional, forms) {
      this.verbs.push({ base, english, isVolitional, forms });
    },
    removeVerb(base) {
      const index = this.verbs.findIndex(v => v.base === base);
      if (index > -1) {
        this.verbs.splice(index, 1);
      }
    },
  },
});
