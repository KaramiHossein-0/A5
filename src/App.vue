<template>
  <div id="app">
    <h1>Climate Data Visualization</h1>
    <div id="slider-container">
      <label for="year-slider">Select Year: {{ selectedYear }}</label>
      <input
        type="range"
        id="year-slider"
        min="1980"
        max="2023"
        v-model.number="selectedYear"
      />
    </div>
    <div id="content-wrapper">
      <div class="row">
        <DisasterMap @country-selected="handleCountrySelected" :selectedYear="selectedYear" @remove-highlight="handleRemoveHighlight" />
        <CarbonDeforestationPlot :selectedYear="selectedYear" :selectedCountry="selectedCountry" @remove-highlight="handleRemoveHighlight" />
      </div>
      <div class="row">
        <ForestCarbonPlot :selectedYear="selectedYear" />
      </div>
      <div class="row">
        <DisasterFrequencyPlot />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import DisasterMap from './components/DisasterMap.vue';
import ForestCarbonPlot from './components/ForestCarbonPlot.vue';
import CarbonDeforestationPlot from './components/CarbonDeforestationPlot.vue';
import DisasterFrequencyPlot from '@/components/DisasterFrequencyPlot.vue';
const selectedYear = ref(2023);
const selectedCountry = ref(null);

function handleCountrySelected(iso3) {
  selectedCountry.value = iso3;
}

function handleRemoveHighlight() {
  selectedCountry.value = null;
}
</script>
<style>
#app {
  text-align: center;
  font-family: Arial, sans-serif;
}
#slider-container {
  margin: 20px;
}
#content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}
.row {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
.row > * {
  flex: 1;
  min-width: 600px;
  margin: 20px;
}
</style>