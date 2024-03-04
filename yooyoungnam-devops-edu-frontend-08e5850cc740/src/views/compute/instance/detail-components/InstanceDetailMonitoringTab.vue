<template>
  <div class="dashboard-wrapper contrabass-dashboard-wrapper">
    <a-space
      class="space-block line-chart-area"
      direction="vertical"
      :size="SizeConst.sixteen"
    >
      <a-row :gutter="16">
        <a-col :xl="12" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card :title="t('common.column.cpu-usage')">
            <ELineChart v-if="eLineCpuData.series" :line-data="eLineCpuData" />
          </a-card>
        </a-col>
        <a-col :xl="12" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card :title="t('common.column.network-traffic')">
            <ELineChart
              v-if="eLineNetworkTrafficData.series"
              :line-data="eLineNetworkTrafficData"
            />
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :xl="12" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card :title="t('common.column.memory-usage')">
            <ELineChart
              v-if="eLineMemoryData.series"
              :line-data="eLineMemoryData"
            />
          </a-card>
        </a-col>
        <a-col :xl="12" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card :title="t('common.column.network-error')">
            <ELineChart
              v-if="eLineNetworkErrorData.series"
              :line-data="eLineNetworkErrorData"
            />
          </a-card>
        </a-col>
      </a-row>
    </a-space>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { onMounted, ref, defineProps, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import {
  ProviderResourceUsageGraphType,
  ResourceUsageGraphType,
} from '@/types/dashboard/DashboardType';
import { ELineChartType } from '@/types/dashboard/ChartType';
import ELineChart from '@/components/charts/ELineChart.vue';
import {
  bytesToGibConverterWithoutUnit,
  timestampToDateConverter,
} from '@/utils/Converter';
import { getInstanceMonitoring } from '@/axios/compute-service/InstanceApi';
import { InstanceDetailMonitoringType } from '@/types/compute/instance/InstanceDetailMonitoringType';
import { SizeConst } from '@/types/common/constant/SizeConst';

const props = defineProps({
  instanceId: {
    type: String,
    required: true,
  },
  providerId: {
    type: String,
    required: true,
  },
});

watch(props, () => {
  if (props.instanceId) {
    getResourceList();
  }
});

const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const data = ref<InstanceDetailMonitoringType>();

const refresh = () => {
  // TODO
  providerResourceUsageGraphType.value = {} as ProviderResourceUsageGraphType;
  eLineCpuData.value = {} as ELineChartType;
  eLineNetworkTrafficData.value = {} as ELineChartType;
  eLineMemoryData.value = {} as ELineChartType;
  eLineNetworkErrorData.value = {} as ELineChartType;
};

const providerResourceUsageGraphType = ref<ProviderResourceUsageGraphType>();
const eLineCpuData = ref<ELineChartType>({} as ELineChartType);
const eLineNetworkTrafficData = ref<ELineChartType>({} as ELineChartType);
const eLineMemoryData = ref<ELineChartType>({} as ELineChartType);
const eLineNetworkErrorData = ref<ELineChartType>({} as ELineChartType);

const setELineChartData = (
  field: string,
  usageGraphData: ResourceUsageGraphType,
  secondUsageGraphData?: ResourceUsageGraphType
) => {
  let eLineChartData = eLineCpuData.value;
  if (field === 'ram') {
    eLineChartData = eLineMemoryData.value;
  } else if (field === 'networkError') {
    eLineChartData = eLineNetworkErrorData.value;
  } else if (field === 'network') {
    eLineChartData = eLineNetworkTrafficData.value;
  }
  let xAxisData: string[] = [];
  if (usageGraphData.result.length > 0) {
    usageGraphData.result[0].values.forEach((val) => {
      xAxisData.push(timestampToDateConverter(Number(val[0]), 'HH:mm'));
    });
  }
  eLineChartData.xAxis = {
    type: 'category',
    boundaryGap: false,
    data: xAxisData,
  };
  let yAxisName = 'Percentage (%)';
  if (field === 'network') {
    yAxisName = 'Byte';
  } else if (field === 'networkError') {
    yAxisName = '';
  }
  eLineChartData.yAxis = {
    name: yAxisName,
    // nameLocation: 'center',
    // nameRotate: 90,
    // nameGap: 40,
    type: 'value',
  };

  let series: any[] = [];
  usageGraphData.result.forEach((graphData) => {
    // let name: string | undefined = undefined;
    // if (field === 'network') {
    //   name = graphData.metric?.device;
    // } else if (field === 'cpu') {
    //   name = graphData.metric?.mode;
    // }
    series.push({
      // name: name,
      type: 'line',
      data: graphData.values.map((val) => {
        return val[1];
      }),
    });
  });
  if (field === 'network' && secondUsageGraphData) {
    // network transmit
    secondUsageGraphData.result.forEach((graphData) => {
      series.push({
        // name: graphData.metric.device,
        type: 'line',
        data: graphData.values.map((val) => {
          return val[1];
        }),
      });
    });
  }
  eLineChartData.series = series;
};
// TODO
const convertLineData = (data: any, field: string) => {
  if (field === 'cpu' || field === 'ram' || field === 'network') {
    // percentage
    return data;
  } else if (field === 'networkError') {
    // bytes to GiB
    return bytesToGibConverterWithoutUnit(data);
  }
};

// 자원 목록 조회 : 모니터링 조회
const getResourceList = () => {
  getInstanceMonitoring(props.instanceId, props.providerId)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        setELineChartData('cpu', data.value.cpu);
        setELineChartData('network', data.value.network);
        setELineChartData('ram', data.value.memory);
        setELineChartData('networkError', data.value.networkError);
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

onMounted(() => {
  if (props.instanceId) {
    getResourceList();
  }
});
</script>

<style lang="scss" scoped></style>
