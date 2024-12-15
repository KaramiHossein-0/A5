<template>
  <div id="carbon-deforestation-container">
    <h3>Carbon Sequestration vs. Deforestation Rate (Year: {{ selectedYear }})</h3>
    <div id="scatter-plot-area"></div>
  </div>
</template>

<script setup>
import { onMounted, watch, computed } from 'vue';
import * as d3 from 'd3';
import { useStore } from '@/stores/store'; // Adjust the import path as needed

// Use the store
const store = useStore();

// Computed property for selected year from the store
const selectedYear = computed(() => store.getSelectedYear);

let xScale, yScale, sizeScale, svg, xAxisGroup, yAxisGroup, pointsGroup, brushGroup;
const width = 800;
const height = 600;
const margin = { top: 50, right: 50, bottom: 70, left: 90 };

// Data processing function
function processForestAndCarbonData() {
  const forestAndCarbonData = store.getForestCarbon;
  
  if (!forestAndCarbonData || forestAndCarbonData.length === 0) return [];

  // Filter relevant indicators
  const carbonData = forestAndCarbonData.filter(d => d.Indicator === 'Carbon stocks in forests');
  const deforestationData = forestAndCarbonData.filter(d => d.Indicator === 'Forest area');

  // Melt the datasets to bring years into a single column
  const years = d3.range(1992, 2023).map(String);

  const carbonLong = carbonData.flatMap(d =>
    years.map(year => ({
      Country: d.Country,
      ISO3: d.ISO3,
      Year: +year,
      Carbon_Stocks: +d[year] || null
    }))
  );

  const deforestationLong = deforestationData.flatMap(d =>
    years.map(year => ({
      Country: d.Country,
      ISO3: d.ISO3,
      Year: +year,
      Forest_Area: +d[year] || null
    }))
  );

  // Merge carbon and deforestation data
  const mergedData = [];
  for (let c of carbonLong) {
    const def = deforestationLong.find(d => d.Country === c.Country && d.Year === c.Year);
    if (def && c.Carbon_Stocks !== null && def.Forest_Area !== null) {
      mergedData.push({
        ...c,
        Forest_Area: def.Forest_Area
      });
    }
  }

  // Calculate deforestation rate (change in forest area over time)
  mergedData.forEach((d, i, arr) => {
    const prev = arr.find(p => p.Country === d.Country && p.Year === d.Year - 1);
    d.Deforestation_Rate = prev ? d.Forest_Area - prev.Forest_Area : 0;
  });

  return mergedData;
}

// Draw the scatter plot with brushable zoom and tooltips
function drawScatterPlot(data, year) {
  d3.select('#scatter-plot-area').selectAll('*').remove();

  svg = d3.select('#scatter-plot-area')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const filteredData = data.filter(d => d.Year === year && d.Deforestation_Rate !== null && d.Carbon_Stocks !== null);

  // Original scales
  const xDomain = d3.extent(filteredData, d => d.Deforestation_Rate);
  const yDomain = d3.extent(filteredData, d => d.Carbon_Stocks);

  xScale = d3.scaleLinear().domain(xDomain).nice().range([0, width]);
  yScale = d3.scaleLinear().domain(yDomain).nice().range([height, 0]);

  sizeScale = d3.scaleSqrt()
    .domain([0, d3.max(filteredData, d => d.Forest_Area)])
    .range([4, 20]);

  // Axes
  xAxisGroup = svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  yAxisGroup = svg.append('g')
    .call(d3.axisLeft(yScale));

  // Tooltip
  const tooltip = d3.select('#carbon-deforestation-container')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('opacity', 0)
    .style('pointer-events', 'none')
    .style('background', '#fff')
    .style('border', '1px solid #000')
    .style('padding', '5px')
    .style('border-radius', '5px');

  // Brush layer (append before points)
  brushGroup = svg.append('g').attr('class', 'brush');

  // Points
  pointsGroup = svg.append('g').attr('class', 'points-group');

  pointsGroup.selectAll('circle')
    .data(filteredData)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.Deforestation_Rate))
    .attr('cy', d => yScale(d.Carbon_Stocks))
    .attr('r', d => sizeScale(d.Forest_Area))
    .attr('fill', 'steelblue')
    .attr('opacity', 0.7)
    .style('pointer-events', 'all')
    .on('mouseover', (event, d) => {
      tooltip.style('opacity', 1)
        .html(`<strong>${d.Country}</strong><br>Deforestation Rate: ${d.Deforestation_Rate.toFixed(2)}<br>Carbon Stocks: ${d.Carbon_Stocks.toFixed(2)}<br>Forest Area: ${d.Forest_Area.toFixed(2)}`);
      d3.select(event.currentTarget).attr('fill', 'orange');
    })
    .on('mousemove', (event) => {
      tooltip.style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 20) + 'px');
    })
    .on('mouseout', (event) => {
      tooltip.style('opacity', 0);
      d3.select(event.currentTarget).attr('fill', 'steelblue');
    });

  const brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on('end', brushed);

  brushGroup.call(brush);

  function brushed(event) {
    if (!event.selection) return;
    const [[x0, y0], [x1, y1]] = event.selection;

    xScale.domain([xScale.invert(x0), xScale.invert(x1)]);
    yScale.domain([yScale.invert(y1), yScale.invert(y0)]);

    xAxisGroup.transition().duration(500).call(d3.axisBottom(xScale));
    yAxisGroup.transition().duration(500).call(d3.axisLeft(yScale));

    pointsGroup.selectAll('circle')
      .transition().duration(500)
      .attr('cx', d => xScale(d.Deforestation_Rate))
      .attr('cy', d => yScale(d.Carbon_Stocks));

    brushGroup.call(brush.move, null);
  }

  // Double-click to reset zoom
  svg.on('dblclick', () => {
    xScale.domain(xDomain);
    yScale.domain(yDomain);

    xAxisGroup.transition().duration(500).call(d3.axisBottom(xScale));
    yAxisGroup.transition().duration(500).call(d3.axisLeft(yScale));

    pointsGroup.selectAll('circle')
      .transition().duration(500)
      .attr('cx', d => xScale(d.Deforestation_Rate))
      .attr('cy', d => yScale(d.Carbon_Stocks));
  });
}

// Function to load and draw data
function loadAndDrawData() {
  const processedData = processForestAndCarbonData();
  if (processedData.length > 0) {
    drawScatterPlot(processedData, selectedYear.value);
  }
}

// Watch for changes in selected year and forest carbon data
watch([selectedYear, () => store.getForestCarbon], loadAndDrawData);

// Initial data load
onMounted(async () => {
  // Ensure data is loaded from the store
  if (store.getForestCarbon.length === 0) {
    await store.loadData();
  }
  loadAndDrawData();
});
</script>

<style scoped>
.tooltip {
  font-size: 12px;
  background: white;
  border: 1px solid black;
  padding: 5px;
  border-radius: 5px;
  pointer-events: none;
  z-index: 10;
}
</style>