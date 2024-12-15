import { defineStore } from 'pinia';
import * as d3 from 'd3';

export const useStore = defineStore({
  id: 'main',
  state: () => ({
    selectedYear: 2006,
    selectedStates: [],
    forest_carbon: [],
    climate_disaster: [],
    geo: [],
  }),

  actions: {
    async loadData() {
      const forest_carbon = await d3.csv('./13_Forest_and_Carbon.csv');
      const climate_disaster = await d3.csv('./14_Climate-related_Disasters_Frequency.csv');
      const geo = await d3.json('./ne_110m_admin_0_countries.geojson');

      this.forest_carbon = forest_carbon;
      this.climate_disaster = climate_disaster;
      this.geo = geo;
    },
    changeSelectedYear(year) {
      this.selectedYear = year;
    },
    // changeSelectedState(state) {
    //   this.selectedStates.push(state);
    // },
  },

  getters: {
    getSelectedYear: (state) => state.selectedYear,
    getForestCarbon: (state) => state.forest_carbon,
    getClimateDisaster: (state) => state.climate_disaster,
    getGeoData: (state) => state.geo,
  },
});
