
# Vis-Vue-D3

## Introduction
Vis-Vue-D3 is a data visualization project using Vue.js and D3.js to create interactive visualizations related to environmental and climate data. The project provides insights into forest carbon, deforestation, climate-related disasters, and risk indices through dynamic and responsive plots.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [File Structure](#file-structure)
- [Configuration](#configuration)
- [Contributors](#contributors)
- [License](#license)

## Features
- Interactive data visualizations using Vue.js and D3.js.
- Displays forest carbon stocks, deforestation data, and climate-related risks.
- Includes a dynamic year slider to filter data.
- Data sourced from public datasets in CSV and GeoJSON formats.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repository/vis-vue-d3.git
   ```
2. Navigate to the project directory:
   ```bash
   cd vis-vue-d3
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage
1. Run the development server:
   ```bash
   npm run dev
   ```
2. Build for production:
   ```bash
   npm run build
   ```
3. Preview the build:
   ```bash
   npm run preview
   ```

## Dependencies
- [Vue.js ^3.5.12](https://vuejs.org/)
- [D3.js ^7.9.0](https://d3js.org/)
- [Pinia ^2.2.4](https://pinia.vuejs.org/)
- [Plotly.js ^2.35.3](https://plotly.com/javascript/)
- [Bootstrap ^5.3.3](https://getbootstrap.com/)

## File Structure
```
.
├── public/
│   ├── 13_Forest_and_Carbon.csv
│   ├── 14_Climate-related_Disasters_Frequency.csv
│   ├── ne_110m_admin_0_countries.geojson
├── src/
│   ├── App.vue
│   ├── App_Nu.vue
│   ├── main.js
│   ├── assets/
│   │   ├── base.css
│   │   ├── logo.svg
│   │   ├── us-states-geo.json
│   ├── components/
│   │   ├── CarbonDeforestationPlot.vue
│   │   ├── DisasterFrequencyPlot.vue
│   │   ├── DisasterMap.vue
│   │   ├── ForestCarbonPlot.vue
│   │   ├── YearSlider.vue
│   ├── stores/
│       ├── store.js
├── vite.config.js
├── package.json
├── LICENSE
```

## Configuration
- Use `vite.config.js` for project build configuration.
- Update `jsconfig.json` for module path mapping.


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
