<template>
  <div class="progress-usage-wrapper">
    <div
      class="progress-item progress-item-type-right progress-status"
      :class="getStatusClassByPercent(graphNumber)"
    >
      <template v-if="graphNumber.toString() === 'Infinity'">
        <a-progress :percent="graphNumber" :show-info="false" />
        <span class="text-usage">사용량: {{ usage }} {{ unit }}</span>
        <span class="text-total right">전체: 제한 없음</span>
      </template>
      <template v-else>
        <span class="text">{{ graphNumber }} %</span>
        <span class="text-available right"
          >사용 가능: {{ available }} {{ unit }}</span
        >
        <a-progress :percent="graphNumber" :show-info="false" />
        <span class="text-usage">사용량: {{ usage }} {{ unit }}</span>
        <span class="text-total right">전체: {{ total }} {{ unit }}</span>
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue';
const props = defineProps({
  graphNumber: {
    type: Number,
    required: true,
  },
  available: {
    type: Number,
    required: true,
  },
  usage: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  showStatus: {
    type: Boolean,
    default: false,
  },
});

const getStatusClassByPercent = (graphNumber: number) => {
  if (!props.showStatus) {
    return;
  }
  if (graphNumber.toString() === 'Infinity') {
    return 'progress-status-infinity';
  } else if (graphNumber <= 50) {
    return 'progress-status-stable';
  } else if (props.graphNumber <= 75) {
    return 'progress-status-warning';
  } else {
    return 'progress-status-danger';
  }
};
</script>
<style lang="scss" scoped></style>
