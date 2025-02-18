// SoundGame.vue
<template>
  <v-container>
    <v-row v-if="isLoading" justify="center" align="center" class="mt-4">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <div class="mt-2">Loading sound files...</div>
      </v-col>
    </v-row>

    <template v-else>
      <v-row 
        v-for="(group, groupIndex) in soundGroups" 
        :key="group.name + groupIndex"
        class="mt-4"
      >
        <v-col cols="12">
          <v-card>
            <v-card-title class="group-title">{{ group.getScreenName() }}</v-card-title>
            <v-card-text>
              <v-row align="center">
                <v-col cols="12" md="3">
        
                  <v-btn
                    block
                    color="primary"
                    :loading="group.isPlaying"
                    @click="playRandomSound(groupIndex)"
                    :disabled="group.isPlaying"
                  >
                    <v-icon left>mdi-play</v-icon>
                    Random
                  </v-btn>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-btn-group class="answer-btn-group">
                    <v-btn
                      v-for="soundVersionGroup in group.soundVersions"
                      :key="soundVersionGroup.name"
                      size="x-large"
                      :color="getButtonColor(soundVersionGroup)"
                      @click="checkAnswer(soundVersionGroup, groupIndex)"
                    >
                      {{ soundVersionGroup.name }} <span class="num-files">{{`(${soundVersionGroup.files.length})`}}</span>
                    </v-btn>
                  </v-btn-group>
                </v-col>

                <v-col cols="12" md="3">
                  <v-btn-group>
                    <v-btn
                    block
                    color="secondary"
                    @click="playLong(group.long)"
                  >
                    <v-icon left>mdi-play</v-icon>
                    Long
                  </v-btn>
                  </v-btn-group>
                </v-col>

              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>

import {SoundFile, SoundVersionGroup, SoundGroup} from '../library/sound-classes'
import {getSoundGroups} from '../library/sound-loader'

export default {
  name: 'SoundGame',
  
  data() {
    return {
      isLoading: true,
      soundGroups: [],
      audioContext: null
    }
  },

  async created() {
    try {
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await this.loadSoundFiles();
    } catch (error) {
      console.error('Error initializing sound game:', error);
    }
  },

  methods: {
    async loadSoundFiles() {
      try {
        if (this.audioContext == null) throw Error("No audio context")
        this.soundGroups = await getSoundGroups(this.audioContext);
        console.log("soundGroups", this.soundGroups);
        this.isLoading = false;
      } catch (error) {
        console.error('Error loading sound files:', error);
        // Handle error appropriately
      }
    },

    async loadAudioBuffer(path) {
      try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
      } catch (error) {
        console.error(`Error loading audio file ${path}:`, error);
        throw error;
      }
    },

    nameForGroup(group) {
        console.log(group)
        return group.sounds.reduce((acc,curr) => {
            acc === "" ? acc = curr.name : acc += " vs " + curr.name
            return acc  
        },"")
    },

    async playLong(longBuffer) {
      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = longBuffer;
        source.connect(this.audioContext.destination);
        
        source.start(0);

      } 
      catch (error) {
        console.error('Error playing sound:', error);
        group.isPlaying = false;
      }
    },

    async playRandomSound(groupIndex) {

      const group = this.soundGroups[groupIndex];
      if (!group || group.isPlaying) return;

      // Reset previous guesses
      group.resetGuesses();

      // Select random sound if none is currently selected
      if (!group.currentSoundVersionGroup) {
        group.setRandomCurrentSounVersionGroup()
      }

      // Play the current sound
      group.isPlaying = true;
      
      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = group.currentSoundVersionGroup.getNextBuffer();
        source.connect(this.audioContext.destination);
        
        source.onended = () => {
          group.isPlaying = false;
        };
        
        source.start(0);

      } 
      catch (error) {
        console.error('Error playing sound:', error);
        group.isPlaying = false;
      }
    },

    checkAnswer(soundVersionGroup, groupIndex) {
      const group = this.soundGroups[groupIndex];

      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = soundVersionGroup.getNextBuffer ();
        source.connect(this.audioContext.destination);    
        source.start(0);
      } 
      catch (error) {
        console.error('Error playing sound:', error);
      }

      if (!group.currentSoundVersionGroup) return;

      const isCorrect = soundVersionGroup.name === group.currentSoundVersionGroup.name;
      soundVersionGroup.isCorrect = isCorrect;

      if (isCorrect) {
        // Reset current sound when correct answer is found
        group.currentSoundVersionGroup = null;
      }
    },

    getButtonColor(soundVersionGroup) {
      if (soundVersionGroup.isCorrect === null) return 'default';
      return soundVersionGroup.isCorrect ? 'success' : 'error';
    }
  }
}
</script>

<style>
.v-btn-group .v-btn {
  margin: 0 4px;
}
.num-files {
  font-size:50%;
  color:gray;
}
.answer-btn-group .v-btn__content, .group-title {
  font-size: 150% !important;
}
</style>