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
            <v-card-title>{{ nameForGroup(group) }}</v-card-title>
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
                      v-for="sound in group.sounds"
                      :key="sound.name"
                      :color="getButtonColor(sound, groupIndex)"
                      class="mx-1"
                      @click="checkAnswer(sound, groupIndex)"
                      :disabled="group.isPlaying || !group.currentSound"
                    >
                      {{ sound.name }}
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
        // Fetch the static manifest file
        const response = await fetch('/sound-manifest.json');
        if (!response.ok) {
          throw new Error('Failed to fetch sound files list');
        }
        
        const files = await response.json();

        console.log("files", files)
        
        // Parse the file names and create sound objects
        const soundFiles = files.map(file => {
            const match = file.match(/^(\d+[a-z]{0,1})_(.+)\.(mp3|wav|ogg)$/i);
            if (!match) return null;
            
            const [_, groupname, name] = match;
            return {
              path: `/sounds/${file}`,
              name: name.toLowerCase(),
              group: groupname,
            };
          })
          .filter(file => file !== null);

        console.log("soundfiles", soundFiles)

        const groups = new Map()

        for (const file of soundFiles) {
            console.log("file", file)
            
            if (!groups.has(file.group)) {
                groups.set(file.group, { sounds: [], currentSound: null, isPlaying: false, groupName: file.group });
            }
            const buffer = await this.loadAudioBuffer(file.path);
            groups.get(file.group).sounds.push({
                ...file,
                buffer: buffer,
                isCorrect: null
            })
            console.log("groups", groups)
        }

        console.log(groups.keys().length + " groups found.")
        console.log("groups", groups)

        this.soundGroups = [...groups.values()];
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
      group.sounds.forEach(sound => sound.isCorrect = null);

      // Select random sound if none is currently selected
      if (!group.currentSound) {
        const randomIndex = Math.floor(Math.random() * group.sounds.length);
        group.currentSound = group.sounds[randomIndex];
      }

      // Play the current sound
      group.isPlaying = true;
      
      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = group.currentSound.buffer;
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

    checkAnswer(sound, groupIndex) {
      const group = this.soundGroups[groupIndex];
      if (!group.currentSound) return;

      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = sound.buffer;
        source.connect(this.audioContext.destination);    
        source.start(0);
      } 
      catch (error) {
        console.error('Error playing sound:', error);
      }

      const isCorrect = sound.path === group.currentSound.path;
      sound.isCorrect = isCorrect;

      if (isCorrect) {
        // Reset current sound when correct answer is found
        group.currentSound = null;
      }
    },

    getButtonColor(sound, groupIndex) {
      if (sound.isCorrect === null) return 'default';
      return sound.isCorrect ? 'success' : 'error';
    }
  }
}
</script>

<style scoped>
.v-btn-group .v-btn {
  margin: 0 4px;
}
</style>