<template>
  <div class="contents dashboard-wrapper contrabass-dashboard-wrapper">
    <!-- Contrabass Dashboard Banner -->
    <!-- <DashboardVisual :photo="photo" /> -->
    <a-row :gutter="16" class="dashboard-container">
      <a-col :xl="6" :lg="24" :md="24" :sm="24" :xs="24" class="col col-left">
        <a-space
          class="space-block"
          direction="vertical"
          :size="SizeConst.sixteen"
        >
          <!-- 공급자 프로젝트-워크스페이스 연동 정보 -->
          <DashboardWorkspaceConnectionInfo
            :workspace-connection-info="workspaceConnectionInfo"
          />
          <!-- //공급자 프로젝트-워크스페이스 연동 정보 -->

          <!-- 서비스 현황 -->
          <DashboardServiceStatusList
            :service-status-list="serviceStatusList"
          />
          <!-- //서비스 현황 -->

          <!-- 최근 로그 -->
          <DashboardLatestLogList :latest-log-list="latestLogList" />
          <!-- //최근 로그 -->
        </a-space>
      </a-col>
      <!-- // 공급자 프로젝트-워크스페이스 연동 정보 -->

      <a-col :xl="18" :lg="24" :md="24" :sm="24" :xs="24" class="col col-right">
        <!-- 공급자 자원 사용량 - 도넛 차트 -->
        <a-card class="data-container" title="공급자 자원 사용량">
          <a-row :gutter="16">
            <a-col :xl="8" :lg="24" :md="24" :sm="24" :xs="24">
              <EDoughnut
                v-if="eDoughnutCpuData.data"
                :doughnutData="eDoughnutCpuData"
                :showHead="true"
                :title="'vCPU 사용량'"
                :unit="'Core'"
                :showExtra="true"
              />
            </a-col>
            <a-col :xl="8" :lg="24" :md="24" :sm="24" :xs="24">
              <EDoughnut
                v-if="eDoughnutMemoryData.data"
                :doughnutData="eDoughnutMemoryData"
                :showHead="true"
                :title="'Memory 사용량'"
                :unit="'GiB'"
                :showExtra="true"
              />
            </a-col>
            <a-col :xl="8" :lg="24" :md="24" :sm="24" :xs="24">
              <EDoughnut
                v-if="eDoughnutDiskData.data"
                :doughnutData="eDoughnutDiskData"
                :showHead="true"
                :title="'Disk 사용량'"
                :unit="'GiB'"
                :showExtra="true"
              />
            </a-col>
          </a-row>
        </a-card>
        <!-- //공급자 자원 사용량 - 도넛 차트 -->

        <!-- 하이퍼바이저별 물리 자원 사용량 - 도넛 차트 -->
        <!--        <a-card-->
        <!--          class="data-container hypervisor-data-container"-->
        <!--          title="하이퍼바이저별 물리 자원 사용량"-->
        <!--        >-->
        <!--          <a-row :gutter="24">-->
        <!--            <a-col :xl="8" :lg="24" :md="24" :sm="24" :xs="24">-->
        <!--              <Doughnut-->
        <!--                :doughnutData="doughnutHypervisorCpuData"-->
        <!--                :showHead="false"-->
        <!--                :title="'vCPU 사용량'"-->
        <!--                :showExtra="false"-->
        <!--              />-->
        <!--            </a-col>-->
        <!--            <a-col :xl="8" :lg="24" :md="24" :sm="24" :xs="24">-->
        <!--              <Doughnut-->
        <!--                :doughnutData="doughnutHypervisorMemoryData"-->
        <!--                :showHead="false"-->
        <!--                :title="'Memory 사용량'"-->
        <!--                :showExtra="false"-->
        <!--              />-->
        <!--            </a-col>-->
        <!--            <a-col :xl="8" :lg="24" :md="24" :sm="24" :xs="24">-->
        <!--              <Doughnut-->
        <!--                :doughnutData="doughnutHypervisorDiskData"-->
        <!--                :showHead="false"-->
        <!--                :title="'Disk 사용량'"-->
        <!--                :showExtra="false"-->
        <!--              />-->
        <!--            </a-col>-->
        <!--          </a-row>-->
        <!--        </a-card>-->
        <!-- //하이퍼바이저별 물리 자원 사용량 - 도넛 차트 -->

        <a-space
          class="space-block"
          direction="vertical"
          :size="SizeConst.sixteen"
        >
          <!-- 컴퓨트 노드 자원 사용량 - 프로그레스바 -->
          <a-card title="Compute 노드 자원 사용량" class="compute-node-area">
            <a-row>
              <a-col :span="24">
                <a-select
                  v-model:value="computeNodeValue"
                  label-in-value
                  style="width: 100%"
                  :options="computeNodeOptions"
                ></a-select>
                <ul>
                  <li v-for="item in computeNodeList" :key="item.id">
                    <a-card :bordered="false" :title="item.title">
                      <ProgressUsage
                        :graphNumber="
                          percentageConverter(item.usage, item.total)
                        "
                        :available="item.available"
                        :usage="item.usage"
                        :total="item.total"
                        :unit="item.unit"
                      />
                    </a-card>
                  </li>
                </ul>
              </a-col>
            </a-row>
          </a-card>
          <!-- //컴퓨트 노드 자원 사용량 - 프로그레스바 -->

          <!-- 인프라 자원 현황 -->
          <a-card title="인프라 자원 현황" class="infra-resource-current">
            <DashboardInfraResourceCurrent
              :infra-resource-type="'instance'"
              :infra-resource-current-data="
                infraResourceCurrentData?.instanceStatistics
              "
            />
            <DashboardInfraResourceCurrent
              :infra-resource-type="'network'"
              :infra-resource-current-data="
                infraResourceCurrentData?.networkStatistics
              "
            />
            <DashboardInfraResourceCurrent
              :infra-resource-type="'volume'"
              :infra-resource-current-data="
                infraResourceCurrentData?.volumeStatistics
              "
            />
          </a-card>
          <!-- //인프라 자원 현황 -->
        </a-space>
      </a-col>
    </a-row>

    <!-- 공급자 자원별 사용량 - 라인차트 -->
    <a-space
      class="space-block line-chart-area"
      direction="vertical"
      :size="SizeConst.sixteen"
    >
      <a-row :gutter="16">
        <a-col :xl="12" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card title="공급자 CPU 사용량">
            <ELineChart v-if="eLineCpuData.series" :line-data="eLineCpuData" />
          </a-card>
        </a-col>
        <a-col :xl="12" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card title="공급자 Memory 사용량">
            <ELineChart
              v-if="eLineMemoryData.series"
              :line-data="eLineMemoryData"
            />
          </a-card>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :xl="12" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card title="공급자 네트워크 사용량">
            <ELineChart
              v-if="eLineNetworkData.series"
              :line-data="eLineNetworkData"
            />
          </a-card>
        </a-col>
        <a-col :xl="12" :lg="24" :md="24" :sm="24" :xs="24">
          <a-card title="공급자 Disk 사용량">
            <ELineChart
              v-if="eLineDiskData.series"
              :line-data="eLineDiskData"
            />
          </a-card>
        </a-col>
      </a-row>
    </a-space>
    <!-- //공급자 자원별 사용량 - 라인차트 -->

    <!-- 프로젝트별 쿼터 사용량 - 테이블 프로그레스바 -->
    <a-card class="project-list-quarter-table" title="프로젝트별 쿼터 사용량">
      <a-table :columns="columns" :data-source="data" :pagination="false">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'name'">
            {{ record.projectName }}
          </template>
          <template v-else-if="column.dataIndex === 'cpu'">
            <span>
              <ProgressUsage
                :graphNumber="
                  percentageConverter(record.cpu.used, record.cpu.total)
                "
                :available="record.cpu.available"
                :usage="record.cpu.used"
                :total="record.cpu.total"
                :unit="'Core'"
                :show-status="true"
              />
            </span>
          </template>
          <template v-else-if="column.dataIndex === 'ram'">
            <span>
              <ProgressUsage
                :graphNumber="
                  percentageConverter(record.ram.used, record.ram.total)
                "
                :available="record.ram.available"
                :usage="record.ram.used"
                :total="record.ram.total"
                :unit="'GiB'"
                :show-status="true"
              />
            </span>
          </template>
          <template v-else-if="column.dataIndex === 'disk'">
            <span>
              <ProgressUsage
                :graphNumber="
                  percentageConverter(record.disk.used, record.disk.total)
                "
                :available="record.disk.available"
                :usage="record.disk.used"
                :total="record.disk.total"
                :unit="'GiB'"
                :show-status="true"
              />
            </span>
          </template>
        </template>
      </a-table>
    </a-card>
    <!-- //프로젝트별 쿼터 사용량 - 테이블 프로그레스바 -->
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import type { SelectProps } from 'ant-design-vue';
// import DashboardVisual from '@/components/dashboard/DashboardVisual.vue';
import DashboardWorkspaceConnectionInfo from '@/views/dashboard/components/DashboardWorkspaceConnectionInfo.vue';
import DashboardServiceStatusList from '@/views/dashboard/components/DashboardServiceStatusList.vue';
import {
  InfraResourceCurrentType,
  LatestLogType,
  ProjectQuotaUsageType,
  ProviderResourceUsageGraphType,
  ResourceUsageGraphType,
  ResourceUsageListType,
  ServiceStatusType,
  UsageType,
  WorkspaceConnectionInfoType,
} from '@/types/dashboard/DashboardType';
import {
  DoughnutType,
  EDoughnutChartType,
  ELineChartType,
} from '@/types/dashboard/ChartType';
import EDoughnut from '@/components/charts/EDoughnut.vue';
import ProgressUsage from '@/components/charts/ProgressUsage.vue';
import ELineChart from '@/components/charts/ELineChart.vue';
import DashboardInfraResourceCurrent from '@/views/dashboard/components/DashboardInfraResourceCurrent.vue';
import DashboardLatestLogList from '@/views/dashboard/components/DashboardLatestLogList.vue';
import * as dashboardApi from '@/axios/dashboard-service/DashboardApi';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import {
  bitsToMbitsConverterWithoutUnit,
  bytesToGibConverterWithoutUnit,
  percentageConverter,
  timestampToDateConverter,
} from '@/utils/Converter';
import { SizeConst } from '@/types/common/constant/SizeConst';

