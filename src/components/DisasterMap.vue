<template>
    <div id="container">
      <h2>Climate Related Disaster Frequency for {{ selectedYear }}</h2>
      <div id="map-container"></div>
      <div id="legend-container"></div>
      <!-- Tooltip -->
      <div id="tooltip"></div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, watch } from 'vue';
  import * as d3 from 'd3';
  
  const props = defineProps({
    selectedYear: Number
  });
  
  let disasterData = [];
  let geoData = {};
  let svg, colorScale, projection, pathGenerator;
  
  const width = 600;  // Reduced width for the map
  const height = 400; // Reduced height for the map
  
  // Load the CSV and GeoJSON data
  async function loadData() {
    try {
      disasterData = await d3.csv('/public/14_Climate-related_Disasters_Frequency.csv');
      geoData = await d3.json('/public/ne_110m_admin_0_countries.geojson');
      console.log('Data loaded:', disasterData, geoData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
  
  // Initialize the map
  function initializeMap() {
    svg = d3.select('#map-container')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  
    projection = d3.geoEquirectangular()
      .scale(100) // Adjusted scale for smaller size
      .translate([width / 2, height / 2]);
  
    pathGenerator = d3.geoPath().projection(projection);
  
    colorScale = d3.scaleSequentialLog(d3.interpolateViridis)
      .domain([1, 100]); // Adjust domain based on your data range
  
    // Create the legend after initializing the map
    createLegend();
  }
  
  // Update the map with hover functionality
  function updateMap(year) {
    console.log('Updating map for year:', year);
  
    const yearData = disasterData
      .filter(d => d.Indicator === 'Climate related disasters frequency, Number of Disasters: TOTAL')
      .map(d => ({
        iso3: d.ISO3,
        frequency: +d[year] || 0
      }));
  
    // Tooltip setup
    const tooltip = d3.select('#tooltip');
  
    svg.selectAll('path')
      .data(geoData.features)
      .join('path')
      .attr('d', pathGenerator)
      .attr('fill', d => {
        const countryData = yearData.find(c => c.iso3 === d.properties.ISO_A3);
        return countryData && countryData.frequency > 0 ? colorScale(countryData.frequency) : '#ccc';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.5)
      .on('mouseover', (event, d) => {
        const countryData = yearData.find(c => c.iso3 === d.properties.ISO_A3);
        const frequency = countryData ? countryData.frequency : 'No data';
  
        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.properties.NAME}</strong><br>Disaster Frequency: ${frequency}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      });
  }
  
  // Create the horizontal legend for the color scale
  function createLegend() {
    const legendWidth = 300;
    const legendHeight = 20;
    const legendMargin = { top: 20, right: 10, bottom: 30, left: 10 };
  
    const legendSvg = d3.select('#legend-container')
      .append('svg')
      .attr('width', legendWidth + legendMargin.left + legendMargin.right)
      .attr('height', legendHeight + legendMargin.top + legendMargin.bottom)
      .append('g')
      .attr('transform', `translate(${legendMargin.left}, ${legendMargin.top})`);
  
    // Define a gradient for the legend
    const gradient = legendSvg.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
  
    // Create stops for the gradient using the Viridis color palette
    const gradientStops = d3.range(0, 1.1, 0.1);
    gradient.selectAll('stop')
      .data(gradientStops)
      .enter()
      .append('stop')
      .attr('offset', d => `${d * 100}%`)
      .attr('stop-color', d => d3.interpolateViridis(d));
  
    // Draw the legend rectangle with the gradient
    legendSvg.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)');
  
    // Add a scale for the legend
    const legendScale = d3.scaleLog()
      .domain([1, 100])
      .range([0, legendWidth]);
  
    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5, '~g');
  
    legendSvg.append('g')
      .attr('transform', `translate(0, ${legendHeight + 5})`)
      .call(legendAxis)
      .selectAll('text')
      .style('font-size', '12px');
  
    legendSvg.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Number of Disasters');
  }
  
  // Watch for year changes and update the map
  watch(() => props.selectedYear, (newYear) => {
    updateMap(newYear);
  });
  
  // Load data and initialize map on mount
  onMounted(async () => {
    await loadData();
    initializeMap();
    updateMap(props.selectedYear);
  });
  </script>
  
  <style>
  #container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  #map-container {
    width: 600px;
    height: 400px;
    margin-bottom: 20px;
  }
  
  #legend-container {
    width: 300px;
  }
  
  #tooltip {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
  }
  </style>
  