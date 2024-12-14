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
      <DisasterMap :selectedYear="selectedYear" />
      <ForestCarbonPlot :selectedYear="selectedYear" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DisasterMap from './components/DisasterMap.vue';
import ForestCarbonPlot from './components/ForestCarbonPlot.vue';

const selectedYear = ref(2023);
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
  justify-content: space-around;
  flex-wrap: wrap;
  margin-top: 20px;
}

#content-wrapper > * {
  flex: 1;
  min-width: 600px;
  margin: 20px;
}
</style>