const providerStore = ProviderStore();
watch(providerStore, (providerStore) => {
  // 프로젝트 별 조회가 아닌 경우.
  if (providerStore.isSelected && providerStore.isChangedProvider) {
    refresh();
  }
});

const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const refresh = () => {
  // TODO
  workspaceConnectionInfo.value = {} as WorkspaceConnectionInfoType;
  getWorkspaceConnectionInfoList();
  // ===========================================
  serviceStatusList.value = [];
  getServiceStatusList();
  // ===========================================
  resourceUsageList.value = {} as ResourceUsageListType;
  eDoughnutCpuData.value = {} as EDoughnutChartType;
  eDoughnutMemoryData.value = {} as EDoughnutChartType;
  eDoughnutDiskData.value = {} as EDoughnutChartType;
  getResourceUsageList();
  // ===========================================
  infraResourceCurrentData.value = undefined;
  getInfraResourceCurrentData();
  // ===========================================
  providerResourceUsageGraphType.value = {} as ProviderResourceUsageGraphType;
  eLineCpuData.value = {} as ELineChartType;
  eLineDiskData.value = {} as ELineChartType;
  eLineMemoryData.value = {} as ELineChartType;
  eLineNetworkData.value = {} as ELineChartType;
  getProviderResourceUsage();
  // ===========================================
  data.value = [];
  getProjectQuotaUsageList();
};

