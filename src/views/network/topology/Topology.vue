<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header class="page-header" :title="t(route.meta?.title)">
  </a-page-header>
  <div
    id="topologyItems"
    class="contents info-topology"
    :class="{ open: isChildClicked }"
  >
    <a-col span="30">
      <a-card>
        <div class="topology-title">
          <span>{{ providerStore.getSelectedProviderName }}</span>
          <span class="title-date">최근 업데이트: {{ latestUpdateDate }}</span>
        </div>
        <template #extra>
          <a-button
            size="middle"
            type="default"
            @click="goToPageByName(router, 'network create')"
            >네트워트 생성</a-button
          >
          <a-button
            size="middle"
            type="default"
            @click="goToPageByName(router, 'router create')"
            >라우터 생성</a-button
          >
        </template>
        <a-row>
          <a-switch v-model:checked="isLabelShow" />
          <a-typography-paragraph
            :isLabelShow="isLabelShow"
            content="자원명 보기"
          />
          <div class="topology-button">
            <a-button
              size="middle"
              type="default"
              @click="handleZoomClicked('in')"
              ><ZoomInOutlined
            /></a-button>
            <a-button
              size="middle"
              type="default"
              @click="handleZoomClicked('out')"
              ><ZoomOutOutlined
            /></a-button>
            <a-button size="middle" type="default" @click="refresh">
              <UndoOutlined
            /></a-button>
          </div>
        </a-row>

        <!-- 토폴로지 그래프 -->
        <NetworkTopology
          @nodeClicked="handleNodeClicked"
          :graph-data="eGraphTopologyData"
          :is-loading="isLoading"
          :is-label-show="isLabelShow"
          :zoom-number="zoomNumber"
        />
      </a-card>
    </a-col>
    <TopologyNetworkDetail
      v-if="isChildClicked && nodeData.category === 'network'"
      :node-detail-data="nodeData"
      v-model:is-child-clicked="isChildClicked"
      v-model:is-refresh="isRefresh"
    />
    <TopologyRouterDetail
      v-if="isChildClicked && nodeData.category === 'router'"
      :node-detail-data="nodeData"
      v-model:is-child-clicked="isChildClicked"
      v-model:is-refresh="isRefresh"
    />
    <TopologySubnetDetail
      v-if="isChildClicked && nodeData.category === 'subnet'"
      :node-detail-data="nodeData"
      v-model:is-child-clicked="isChildClicked"
      v-model:is-refresh="isRefresh"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
} from '@ant-design/icons-vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import NetworkTopology from '@/components/charts/NetworkTopology.vue';
import { getTopologyData } from '@/axios/network-service/TopologyApi';
import { TopologyType } from '@/types/network/topology/TopologyType';
import { EGraphChartType } from '@/types/dashboard/ChartType';
import TopologyNetworkDetail from '@/views/network/topology/detail-components/TopologyNetworkDetail.vue';
import { TopologyNodeType } from '@/types/network/topology/TopologyNodeType';
import TopologySubnetDetail from '@/views/network/topology/detail-components/TopologySubnetDetail.vue';
import TopologyRouterDetail from '@/views/network/topology/detail-components/TopologyRouterDetail.vue';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { dateConverter } from '@/utils/Converter';
import { goToPageByName } from '@/utils/RouterUtil';

