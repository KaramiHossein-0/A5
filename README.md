
# Vis-Vue-D3 Project

## Introduction
**Vis-Vue-D3** is a Vue.js-based web application that leverages D3.js and Plotly for visualizing climate and environmental data. The project provides dynamic, interactive visualizations to analyze forest carbon stocks, climate-related disaster frequencies, and other key environmental indicators.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [File Structure](#file-structure)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributors](#contributors)
- [License](#license)

## Features
- Interactive D3.js and Plotly-based visualizations.
- Climate data analysis including forest carbon stocks and disaster frequencies.
- Responsive and modular Vue.js components.
- Slider-based temporal analysis.
- Includes geographical data visualizations using GeoJSON.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/vis-vue-d3.git
   ```
2. Navigate to the project directory:
   ```bash
   cd vis-vue-d3
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage
1. After running "npm run dev", open a browser and navigate to the development server, typically at [http://localhost:5173](http://localhost:5173).
2. Use the slider to adjust the year for temporal data analysis.
3. Explore the interactive charts and maps for environmental insights.

## File Structure
Here is an overview of the project structure:
```
.
├── public
│   ├── 13_Forest_and_Carbon.csv
│   ├── 14_Climate-related_Disasters_Frequency.csv
│   ├── ne_110m_admin_0_countries.geojson
├── src
│   ├── App.vue
│   ├── App_Nu.vue
│   ├── assets
│   │   ├── base.css
│   │   ├── logo.svg
│   │   ├── us-states-geo.json
│   ├── components
│   │   ├── CarbonDeforestationPlot.vue
│   │   ├── DisasterFrequencyPlot.vue
│   │   ├── DisasterMap.vue
│   │   ├── ForestCarbonPlot.vue
│   │   ├── YearSlider.vue
│   ├── stores
│   │   └── store.js
│   ├── main.js
├── package.json
├── LICENSE
├── README.md
```

## Dependencies
- [Vue.js 3.5.12](https://vuejs.org/)
- [D3.js 7.9.0](https://d3js.org/)
- [Pinia 2.2.4](https://pinia.vuejs.org/)
- [Bootstrap 5.3.3](https://getbootstrap.com/)

## Configuration
The project uses Vite for development and build processes. Configuration is stored in `vite.config.js` and `jsconfig.json`.

## Documentation
- Vue Components:
  - **CarbonDeforestationPlot.vue**: Visualizes deforestation and carbon trends.
  - **DisasterFrequencyPlot.vue**: Displays the frequency of climate-related disasters.
  - **DisasterMap.vue**: Maps disaster-prone regions using GeoJSON.
  - **YearSlider.vue**: Allows year-based filtering of data.
- Data Files:
  - **13_Forest_and_Carbon.csv**: Forest and carbon stock data.
  - **14_Climate-related_Disasters_Frequency.csv**: Historical data on climate-related disasters.

## Examples
Here is how you can use the components in your application:
```vue
<template>
  <div>
    <YearSlider />
    <CarbonDeforestationPlot />
    <DisasterFrequencyPlot />
  </div>
</template>
```

## Troubleshooting
1. **Dependency Issues**: Run `npm install` to ensure all dependencies are installed.
2. **Development Server Not Starting**: Ensure no other processes are using the default Vite port (5173). Change the port in `vite.config.js` if needed.
3. **Chart Not Rendering**: Verify that the required data files are correctly placed in the `public` directory.


