<template>
  <div id="carbon-deforestation-container">
    <h3>Carbon Sequestration vs. Deforestation Rate (Year: {{ selectedYear }})</h3>
    <div id="scatter-plot-area" class="relative"></div>
    <div v-if="noData" class="no-data-message">No data available for the selected year</div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as d3 from 'd3';
import { useStore } from '@/stores/store';

const props = defineProps({
  selectedYear: Number,
  selectedCountry: String
});

const store = useStore();

const emit = defineEmits(['remove-highlight']);
const noData = ref(false);

// Keep track of scales and groups globally
let xScale, yScale, sizeScale, xAxisGroup, yAxisGroup, pointsGroup, brushGroup, svg;

watch(() => props.selectedYear, (newYear) => {
  drawScatterPlot(processForestAndCarbonData(), newYear);
});

watch(() => props.selectedCountry, (newCountry) => {
  highlightCountry(newCountry);
});

function processForestAndCarbonData() {
  const forestAndCarbonData = store.getForestCarbon;
  if (!forestAndCarbonData || forestAndCarbonData.length === 0) return [];

  const carbonData = forestAndCarbonData.filter(d => d.Indicator === 'Carbon stocks in forests');
  const deforestationData = forestAndCarbonData.filter(d => d.Indicator === 'Forest area');
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

  mergedData.forEach((d, i, arr) => {
    const prev = arr.find(p => p.Country === d.Country && p.Year === d.Year - 1);
    d.Deforestation_Rate = prev ? ((d.Forest_Area - prev.Forest_Area) / prev.Forest_Area) * 100 : 0;
  });

  return mergedData;
}

function drawScatterPlot(data, year) {
  const width = 800;
  const height = 600;
  const margin = { top: 50, right: 50, bottom: 70, left: 90 };

  d3.select('#scatter-plot-area').selectAll('*').remove();

  svg = d3.select('#scatter-plot-area')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const filteredData = data.filter(d => d.Year === year && d.Deforestation_Rate !== null && d.Carbon_Stocks !== null);

  noData.value = filteredData.length === 0;

  if (noData.value) {
    return;
  }

  const xDomain = d3.extent(filteredData, d => d.Deforestation_Rate);
  const yDomain = d3.extent(filteredData, d => d.Carbon_Stocks);

  xScale = d3.scaleLinear().domain(xDomain).nice().range([0, width]);
  yScale = d3.scaleLinear().domain(yDomain).nice().range([height, 0]);
  sizeScale = d3.scaleSqrt()
    .domain([0, d3.max(filteredData, d => d.Forest_Area)])
    .range([4, 20]);

  xAxisGroup = svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  yAxisGroup = svg.append('g')
    .call(d3.axisLeft(yScale));

  // Add axis labels
  svg.append('text')
    .attr('class', 'x-axis-label')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 10)
    .text('Deforestation Rate');

  svg.append('text')
    .attr('class', 'y-axis-label')
    .attr('text-anchor', 'middle')
    .attr('x', -height / 2)
    .attr('y', -margin.left + 20)
    .attr('transform', 'rotate(-90)')
    .text('Carbon Stocks');

  const tooltip = d3.select('#scatter-plot-area')
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('opacity', 0)
    .style('pointer-events', 'none')
    .style('background', '#fff')
    .style('border', '1px solid #000')
    .style('padding', '5px')
    .style('border-radius', '5px');

  brushGroup = svg.append('g').attr('class', 'brush');
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
        .html(`<strong>${d.Country}</strong><br>Deforestation Rate: ${d.Deforestation_Rate.toFixed(2)}%<br>Carbon Stocks: ${d.Carbon_Stocks.toFixed(2)}<br>Forest Area: ${d.Forest_Area.toFixed(2)}`);
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

function highlightCountry(iso3) {
  pointsGroup.selectAll('circle')
    .attr('stroke', d => d.ISO3 === iso3 ? 'red' : 'none')
    .attr('stroke-width', d => d.ISO3 === iso3 ? 3 : 0);
}

// Add this function to remove highlights
function removeHighlight() {
  pointsGroup.selectAll('circle')
    .attr('stroke', 'none')
    .attr('stroke-width', 0);

  // Emit the remove-highlight event on the document
  const event = new Event('remove-highlight');
  document.dispatchEvent(event);
}

onMounted(async () => {
  if (store.getForestCarbon.length === 0) {
    await store.loadData();
  }
  drawScatterPlot(processForestAndCarbonData(), props.selectedYear);

  // Add event listener to remove highlight when clicking outside the map
  d3.select('#scatter-plot-area').on('click', (event) => {
    if (event.target.tagName !== 'circle') {
      removeHighlight();
      emit('remove-highlight');
    }
  });

  // Remove the event listener added to the document
  // document.addEventListener('click', (event) => {
  //   if (!event.target.closest('#scatter-plot-area')) {
  //     removeHighlight();
  //     emit('remove-highlight');
  //   }
  // });
});
</script>

<style scoped>
#carbon-deforestation-container {
  width: 800px;
  margin: 20px auto;
  text-align: center;
}

.tooltip {
  z-index: 1000;
}

.no-data-message {
  color: red;
  font-weight: bold;
  margin-top: 20px;
}
</style>