const providerStore = ProviderStore();
watch(providerStore, () => {
  refresh();
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const latestUpdateDate = ref<string>();
const isChildClicked = ref<boolean>(false);
const isLabelShow = ref<boolean>(true);
const isRefresh = ref<boolean>(false);
const zoomNumber = ref<number>(1);

watch(isRefresh, () => {
  if (isRefresh.value) {
    isRefresh.value = false;
    refresh();
  }
});

const nodeData = ref<TopologyNodeType>({
  id: '',
  name: '',
  category: '',
  meta: {},
} as TopologyNodeType);

const refresh = () => {
  isLoading.value = true;
  nodeData.value = {} as TopologyNodeType;
  isChildClicked.value = false;
  eGraphTopologyData.value = {
    nodes: [],
    links: [],
    categories: [],
  } as EGraphChartType;
  isLabelShow.value = true;
  zoomNumber.value = 1;
  getResourceList();
};

const handleZoomClicked = (action: string) => {
  if (action === 'in') {
    zoomNumber.value += 0.2;
  } else {
    if (zoomNumber.value > 0) {
      zoomNumber.value -= 0.2;
    }
  }
};
const handleNodeClicked = (clickedNodeData: any) => {
  const { id } = clickedNodeData;
  nodeData.value = clickedNodeData;
  if (nodeData.value.id === id) {
    isChildClicked.value = false;
  }
  isChildClicked.value = true;
};

const isLoading = ref<boolean>(true);
const getResourceList = () => {
  getTopologyData()
    .then((res) => {
      if (res.status === 200) {
        latestUpdateDate.value = dateConverter(
          Date.now(),
          'YYYY-MM-DD HH:mm:ss'
        );
        setGraphChartData(res.data.data);
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const eGraphTopologyData = ref<EGraphChartType>({
  nodes: [],
  links: [],
  categories: [],
} as EGraphChartType);
const setGraphChartData = (topologyData: TopologyType) => {
  // 네트워크 노드
  if (topologyData.networks.length > 0) {
    let networkSymbolSize = 50;
    let itemStyleColor = 'green';
    topologyData.networks.forEach((network) => {
      switch (network.originalStatus) {
        case 'DOWN':
          itemStyleColor = '#ddd';
          break;
        case 'BUILD':
          itemStyleColor = 'yellow';
          break;
        case 'ERROR':
          itemStyleColor = 'red';
          break;
      }
      eGraphTopologyData.value.nodes.push({
        id: network.id,
        name: network.name,
        symbol: `image://${require(`@/assets/images/icon/topology/${
          network.routerExternal ? 'public' : 'project'
        }-${network.originalStatus.toLowerCase()}.svg`)}`,
        symbolSize: networkSymbolSize,
        symbolKeepAspect: true,
        category: 'network',
        clickable: true,
        meta: {
          projectId: providerStore.getSelectedProjectId,
          originalStatus: network.originalStatus,
          routerExternal: network.routerExternal,
          providerNetworkType: network.providerNetworkType,
          subnets: network.subnets,
        },
        itemStyle: {
          color: itemStyleColor,
        },
      });
      // 서브넷 노드
      if (network.subnets?.length > 0) {
        let subnetSymbolSize = 50;
        network.subnets.forEach((subnet) => {
          eGraphTopologyData.value.nodes.push({
            id: subnet.id,
            name: subnet.name,
            symbol: `image://${require(`@/assets/images/icon/topology/subnet-active.svg`)}`,
            symbolSize: subnetSymbolSize,
            symbolKeepAspect: true,
            category: 'subnet',
            clickable: true,
            meta: {
              networkId: network.id,
              projectId: providerStore.getSelectedProjectId,
              gatewayIp: subnet.gatewayIp,
              cidr: subnet.cidr,
            },
            itemStyle: {
              color: 'green',
            },
          });
          eGraphTopologyData.value.links.push({
            source: network.id,
            target: subnet.id,
          });
        });
      }
    });
  }
  // 라우터 노드
  if (topologyData.routers.length > 0) {
    let routerSymbolSize = 50;
    let itemStyleColor = 'green';
    topologyData.routers.forEach((router) => {
      switch (router.originalStatus) {
        case 'DOWN':
          itemStyleColor = '#ddd';
          break;
        case 'BUILD':
          itemStyleColor = 'yellow';
          break;
        case 'ERROR':
          itemStyleColor = 'red';
          break;
      }
      eGraphTopologyData.value.nodes.push({
        id: router.id,
        name: router.name,
        symbol: `image://${require(`@/assets/images/icon/topology/router-${router.originalStatus.toLowerCase()}.svg`)}`,
        symbolSize: routerSymbolSize,
        symbolKeepAspect: true,
        category: 'router',
        clickable: true,
        meta: {
          originalStatus: router.originalStatus,
          externalGatewayInfo: router.externalGatewayInfo,
          routes: router.routes,
        },
        itemStyle: {
          color: itemStyleColor,
        },
      });
    });
  }
  // 노드 연결 정보
  if (topologyData.ports.length > 0) {
    topologyData.ports.forEach((port) => {
      eGraphTopologyData.value.links.push({
        source: port.networkId,
        target: port.deviceId,
      });
    });
  }
};

onMounted(() => {
  getResourceList();
});
</script>
<style lang="scss" scoped></style>
