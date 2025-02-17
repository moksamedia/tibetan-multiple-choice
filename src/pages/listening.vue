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
            <v-card-title>{{ group.getScreenName() }}</v-card-title>
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
                    Play Sound
                  </v-btn>
                </v-col>
                
                <v-col cols="12" md="9">
                  <v-btn-group>
                    <v-btn
                      v-for="soundVersionGroup in group.soundVersions"
                      :key="soundVersionGroup.name"
                      :color="getButtonColor(soundVersionGroup)"
                      class="mx-1"
                      @click="checkAnswer(soundVersionGroup, groupIndex)"
                    >
                      {{ soundVersionGroup.name + `(${soundVersionGroup.files.length})`}}
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
        source.buffer = group.currentSoundVersionGroup.getRandomBuffer();
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
        source.buffer = soundVersionGroup.getRandomBuffer();
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

<style scoped>
.v-btn-group .v-btn {
  margin: 0 4px;
}
</style>