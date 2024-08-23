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
              <v-list-item class="left" v-for="(item, i) in displayColumns[0]" :key="i">
                <v-btn block variant="text">{{item.value}}</v-btn>
                <state-button
                  :selected="false"
                  :item="item"
                />
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
                <state-button
                  :selected="false"
                  :item="item"
                />
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
import StateButton from '../components/StateButton.vue'

export default {
  name: 'CSVDisplayComponent',
  setup() {

    const file = ref(null);
    const csvData = ref([]);
    const displayColumns = ref([[], []]);
    const numRows = 10;

    const loadCSV = () => {
      if (!file.value) return;

      Papa.parse(file.value, {
        complete: (results) => {
          csvData.value = results.data
            .filter(row => row.length >= 2 && row[0] && row[1])
            .map(row => [{
              value:row[0].trim(),match:row[1].trim()
            }, {
              value:row[1].trim(),match:row[0].trim()
            }
            ]);
          shuffleAndDisplay();
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          // You might want to show an error message to the user here
        }
      });
    };

    const shuffleAndDisplay = () => {
      const shuffled = [...csvData.value].sort(() => Math.random() - 0.5);
      const sliced = shuffled.slice(0,numRows)
      const temp = [
        sliced.map(row => row[0]),
        sliced.map(row => row[1])
      ];
      temp[0] = [...temp[0]].sort(() => Math.random() - 0.5);
      temp[1] = [...temp[1]].sort(() => Math.random() - 0.5);
      displayColumns.value = temp
    };

    return {
      file,
      displayColumns,
      loadCSV,
    };
  }
};
</script>
<style>
  .v-list-item {
    box-shadow: none !important;
    box-sizing: border-box;
    text-align: center;
  }
  .v-list-item.left {
    border-right: 1px white solid !important;
  }
  .v-list-item.left button {
    font-size: 30px;
    padding:25px;
    text-transform: none;
    font-weight: normal;
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif
  }
  .v-list-item.right button {
    font-size: 20px;
    padding:25px;
    text-transform: none;
    font-weight: normal;
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif
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
