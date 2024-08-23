<template>
  <v-container>
    <v-row id="file-input-row">
      <v-col cols="12">
        <v-file-input
          v-model="file"
          label="Upload JSON File"
          accept=".json"
          @change="loadJson"
        ></v-file-input>
      </v-col>
    </v-row>
    <v-row class="ma-0">
      <v-col cols="6" class="ma-0 pa-0">
        <v-card>
          <v-card-text>
            <v-list>
              <v-list-item class="left" v-for="(item, i) in data" :key="i">
                {{ getCol1(item) }}
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" class="ma-0 pa-0">
        <v-card>
          <v-card-text>
            <v-list>
              <v-list-item class="right" v-for="(item, i) in data" :key="i" >
                {{ stripHtml(item?.fields?.['English']) || "" }}
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, toRaw } from 'vue';

export default {
  name: 'JSONDisplayComponent',
  setup() {
    const file = ref(null);
    const data = ref([]);

    function collectSynonyms(item) {
      let synonyms = [
        item?.fields?.['Synonymous'],
        item?.fields?.['Synonym'],
        item?.fields?.['Synonym2'],
        item?.fields?.['Synonym3'],
      ]
      return synonyms.filter(n => n)
    }

    function getCol1(item) {
      const tibetan = stripHtml(item?.fields?.['Tibetan'])
      if (!tibetan) return ""
      const synonyms = collectSynonyms(item)
      if (synonyms.length > 0) {
        return tibetan + ", " + synonyms.join(", ")
      }
      else {
        return tibetan
      }
    }

    function stripHtml(html)
    {
      let tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }

    const readFile = (filepath) => {
      const reader = new FileReader();
      if (filepath.includes(".txt")) {
        reader.onload = (res) => {
          data = res.target.result;
        };
        reader.onerror = (err) => console.log(err);
        reader.readAsText(this.file);
      }
    }

    const loadJson = async () => {
      if (!file.value) return
      console.log(file.value)
      try {
        const jsonText = await file.value.text();
        data.value = JSON.parse(jsonText)
        console.log(JSON.stringify(data.value));
      }
      catch (error) {
        console.error(`Error loading file ${file.value.name}:`, error);
      }
    };

    const getClass  = (i) => {
      const isOdd = i % 2
     return {
      'pr-0 pl-0': !isOdd,
      }
    }

    return {
      file,
      data,
      loadJson,
      getClass,
      getCol1,
      stripHtml
    };
  }
};
</script>
<style>
  .v-list-item {
    box-shadow: none !important;
    border-bottom: 1px lightgrey solid !important;
    box-sizing: border-box;
    text-align: left;
  }
  .v-list-item.left {
  }
  .v-list-item.left {
    font-size: 22px;
  }
  .v-list-item.right {
    font-size: 14px;
  }
  .v-card-text {
    padding: 0 !important;
  }
  .csv {
    padding: 0px !important;
    margin: 0px !important;
  }
  .v-card {
  }
  .v-list-item {
    margin: 0px 0;
  }
  .v-list {
    padding: 0 !important;
    margin: 0 !important;
  }
  .v-container {
    padding: 0 !important;
  }
@media print {
  .v-container {
    page-break-inside: avoid;
    margin: 0;
    padding: 0;
  }
  .v-row {
    display: flex;
    flex-wrap: wrap;
  }
  .v-col {
    width: 50%;
    page-break-inside: avoid;
  }
  .v-list-item {
    page-break-inside: avoid;
  }
  @page {
    size: A4;
    margin: 8mm;
    background-color: white;
  }
  .v-card {
    box-shadow: none !important;
  }
  .v-list-item, .left.v-list-item {
    border-color:   lightgrey !important;
  }
  .v-card-text {
    padding: 0 !important;
  }
  .v-file-input, #file-input-row {
    display: none !important;
  }
}
</style>
