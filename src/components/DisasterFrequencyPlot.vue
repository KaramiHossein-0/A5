<template>
  <div>
    <h2>Climate-Related Disaster Frequency by Country (1980-2023)</h2>
    <div ref="disasterChart"></div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref, computed } from 'vue';
import Plotly from 'plotly.js-dist';
import { useStore } from '@/stores/store'; // Adjust the import path as needed

// Use the store
const store = useStore();
const disasterChart = ref(null);

// Computed property for disaster data from the store
const disasterData = computed(() => store.getClimateDisaster);

// Function to process disaster data
function processDisasterData() {
  if (!disasterData.value || disasterData.value.length === 0) return [];

  // Filter data for "Climate related disasters frequency, Number of Disasters: TOTAL"
  const totalDisasters = disasterData.value.filter(
    (d) => d.Indicator === 'Climate related disasters frequency, Number of Disasters: TOTAL'
  );

  // Reshape the dataset to bring year columns into a single column
  const reshapedData = [];
  totalDisasters.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key.match(/^\d{4}$/) && row[key]) {
        reshapedData.push({
          Country: row.Country,
          Year: parseInt(key, 10),
          Disaster_Frequency: parseFloat(row[key]),
        });
      }
    });
  });

  // Group data by country
  const countries = {};
  reshapedData.forEach((entry) => {
    if (!countries[entry.Country]) {
      countries[entry.Country] = { x: [], y: [], type: 'scatter', mode: 'lines', name: entry.Country };
    }
    countries[entry.Country].x.push(entry.Year);
    countries[entry.Country].y.push(entry.Disaster_Frequency);
  });

  return Object.values(countries);
}

// Function to draw the Plotly chart
function drawDisasterChart() {
  const traces = processDisasterData();

  if (traces.length === 0) {
    console.warn('No disaster data available to plot.');
    return;
  }

  // Initially hide all traces
  traces.forEach(trace => {
    trace.visible = 'legendonly';
    // trace.hoverinfo = 'x+y+name'; // Remove mouse hover for lines
  });

  const layout = {
    title: 'Climate-Related Disaster Frequency by Country (1980-2023)',
    xaxis: {
      title: 'Year',
      rangeselector: {
        buttons: [
          { count: 5, label: 'Last 5 Years', step: 'year', stepmode: 'backward' },
          { count: 10, label: 'Last 10 Years', step: 'year', stepmode: 'backward' },
          { count: 20, label: 'Last 20 Years', step: 'year', stepmode: 'backward' },
          { step: 'all', label: 'All Years' },
        ],
      },
      rangeslider: { visible: true },
    },
    yaxis: {
      title: 'Disaster Frequency',
    },
    template: 'plotly_white',
  };

  Plotly.newPlot(disasterChart.value, traces, layout);
}

// Load and draw data when the component is mounted
onMounted(async () => {
  if (store.getClimateDisaster.length === 0) {
    await store.loadData(); // Load data from the store if not already loaded
  }
  drawDisasterChart();
});

// Watch for changes in the disaster data and redraw the chart
watch(disasterData, drawDisasterChart);
</script>

<style scoped>
div {
  width: 100%;
  height: 500px;
}
</style>
