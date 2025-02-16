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
      <v-col cols="6" class="ma-0 pa-0">
        <v-card>
          <v-card-text>
            <v-list>
              <v-list-item class="left" :class="{small: item.length > 35}" v-for="(item, i) in displayColumns[0]" :key="i">
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
              <v-list-item class="right" :class="{small: item.length > 35}" v-for="(item, i) in displayColumns[1]" :key="i" >
                {{ item }}
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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
            .map(row => [row[0].trim(), row[1].trim()]);
          shuffleAndDisplay();
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          // You might want to show an error message to the user here
        }
      });
    };

    const shuffleAndDisplay = () => {
      const shuffled = [...csvData.value];
      displayColumns.value = [
        shuffled.map(row => stripHtml(row[0])),
        shuffled.map(row => stripHtml(row[1]))
      ];
    };

    const getClass  = (i) => {
      const isOdd = i % 2
     return {
      'pr-0 pl-0': !isOdd,
      }
    }

    return {
      file,
      displayColumns,
      loadCSV,
      getClass
    };
  }
};
</script>
<style>
  .v-list-item {
    box-shadow: none !important;
    height: 37mm;
    border-top: 1px white solid !important;
    box-sizing: border-box;
    text-align: center;
  }
  .v-list-item.left {
    border-right: 1px white solid !important;
  }
  .v-list-item.left {
    font-size: 40px;
  }
  .v-list-item.right {
    font-size: 40px;
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
  .left.small {
    font-size: 30px !important;
  }
  .right.small {
    font-size: 35px !important;
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
    margin: 0mm;
    background-color: white;
  }
  .v-card {
    box-shadow: none !important;
  }
  .v-list-item, .left.v-list-item {
    border-color:   grey !important;
  }
  .v-card-text {
    padding: 0 !important;
  }
  .v-file-input, #file-input-row {
    display: none !important;
  }
}
</style>
