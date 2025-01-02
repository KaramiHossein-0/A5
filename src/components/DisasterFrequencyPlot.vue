<template>
  <div id="disaster-container">
    <h3>Climate-Related Disaster Frequency by Country (1980-2023)</h3>

    <div class="controls">
      <div class="country-selector-controls">
        <button @click="selectAllCountries">Select All</button>
        <button @click="deselectAllCountries">Deselect All</button>
      </div>
      <div class="country-selector-box">
        <div class="country-selector">
          <label 
            v-for="country in countries" 
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

    <div id="disaster-chart"></div>
  </div>
</template>

<script setup>
import { onMounted, watch, ref } from 'vue';
import * as d3 from 'd3';
import { useStore } from '@/stores/store';

const store = useStore();
const selectedCountries = ref([]);
const countries = ref([]);

const margin = { top: 50, right: 150, bottom: 120, left: 60 };
const width = window.innerWidth - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const brushHeight = 80;

const processData = (rawData) => {
  if (!rawData || rawData.length === 0) return [];
  
  const totalDisasters = rawData.filter(
    d => d.Indicator === 'Climate related disasters frequency, Number of Disasters: TOTAL'
  );

  const reshapedData = [];
  totalDisasters.forEach(row => {
    Object.keys(row).forEach(key => {
      if (key.match(/^\d{4}$/) && row[key]) {
        reshapedData.push({
          country: row.Country,
          year: parseInt(key),
          frequency: parseFloat(row[key])
        });
      }
    });
  });

  countries.value = [...new Set(reshapedData.map(d => d.country))].sort();
  return reshapedData;
};

const createChart = (data) => {
  d3.select("#disaster-chart").selectAll("*").remove();

  const svg = d3.select("#disaster-chart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + brushHeight)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const filteredData = selectedCountries.value.length ? 
    data.filter(d => selectedCountries.value.includes(d.country)) : 
    data;

  const groupedData = d3.group(filteredData, d => d.country);
  
  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => new Date(d.year, 0)))
    .range([0, width]);

  const xScale2 = d3.scaleTime()
    .domain(xScale.domain())
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.frequency)])
    .range([height, 0]);

  const yScale2 = d3.scaleLinear()
    .domain(yScale.domain())
    .range([brushHeight, 0]);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%Y")))
    .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));

  const line = d3.line()
    .x(d => xScale(new Date(d.year, 0)))
    .y(d => yScale(d.frequency));

  const line2 = d3.line()
    .x(d => xScale2(new Date(d.year, 0)))
    .y(d => yScale2(d.frequency));

  const mainChart = svg.append("g")
    .attr("class", "main-chart")
    .attr("clip-path", "url(#clip)");

  svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

  groupedData.forEach((countryData, country) => {
    mainChart.append("path")
      .datum(countryData)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", colorScale(country))
      .attr("stroke-width", 1.5)
      .attr("d", line);
  });

  const context = svg.append("g")
    .attr("class", "context")
    .attr("transform", `translate(0,${height + margin.top})`);

  groupedData.forEach((countryData, country) => {
    context.append("path")
      .datum(countryData)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", colorScale(country))
      .attr("stroke-width", 1)
      .attr("d", line2)
      .style("opacity", 0.3);
  });

  context.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${brushHeight})`)
    .call(d3.axisBottom(xScale2));

  const brush = d3.brushX()
    .extent([[0, 0], [width, brushHeight]])
    .on("brush end", brushed);

  context.append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, xScale.range());

  function brushed(event) {
    if (event.selection) {
      const [x0, x1] = event.selection;
      xScale.domain([xScale2.invert(x0), xScale2.invert(x1)]);
      
      const filteredData = selectedCountries.value.length ? 
        data.filter(d => selectedCountries.value.includes(d.country)) : 
        data;
      
      const newYDomain = [
        0, 
        d3.max(filteredData.filter(d => xScale.domain()[0] <= new Date(d.year, 0) && new Date(d.year, 0) <= xScale.domain()[1]), d => d.frequency)
      ];
      yScale.domain(newYDomain);

      mainChart.selectAll(".line")
        .attr("d", function(d) {
          return line(d);
        });
      
      svg.select(".x-axis").call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat("%Y")))
        .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");

      svg.select(".y-axis").call(d3.axisLeft(yScale));
    }
  }

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Climate-Related Disaster Frequency by Country (1980-2023)");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left)
    .attr("x", -height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Disaster Frequency");
};

function selectAllCountries() {
  selectedCountries.value = [...countries.value];
}

function deselectAllCountries() {
  selectedCountries.value = [];
}

onMounted(async () => {
  if (store.getClimateDisaster.length === 0) {
    await store.loadData();
  }
  processData(store.getClimateDisaster);
});

watch([() => store.getClimateDisaster, selectedCountries], ([newData, newSelectedCountries]) => {
  if (newSelectedCountries.length > 0) {
    const processedData = processData(newData);
    createChart(processedData);
  } else {
    d3.select("#disaster-chart").selectAll("*").remove();
  }
}, { deep: true });
</script>

<style scoped>
#disaster-container {
  width: 100%;
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

#disaster-chart {
  width: 100%;
  height: 600px;
}

.brush .selection {
  fill: #69b3a2;
  fill-opacity: 0.2;
  stroke: #000;
  stroke-width: 1px;
}
</style>
