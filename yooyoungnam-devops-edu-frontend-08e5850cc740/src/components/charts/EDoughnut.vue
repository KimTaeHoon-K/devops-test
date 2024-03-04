<template>
  <a-card class="chart-wrap" :title="title">
    <template #extra v-if="showExtra">
      <strong>{{ doughnutData?.total }}</strong>
      <span>{{ unit }}</span>
    </template>
    <div class="chart-area">
      <v-chart class="chart" :option="option" autoresize />
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
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { defineProps, ref } from 'vue';
import { EDoughnutChartType } from '@/types/dashboard/ChartType';

use([CanvasRenderer, PieChart, TooltipComponent]);

const props = defineProps({
  doughnutData: {
    type: Object as () => EDoughnutChartType,
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

const option = ref({
  tooltip: {
    trigger: 'item',
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '90%'],
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1.5,
      },
      emphasis: {
        label: {
          show: false,
          fontSize: 10,
          fontWeight: 'bold',
        },
      },
      label: {
        show: false,
      },
      labelLine: {
        show: false,
      },
      data: props.doughnutData?.data,
    },
  ],
  color: ['#1D50D0', '#319CFF'],
});
</script>

<style lang="scss" scoped>
.chart {
  height: 8vh;
}
</style>
