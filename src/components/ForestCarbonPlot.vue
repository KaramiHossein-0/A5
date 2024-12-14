<template>
  <div id="forest-container">
    <h3>Forest Cover Change Over Time by Country (Year: {{ selectedYear }})</h3>
    
    <div class="controls">
      <div class="country-selector-controls">
        <button @click="selectAllCountries">Select All</button>
        <button @click="deselectAllCountries">Deselect All</button>
      </div>
      <div class="country-selector-box">
        <div class="country-selector">
          <label 
            v-for="country in allCountries" 
            :key="country" 
            class="checkbox-label"
          >
            <input 
              type="checkbox" 
              :value="country"
              v-model="selectedCountries"
            />
            {{ country }}
          </label>
        </div>
      </div>
    </div>

    <div id="plot-area"></div>
  </div>
</template>

<script setup>
import { onMounted, watch, defineProps, ref } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
  selectedYear: {
    type: Number,
    required: true
  }
});

let forestData = [];
const allCountries = ref([]);
const selectedCountries = ref([]);

// Load the forest and carbon data
async function loadForestData() {
  try {
    forestData = await d3.csv('/public/13_Forest_and_Carbon.csv');
    forestData = forestData.filter(d => d.Indicator === 'Forest area');
    
    // Extract unique countries and sort alphabetically
    allCountries.value = [...new Set(forestData.map(d => d.Country))].sort();
    
    console.log('Loaded Forest Data:', forestData);
  } catch (error) {
    console.error('Error loading forest data:', error);
  }
}

// Select all countries
function selectAllCountries() {
  selectedCountries.value = [...allCountries.value];
}

// Deselect all countries and clear the plot
function deselectAllCountries() {
  selectedCountries.value = [];
  updateForestPlot(props.selectedYear); // Clear the plot by updating with no selected countries
}

// Update the bar chart for the selected year and countries
function updateForestPlot(year) {
  d3.select('#plot-area').selectAll('*').remove();
  const forestWidth = 600;
  const forestHeight = 800;
  const margin = { top: 50, right: 50, bottom: 50, left: 150 };

  const svg = d3.select('#plot-area')
    .append('svg')
    .attr('width', forestWidth + margin.left + margin.right)
    .attr('height', forestHeight + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Create a tooltip div outside of the SVG
  let tooltip = d3.select('#forest-container').select('.tooltip');

  // Create tooltip if it doesn't already exist
  if (tooltip.empty()) {
    tooltip = d3.select('#forest-container')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('opacity', 0)
      .style('pointer-events', 'none')
      .style('background', 'white')
      .style('border', '1px solid black')
      .style('padding', '5px')
      .style('border-radius', '5px')
      .style('z-index', '10');
  }

  // Prepare the data for the selected year and countries
  const filteredData = forestData
    .filter(d => selectedCountries.value.includes(d.Country))
    .map(d => ({
      Country: d.Country,
      Forest_Area: +d[year],
    }))
    .filter(d => !isNaN(d.Forest_Area));

  if (filteredData.length === 0) {
    svg.append('text')
      .attr('x', forestWidth / 2)
      .attr('y', forestHeight / 2)
      .attr('text-anchor', 'middle')
      .text('No data available for the selected countries and year');
    return;
  }

  // Sort data by Forest_Area
  filteredData.sort((a, b) => b.Forest_Area - a.Forest_Area);

  const yScale = d3.scaleBand()
    .domain(filteredData.map(d => d.Country))
    .range([0, forestHeight])
    .padding(0.1);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(filteredData, d => d.Forest_Area)])
    .range([0, forestWidth]);

  // Draw bars
  svg.selectAll('.bar')
    .data(filteredData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', d => yScale(d.Country))
    .attr('width', d => xScale(d.Forest_Area))
    .attr('height', yScale.bandwidth())
    .attr('fill', 'steelblue')
    .on('mouseover', function (event, d) {
      d3.select(this).attr('fill', 'orange');

      tooltip
        .style('opacity', 1)
        .html(`<strong>${d.Country}</strong><br>Forest Area: ${d.Forest_Area.toLocaleString()} HA`)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY + 15) + 'px');
    })
    .on('mousemove', function (event) {
      tooltip
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY + 15) + 'px');
    })
    .on('mouseout', function () {
      d3.select(this).attr('fill', 'steelblue');
      tooltip.style('opacity', 0);
    });

  // Add axes
  svg.append('g')
    .call(d3.axisLeft(yScale).tickSize(0).tickPadding(10));
  
  svg.append('g')
    .attr('transform', `translate(0, ${forestHeight})`)
    .call(d3.axisBottom(xScale));

  // Add titles
  svg.append('text')
    .attr('x', forestWidth / 2)
    .attr('y', -20)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .text(`Forest Area in ${year}`);
  
  svg.append('text')
    .attr('x', forestWidth / 2)
    .attr('y', forestHeight + 40)
    .attr('text-anchor', 'middle')
    .text('Forest Area (1000 HA)');
}



// Watch for year changes and update the plot
watch(() => props.selectedYear, (newYear) => {
  updateForestPlot(newYear);
});

// Watch for country selections and update the plot
watch(selectedCountries, () => {
  updateForestPlot(props.selectedYear);
});

onMounted(async () => {
  await loadForestData();
});
</script>

<style scoped>
#forest-container {
  width: 800px;
  margin: 20px auto;
  text-align: center;
}

/* Controls Container */
.controls {
  margin-bottom: 20px;
}

/* Buttons for Select All / Deselect All */
.country-selector-controls button {
  margin: 0 10px;
  padding: 5px 10px;
  cursor: pointer;
}

/* Box for Checkboxes */
.country-selector-box {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  max-height: 250px;
  overflow-y: auto;
  margin-top: 10px;
  background-color: #f9f9f9;
}

/* Checkbox List */
.country-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Individual Checkbox Label */
.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 14px;
}

/* Checkbox Input */
.checkbox-label input {
  margin-right: 10px;
}
</style>
