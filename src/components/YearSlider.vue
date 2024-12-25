<template>
  <div class="slider-container">
    <input
      type="range"
      :min="1980"
      :max="2023"
      v-model.number="year"
      @input="emitYearChange"
    />
    <p>Selected Year: {{ year }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Local year state
const year = ref(1980);

// Emit event to parent when the year changes
const emit = defineEmits(['year-change']);
const emitYearChange = () => {
  emit('year-change', year.value);
};
</script>

<style>
.slider-container {
  margin: 20px 0;
}
</style>
