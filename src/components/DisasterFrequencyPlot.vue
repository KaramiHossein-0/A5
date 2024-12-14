<template>
    <div>
      <h2>Climate-Related Disaster Frequency by Country (1980-2023)</h2>
      <div ref="disasterChart"></div>
    </div>
  </template>
  
  <script>
  import Plotly from 'plotly.js-dist';
  import * as d3 from 'd3';
  
  export default {
    name: 'DisasterFrequencyPlot',
    data() {
      return {
        disasterData: null,
      };
    },
    mounted() {
      this.loadAndRenderChart();
    },
    methods: {
      async loadAndRenderChart() {
        try {
          // Load the CSV file
          const data = await d3.csv('/public/14_Climate-related_Disasters_Frequency.csv');
  
          // Filter data for "Climate related disasters frequency, Number of Disasters: TOTAL"
          const totalDisasters = data.filter(
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
  
          // Prepare the plot traces
          const traces = Object.values(countries);
  
          // Define layout with range slider and selectors
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
  
          // Plot the chart
          Plotly.newPlot(this.$refs.disasterChart, traces, layout);
        } catch (error) {
          console.error('Error loading or processing data:', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
    div {
      width: 100%;
      height: 500px;
    }
  </style>
  