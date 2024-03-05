<template>
  <a-card class="chart-wrap" :bordered="false">
    <div class="chart-area">
      <v-chart class="chart" :option="option" autoresize />
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import { defineProps, ref } from 'vue';
import { ELineChartType } from '@/types/dashboard/ChartType';

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
]);

const props = defineProps({
  lineData: {
    type: Object as () => ELineChartType,
    required: true,
  },
});

const option = ref({
  tooltip: {
    trigger: 'axis',
  },
  grid: {
    left: '5%',
    right: '4%',
    top: '20%',
    bottom: '3%',
    containLabel: true,
  },
  ...props.lineData,
});
</script>
<style lang="scss" scoped>
.chart {
  height: 15svh;
}
</style>
