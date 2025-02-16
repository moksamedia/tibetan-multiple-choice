<template>
  <v-container>
    <v-row id="file-input-row">
      <v-col cols="12">
        <v-file-input
          v-model="file"
          label="Upload CSV File"
          accept=".csv"
          @change="loadCSV"
        ></v-file-input>
      </v-col>
    </v-row>
    <v-row class="ma-0">
      <v-col class="ma-0 pa-0" cols="12" v-for="(row, i) in sorted" :key="i">
        <v-row class="ma-0 pa-1">
          <v-col cols="6" class="ma-0 pa-0 list-item left">
            {{row[0]}}
          </v-col>
          <v-col cols="6" class="ma-0 pa-0 list-item right">
              {{row[1]}}
          </v-col>
        </v-row>
      </v-col>
    </v-row>
<!--     <v-row class="ma-0">
      <v-col cols="6" class="ma-0 pa-0">
        <v-card>
          <v-card-text>
            <v-list>
              <v-list-item class="left" v-for="(item, i) in displayColumns[0]" :key="i">
                {{ item }}
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" class="ma-0 pa-0">
        <v-card>
          <v-card-text>
            <v-list>
              <v-list-item class="right" v-for="(item, i) in displayColumns[1]" :key="i" >
                {{ item }}
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row> -->
  </v-container>
</template>

<script>
import { ref, computed } from 'vue';
import Papa from 'papaparse';

export default {
  name: 'CSVDisplayComponent',
  setup() {
    const file = ref(null);
    const csvData = ref([]);
    const displayColumns = ref([[], []]);
    const sorted = ref([]);

    function stripHtml(html)
    {
      let tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }

    const loadCSV = () => {
      if (!file.value) return;

      Papa.parse(file.value, {
        complete: (results) => {
          csvData.value = results.data
            .filter(row => row.length >= 2 && row[0] && row[1])
            .map(row => [stripHtml(row[0].trim()), stripHtml(row[1].trim())]);
          shuffleAndDisplay();
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          // You might want to show an error message to the user here
        }
      });
    };

    const shuffleAndDisplay = () => {
      sorted.value = [...csvData.value].sort((a, b) => a[1].localeCompare(b[1]))
      console.log(sorted.value)
    };

    const getClass  = (i) => {
      const isOdd = i % 2
     return {
      'pr-0 pl-0': !isOdd,
      }
    }

    return {
      file,
      sorted,
      loadCSV,
      getClass
    };
  }
};
</script>
<style>
  .list-item {
    box-shadow: none !important;
    border-bottom: 1px lightgrey solid !important;
    box-sizing: border-box;
    text-align: left;
    padding: 30px;
    line-height: 1.5;
  }
  .list-item.left {
  }
  .list-item.left {
    font-size: 22px;
  }
  .list-item.right {
    font-size: 16px;
  }
  .csv {
    padding: 0px !important;
    margin: 0px !important;
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
  .list-item {
    page-break-inside: avoid;
  }
  @page {
    size: A4;
    margin: 8mm;
    background-color: white;
  }
  .list-item, .left.list-item {
    border-color:   lightgrey !important;
  }
  .v-file-input, #file-input-row {
    display: none !important;
  }
}
</style>
