<template>
  <a-card class="chart-wrap" :title="title">
    <template #extra v-if="showExtra">
      <strong>{{ doughnutData?.total }}</strong>
      <span>{{ unit }}</span>
    </template>
    <div class="chart-area">
      <Doughnut
        v-if="doughnutData?.data"
        :data="doughnutData?.data"
        :options="options"
      />
      <div class="head" v-if="showHead">
        <p class="use">
          <strong>{{ doughnutData?.used }}</strong>
          <span>{{ unit }} 사용</span>
        </p>
        <p class="available">
          <strong>{{ doughnutData?.available }}</strong>
          <span>{{ unit }} 가용</span>
        </p>
      </div>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue';
import { DoughnutType } from '@/types/dashboard/ChartType';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  doughnutData: {
    type: Object as () => DoughnutType,
    required: true,
  },
  title: {
    type: String,
  },
  showHead: {
    type: Boolean,
    default: true,
  },
  showExtra: {
    type: Boolean,
    default: true,
  },
  unit: {
    type: String,
  },
});

const options = {
  responsive: true,
  plugins: {
    datalabels: {
      display: false,
    },
    legend: {
      display: false,
      labels: {
        color: '#000',
        usePointStyle: true,
        padding: 20,
      },
      position: 'bottom',
      align: 'center',
    },
  },
};
</script>
<style lang="scss" scoped></style>
