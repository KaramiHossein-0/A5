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
import { onMounted, watch, defineProps, ref, computed } from 'vue';
import * as d3 from 'd3';
import { useStore } from '@/stores/store';

const store = useStore();

const props = defineProps({
  selectedYear: {
    type: Number,
    required: true
  }
});

const allCountries = ref([]);
const selectedCountries = ref([]);
const forestData = computed(() => store.getForestCarbon);

function selectAllCountries() {
  allCountries.value = [...new Set(forestData.value.map(d => d.Country))].sort();
  selectedCountries.value = [...allCountries.value];
}

function deselectAllCountries() {
  selectedCountries.value = [];
  updateForestPlot(props.selectedYear);
}

function updateForestPlot(year) {
  d3.select('#plot-area').selectAll('*').remove();
  const forestWidth = 800; // Adjusted width
  const forestHeight = 600; // Adjusted height
  const margin = { top: 50, right: 50, bottom: 150, left: 70 }; // Adjusted margins

  const svg = d3.select('#plot-area')
    .append('svg')
    .attr('width', forestWidth + margin.left + margin.right)
    .attr('height', forestHeight + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  let tooltip = d3.select('body').select('.tooltip');

  if (tooltip.empty()) {
    tooltip = d3.select('body')
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

  const filteredData = forestData.value
    .filter(d => selectedCountries.value.includes(d.Country) && d.Indicator === 'Forest area')
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

  filteredData.sort((a, b) => b.Forest_Area - a.Forest_Area);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(filteredData, d => d.Forest_Area)])
    .range([forestHeight, 0]);

  const xScale = d3.scaleBand()
    .domain(filteredData.map(d => d.Country))
    .range([0, forestWidth])
    .padding(0.1);

  svg.selectAll('.bar')
    .data(filteredData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.Country))
    .attr('y', d => yScale(d.Forest_Area))
    .attr('width', xScale.bandwidth())
    .attr('height', d => forestHeight - yScale(d.Forest_Area))
    .attr('fill', 'steelblue')
    .on('mouseover', function (event, d) {
      d3.select(this).attr('fill', 'orange');

      tooltip
        .style('opacity', 1)
        .html(`<strong>${d.Country}</strong><br>Forest Area: ${d.Forest_Area.toLocaleString()} HA`)
        .style('left', `${event.pageX + 15}px`)
        .style('top', `${event.pageY + 15}px`);
    })
    .on('mousemove', function (event) {
      tooltip
        .style('left', `${event.pageX + 15}px`)
        .style('top', `${event.pageY + 15}px`);
    })
    .on('mouseout', function () {
      d3.select(this).attr('fill', 'steelblue');
      tooltip.style('opacity', 0);
    });

  svg.append('g')
    .call(d3.axisLeft(yScale));
  
  svg.append('g')
    .attr('transform', `translate(0, ${forestHeight})`)
    .call(d3.axisBottom(xScale).tickSize(0).tickPadding(10))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append('text')
    .attr('x', forestWidth / 2)
    .attr('y', forestHeight + margin.bottom - 10)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .text(`Forest Area in ${year}`);

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left - 5)
    .attr('x', -forestHeight  / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Forest Area (HA)');

  svg.append('text')
    .attr('x', forestWidth / 2)
    .attr('y', forestHeight + margin.bottom - 50)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .text('Country');
}

watch(() => props.selectedYear, (newYear) => {
  updateForestPlot(newYear);
});

watch(selectedCountries, () => {
  updateForestPlot(props.selectedYear);
});

onMounted(async () => {
  if (store.getForestCarbon.length === 0) {
    await store.loadData();
  }
  allCountries.value = [...new Set(forestData.value.map(d => d.Country))].sort();
  updateForestPlot(props.selectedYear);
});
</script>

<style scoped>
#forest-container {
  width: 800px;
  margin: 20px auto;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.controls {
  margin-bottom: 20px;
}

.country-selector-controls button {
  margin: 0 10px;
  padding: 5px 10px;
  cursor: pointer;
}

.country-selector-box {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  max-height: 250px;
  overflow-y: auto;
  margin-top: 10px;
  background-color: #f9f9f9;
}

.country-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.checkbox-label input {
  margin-right: 10px;
}

#plot-area {
  position: relative;
  width: 100%;
  overflow: visible;
}

.tooltip {
  font-size: 14px;
  line-height: 1.5;
  position: absolute;
  opacity: 0;
  pointer-events: none;
  background: white;
  border: 1px solid black;
  padding: 5px;
  border-radius: 5px;
  z-index: 10;
}
</style>
