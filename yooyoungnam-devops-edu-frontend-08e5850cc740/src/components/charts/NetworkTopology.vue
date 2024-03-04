<template>
  <div v-if="props.graphData">
    <div>
      <v-chart
        class="chart"
        :option="option"
        @click="handleNodeClick"
        autoresize
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref, watch } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { GraphChart } from 'echarts/charts';
import VChart from 'vue-echarts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components';
import { EGraphChartType } from '@/types/dashboard/ChartType';

use([
  CanvasRenderer,
  GraphChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
]);

const props = defineProps({
  graphData: {
    type: Object as () => EGraphChartType,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: true,
  },
  isLabelShow: {
    type: Boolean,
    default: true,
  },
  zoomNumber: {
    type: Number,
    default: 1,
  },
});

watch(props, () => {
  if (props.isLoading) {
    option.value.series[0].data = [];
    option.value.series[0].category = [];
    option.value.series[0].links = [];
  } else if (props.graphData.nodes.length > 0) {
    option.value.series[0].data = props.graphData.nodes;
    option.value.series[0].category = props.graphData.categories;
    option.value.series[0].links = props.graphData.links;
  }
  option.value.series[0].label.show = props.isLabelShow;
  option.value.series[0].zoom = props.zoomNumber;
});

// TODO: 같은 대역대
const topology = {
  categories: [
    { name: 'network' },
    { name: 'router' },
    // { name: 'server' },
    { name: 'subnet' },
  ],
};

const emit = defineEmits(['nodeClicked']);

const option = ref({
  grid: {
    left: '30%',
    right: '50%',
    top: '20%',
    bottom: '20%',
  },
  tooltip: {
    trigger: 'item',
    // TODO: 동적으로
    formatter: (nodeData: any) => {
      if (nodeData.dataType === 'node') {
        const value = nodeData.data;
        if (value.category === 'network') {
          const tags = `<button class="topology-${value.meta?.originalStatus.toLowerCase()}">${
            value.meta?.originalStatus
          }</button>`;
          const oderHtml1 = `<span class="topology-copybtn">${value.id}</span>`;
          const oderHtml2 = `<table class="topology-table">
              <tbody>
                <tr>
                  <td style="border-right: 1px solid #ddd;padding:5px;background-color:#ddd;">외부 네트워크</td>
                  <td style="padding:5px;width:100%;">${
                    value?.meta?.routerExternal ? 'Yes' : 'No'
                  }</td>
                </tr>
                <tr>
                  <td style="border-right: 1px solid #ddd;padding:5px;background-color:#ddd;">공유</td>
                  <td style="padding:5px;width:100%;">${
                    value?.meta?.shared ? 'Yes' : 'No'
                  }</td>
                </tr>
                <tr>
                  <td style="border-right: 1px solid #ddd;padding:5px;background-color:#ddd;">네트워크 타입</td>
                  <td style="padding:5px;width:100%;">${
                    value?.meta?.providerNetworkType
                  }</td>
                </tr>
              </tbody>
             </table>`;
          return `${value.name} ${tags} <br>${oderHtml1}<br>${oderHtml2}`;
        } else if (value.category === 'router') {
          const tags = `<button class="topology-${value.meta?.originalStatus.toLowerCase()}">${
            value.meta?.originalStatus
          }</button>`;
          const oderHtml1 = `<span class="topology-copybtn">${value.id}</span>`;
          const oderHtml2 = `<table class="topology-table">
              <tbody>
                <tr>
                  <td style="border-right: 1px solid #ddd;padding:5px;background-color:#ddd;">연동 외부 네트워크</td>
                  <td style="padding:5px;width:100%;">${
                    value?.meta?.externalGatewayInfo
                      ? value?.meta?.externalGatewayInfo.networkName
                      : '-'
                  }</td>
                </tr>
                <tr>
                  <td style="border-right: 1px solid #ddd;padding:5px;background-color:#ddd;">외부 게이트웨이</td>
                  <td style="padding:5px;width:100%;">${
                    value?.meta?.externalGatewayInfo ? 'Yes' : 'No'
                  }</td>
                </tr>
              </tbody>
             </table>`;
          return `${value.name} ${tags} <br>${oderHtml1}<br>${oderHtml2}`;
        } else if (value.category === 'subnet') {
          const oderHtml1 = `<span class="topology-copybtn">${value.id}</span>`;
          const oderHtml2 = `<table class="topology-table">
              <tbody>
                <tr>
                  <td style="border-right: 1px solid #ddd;padding:5px;background-color:#ddd;">게이트웨이 IP</td>
                  <td style="padding:5px;width:100%;">${value?.meta?.gatewayIp}</td>
                </tr>
                <tr>
                  <td style="border-right: 1px solid #ddd;padding:5px;background-color:#ddd;">CIDR</td>
                  <td style="padding:5px;width:100%;">${value?.meta?.cidr}</td>
                </tr>
              </tbody>
             </table>`;
          return `${value.name}<br>${oderHtml1}<br>${oderHtml2}`;
        }
      }
    },
    axisPointer: {
      type: 'line', // 툴팁 라인 스타일 지정
      lineStyle: {
        color: 'rgba(0, 0, 0, 0.5)',
        width: 2,
        type: 'solid',
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
  },
  animationDuration: 150,
  animationEasingUpdate: 'linear',
  series: [
    {
      type: 'graph',
      layout: 'force',
      force: {
        repulsion: 500,
      },
      data: props.graphData.nodes,
      links: props.graphData.links,
      category: topology.categories,
      roam: true,
      label: {
        show: props.isLabelShow,
        position: 'bottom',
        formatter: '{b}',
        textStyle: {
          fontSize: 10,
          color: '#000',
        },
      },
      lineStyle: {
        curveness: 0.1,
      },
      emphasis: {
        force: 'adjacency',
        label: {
          show: true,
          color: '#ddd',
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#ddd',
        },
      },
      zoom: props.zoomNumber,
    },
  ],
});

const handleNodeClick = (e: any) => {
  if (e.dataType === 'node') {
    const clickedNodeData = e.data;
    emit('nodeClicked', clickedNodeData);
  }
};
</script>
<style lang="scss" scoped>
.chart {
  width: 100%;
  height: 70vh;
}
</style>