// 공급자 워크스페이스 연동 정보 데이터
const workspaceConnectionInfo = ref<WorkspaceConnectionInfoType>(
  {} as WorkspaceConnectionInfoType
);
const getWorkspaceConnectionInfoList = () => {
  dashboardApi
    .getWorkspaceConnectionInfoList(providerStore.getSelectedProviderId)
    .then((res) => {
      if (res.status === 200) {
        workspaceConnectionInfo.value = res.data.data;
      }
      workspaceConnectionInfo.value.providerName =
        providerStore.getSelectedProviderName;
    })
    .catch((err) => {
      console.error(err);
    });
};

//서비스 현황 데이터
const serviceStatusList = ref<ServiceStatusType[]>();
const getServiceStatusList = () => {
  dashboardApi
    .getServiceStatusList(providerStore.getSelectedProviderId)
    .then((res) => {
      if (res.status === 200) {
        serviceStatusList.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

// 최근 로그 데이터
const latestLogList: LatestLogType[] = [
  {
    title: '인스턴스 ‘VM01’ Error',
    type: 'error',
  },
  {
    title: '‘Compute04’ 자원 임계치 90% 초과',
    type: 'error',
  },
  {
    title: '볼륨 ‘Volume03’ 생성 완료',
    type: 'success',
  },
  {
    title: '볼륨 ‘Volume07’ 생성 완료',
    type: 'success',
  },
  {
    title: '‘Compute01’ 자원 임계치 70% 초과',
    type: 'warning',
  },
];

// 공급자 자원 사용량 데이터
const resourceUsageList = ref<ResourceUsageListType>();
const eDoughnutCpuData = ref<EDoughnutChartType>({} as EDoughnutChartType);
const eDoughnutMemoryData = ref<EDoughnutChartType>({} as EDoughnutChartType);
const eDoughnutDiskData = ref<EDoughnutChartType>({} as EDoughnutChartType);
const getResourceUsageList = () => {
  dashboardApi
    .getProviderStatistic(providerStore.getSelectedProviderId)
    .then((res) => {
      if (res.status === 200) {
        resourceUsageList.value = res.data.data;
        setEDoughnutChartData(resourceUsageList.value.resources.cpu, 'cpu');
        setEDoughnutChartData(resourceUsageList.value.resources.ram, 'ram');
        setEDoughnutChartData(resourceUsageList.value.resources.disk, 'disk');
      }
    })
    .catch((err) => {
      console.error(err);
    });
};
const setEDoughnutChartData = (usageData: UsageType, field: string) => {
  let eDoughnutChartData = eDoughnutCpuData.value;
  if (field === 'ram') {
    eDoughnutChartData = eDoughnutMemoryData.value;
  } else if (field === 'disk') {
    eDoughnutChartData = eDoughnutDiskData.value;
  }
  eDoughnutChartData.total = usageData.total;
  eDoughnutChartData.used = usageData.used;
  eDoughnutChartData.available = usageData.available;
  eDoughnutChartData.data = [
    { value: usageData.used, name: '사용' },
    { value: usageData.available, name: '가용' },
  ];
};

//하이퍼바이저별 물리 자원 사용량: vCPU
const doughnutHypervisorCpuData = ref<DoughnutType>({
  data: {
    labels: ['사용', '가용', '가용2', '가용3'],
    datasets: [
      {
        data: [15, 50, 50, 50],
        backgroundColor: ['#1D50D0', '#319CFF', '#858DF8', '#8AE3FF'],
        hoverOffset: 4,
      },
    ],
  },
});

//하이퍼바이저별 물리 자원 사용량: Memory
const doughnutHypervisorMemoryData = ref<DoughnutType>({
  data: {
    labels: ['사용', '가용', '가용2', '가용3'],
    datasets: [
      {
        data: [15, 50, 50, 50],
        backgroundColor: ['#1D50D0', '#319CFF', '#858DF8', '#8AE3FF'],
        hoverOffset: 4,
      },
    ],
  },
});

//하이퍼바이저별 물리 자원 사용량: Disk
const doughnutHypervisorDiskData = ref<DoughnutType>({
  data: {
    labels: ['사용', '가용', '가용2', '가용3'],
    datasets: [
      {
        data: [15, 50, 50, 50],
        backgroundColor: ['#1D50D0', '#319CFF', '#858DF8', '#8AE3FF'],
        hoverOffset: 4,
      },
    ],
  },
});

// 컴퓨트 노트 자원 사용량
const computeNodeValue = ref('compute1');
const computeNodeOptions = ref<SelectProps['options']>([
  {
    value: 'compute1',
    label: 'compute1',
  },
  {
    value: 'compute2',
    label: 'compute2',
  },
]);

const computeNodeList = ref([
  {
    id: '1',
    title: 'vCPU',
    available: 515,
    usage: 485,
    total: 1000,
    unit: 'core',
  },
  {
    id: '2',
    title: 'Memory',
    available: 800,
    usage: 200,
    total: 1000,
    unit: 'GiB',
  },
  {
    id: '3',
    title: 'Disk',
    available: 687,
    usage: 313,
    total: 1000,
    unit: 'GiB',
  },
]);

// 인프라 자원 현황
const infraResourceCurrentData = ref<InfraResourceCurrentType>();
const getInfraResourceCurrentData = () => {
  dashboardApi
    .getInfraStatistic()
    .then((res) => {
      if (res.status === 200) {
        infraResourceCurrentData.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

// 공급자 자원별 사용량 데이터
const providerResourceUsageGraphType = ref<ProviderResourceUsageGraphType>();
const eLineCpuData = ref<ELineChartType>({} as ELineChartType);
const eLineMemoryData = ref<ELineChartType>({} as ELineChartType);
const eLineNetworkData = ref<ELineChartType>({} as ELineChartType);
const eLineDiskData = ref<ELineChartType>({} as ELineChartType);
const getProviderResourceUsage = () => {
  dashboardApi
    .getProviderResourceUsage(providerStore.getSelectedProviderId)
    .then((res) => {
      if (res.status === 200) {
        providerResourceUsageGraphType.value = res.data.data;
        setELineChartData('cpu', providerResourceUsageGraphType.value.cpu);
        setELineChartData('ram', providerResourceUsageGraphType.value.memory);
        setELineChartData('disk', providerResourceUsageGraphType.value.disk);
        setELineChartData(
          'network',
          providerResourceUsageGraphType.value.networkReceive,
          providerResourceUsageGraphType.value.networkTransmit
        );
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

const setELineChartData = (
  field: string,
  usageGraphData: ResourceUsageGraphType,
  secondUsageGraphData?: ResourceUsageGraphType
) => {
  let eLineChartData = eLineCpuData.value;
  if (field === 'ram') {
    eLineChartData = eLineMemoryData.value;
  } else if (field === 'disk') {
    eLineChartData = eLineDiskData.value;
  } else if (field === 'network') {
    eLineChartData = eLineNetworkData.value;
  }

  let xAxisData: string[] = [];
  usageGraphData.result[0].values.forEach((val) => {
    xAxisData.push(timestampToDateConverter(Number(val[0]), 'HH:mm'));
  });
  eLineChartData.xAxis = {
    type: 'category',
    boundaryGap: false,
    data: xAxisData,
  };
  let yAxisName = 'Percentage (%)';
  if (field === 'network') {
    yAxisName = 'Mb/s';
  } else if (field === 'ram' || field === 'disk') {
    yAxisName = 'GiB';
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
    let name: string | undefined = undefined;
    if (field === 'network') {
      name = graphData.metric?.device;
    } else if (field === 'cpu') {
      name = graphData.metric?.mode;
    }
    series.push({
      name: name,
      type: 'line',
      data: graphData.values.map((val) => {
        return convertLineData(val[1], field);
      }),
    });
  });
  if (field === 'network' && secondUsageGraphData) {
    // network transmit
    secondUsageGraphData.result.forEach((graphData) => {
      series.push({
        name: graphData.metric.device,
        type: 'line',
        data: graphData.values.map((val) => {
          return convertLineData(val[1], field);
        }),
      });
    });
  }

  eLineChartData.series = series;
};
// TODO
const convertLineData = (data: any, field: string) => {
  if (field === 'cpu') {
    // percentage
    return data;
  } else if (field === 'ram') {
    // bytes to GiB
    return bytesToGibConverterWithoutUnit(data);
  } else if (field === 'disk') {
    // bytes to GiB
    return bytesToGibConverterWithoutUnit(data);
  } else if (field === 'network') {
    // bits
    return bitsToMbitsConverterWithoutUnit(data);
  }
};

//상단 비쥬얼 배너
// const photo = ref<string>('http://placehold.it/200');

// 프로젝트별 쿼터 사용량 테이블 컬럼
const columns = [
  {
    title: '프로젝트명',
    dataIndex: 'name',
    width: '25%',
    // sorter: {
    //   compare: (a: ProjectQuotaUsageType, b: ProjectQuotaUsageType) => {
    //     if (a.projectName > b.projectName) {
    //       return 1;
    //     } else {
    //       return -1;
    //     }
    //   },
    // },
  },
  {
    title: 'vCPU',
    dataIndex: 'cpu',
    width: '27%',
  },
  {
    title: 'Memory',
    dataIndex: 'ram',
    width: '24%',
  },
  {
    title: 'Disk',
    dataIndex: 'disk',
    width: '24%',
  },
];
// 프로젝트별 쿼터 사용량 테이블 데이터
const data = ref<ProjectQuotaUsageType[]>();
const getProjectQuotaUsageList = () => {
  dashboardApi
    .getProjectQuotaUsageList(providerStore.getSelectedProviderId)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

onMounted(() => {
  if (providerStore.isSelected) {
    getWorkspaceConnectionInfoList();
    getServiceStatusList();
    getResourceUsageList();
    getInfraResourceCurrentData();
    getProviderResourceUsage();
    getProjectQuotaUsageList();
  }
});
</script>

<style lang="scss" scoped></style>
