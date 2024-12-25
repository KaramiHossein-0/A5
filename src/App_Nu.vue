<template>
    <div id="app" class="dashboard">
      <header class="dashboard-header">
        <h1>Climate Data Dashboard</h1>
      </header>
     
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Global Disaster Map</h2>
            <div class="year-selector">
              <label for="disaster-map-year">Year: {{ sharedYear }}</label>
              <input
                type="range"
                id="disaster-map-year"
                min="1980"
                max="2023"
                v-model.number="sharedYear"
              />
            </div>
          </div>
          <DisasterMap :selectedYear="sharedYear" />
        </div>
       
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Forest Carbon Trends</h2>
            <div class="year-selector">
              <label for="forest-carbon-year">Year: {{ sharedYear }}</label>
              <input
                type="range"
                id="forest-carbon-year"
                min="1980"
                max="2023"
                v-model.number="sharedYear"
              />
            </div>
          </div>
          <ForestCarbonPlot :selectedYear="sharedYear" />
        </div>
       
        <div class="dashboard-card">
          <div class="card-header">
            <h2>Carbon Deforestation Analysis</h2>
            <div class="year-selector">
              <label for="deforestation-year">Year: {{ sharedYear }}</label>
              <input
                type="range"
                id="deforestation-year"
                min="1980"
                max="2023"
                v-model.number="sharedYear"
              />
            </div>
          </div>
          <CarbonDeforestationPlot :selectedYear="sharedYear" />
        </div>
       
        <div class="dashboard-card">
          <h2>Disaster Frequency Overview</h2>
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
  
  const sharedYear = ref(2023);
  </script>
  
  <style scoped>
  .dashboard {
    max-width: 1600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f4f6f9;
    min-height: 100vh;
  }
  .dashboard-header {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .dashboard-header h1 {
    color: #2c3e50;
    margin-bottom: 15px;
    font-size: 1.8rem;
    text-align: center;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  .year-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  .year-selector label {
    font-weight: bold;
    color: #34495e;
    font-size: 0.9rem;
  }
  .year-selector input[type="range"] {
    width: 150px;
    accent-color: #3498db;
  }
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  .dashboard-card {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }
  .dashboard-card:hover {
    transform: translateY(-5px);
  }
  .dashboard-card h2 {
    color: #2c3e50;
    margin-bottom: 15px;
    font-size: 1.2rem;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
  }
  @media (max-width: 1200px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
  </style>