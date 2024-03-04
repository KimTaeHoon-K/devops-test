<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra>
      <a-button
        size="middle"
        type="default"
        @click="goToPageByName(router, 'load-balancer create')"
      >
        {{ t('common.content.action.create') }}
      </a-button>
      <a-button
        size="middle"
        type="default"
        @click="openConfirmModal('delete')"
        :disabled="selectedData.rows.length === 0"
      >
        {{ t('common.content.action.delete') }}
      </a-button>
    </template>
  </a-page-header>

  <!-- 모달 -->
  <ConfirmModal
    v-model="showConfirmModal"
    :show-modal="showConfirmModal"
    :title="confirmModalData.title"
    :ok-text="confirmModalData.okText"
    :ok-button-props="confirmModalData.okButtonProps"
    :cancel-text="confirmModalData.cancelText"
    :modal-content="confirmModalData.modalContent"
    :confirm-data="confirmModalData.confirmData"
    @confirmMethod="confirmModalData.confirmMethod"
  />

  <!-- 수정 모달 -->
  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'로드밸런서 수정'"
    :origin-data="updateModalData"
    @updateMethod="updateResource"
  />

  <div class="contents table-wrapper">
    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      :row-key="'id'"
      :pagination="false"
      :loading="isLoading"
      bordered
    >
      <template #title>
        <div class="table-title-wrap">
          <div class="table-title-left">
            <!--<exclamation-circle-outlined />-->
            <!--<span class="text">{{ t('message.table.can-reset-columns') }}</span>-->
          </div>
          <div class="table-title-right">
            <a-tooltip :title="t('common.content.action.refresh')">
              <reload-outlined @click="refresh()" />
            </a-tooltip>
          </div>
        </div>
      </template>
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'name'">{{
          t(column.title, { data: t('common.content.load-balancer') })
        }}</template>
        <template v-else>
          {{ t(column.title) }}
        </template>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <a
            @click="
              goToPageByName(router, 'load-balancer detail', {
                id: record.id,
              })
            "
            >{{ text ? text : '(No name)' }}</a
          >
        </template>
        <template v-if="column.dataIndex === 'provisioningStatus'">
          <span>
            <a-tag :key="text" :color="getStatusColor(text)">
              {{ text.toUpperCase() }}
            </a-tag>
          </span>
        </template>
        <template v-if="column.dataIndex === 'adminStateUp'">
          {{ text ? 'Up' : 'Down' }}
        </template>
        <template v-if="column.dataIndex === 'createdAt'">
          {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'optionButton'">
          <a-dropdown placement="bottomRight">
            <template #overlay>
              <a-menu>
                <a-menu-item @click="openUpdateFormModal(record)">{{
                  t('common.content.action.edit')
                }}</a-menu-item>
                <a-menu-item @click="openConfirmModal('delete', record)">{{
                  t('common.content.action.delete')
                }}</a-menu-item>
              </a-menu>
            </template>
            <ellipsis-outlined />
          </a-dropdown>
        </template>
      </template>
    </a-table>
    <a-pagination
      class="pagination-wrapper"
      v-model:current="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :total="pagination.totalCount"
      :show-total="
        (total, range) => `${range[0]}-${range[1]} of ${total} items`
      "
      :default-current="1"
      :default-page-size="10"
      :show-size-changer="true"
      @change="changePagination"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import { EllipsisOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { dateConverter } from '@/utils/Converter';
import { goToPageByName } from '@/utils/RouterUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import {
  deleteLoadBalancer,
  getLoadBalancerList,
  updateLoadBalancer,
} from '@/axios/network-service/LoadBalancerApi';
import { LoadBalancerType } from '@/types/network/load-balancer/LoadBalancerListType';
import { LoadBalancerUpdateType } from '@/types/network/load-balancer/LoadBalancerUpdateType';
import { LoadBalancerDeleteType } from '@/types/network/load-balancer/LoadBalancerDeleteType';

const providerStore = ProviderStore();
watch(providerStore, (providerStore) => {
  // 프로젝트 별 조회인 경우.
  refresh();
});

const pagination = ref<PaginationType>({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPage: 0,
});

// 페이지 변경
const changePagination = (pageNumber: number, pageSize: number) => {
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  getResourceList(pageNumber, pageSize);
};

const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<LoadBalancerType>();

const loadBalancerUpdateForm = ref<LoadBalancerUpdateType>({
  loadbalancer: {} as LoadBalancerType,
});

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});
const selectedData = ref<{ rows: LoadBalancerType[]; keys: string[] }>({
  rows: [],
  keys: [],
});

const router = useRouter();
const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const isLoading = ref<boolean>(true);

const columns: TableColumnType<LoadBalancerType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.ip-address',
    dataIndex: 'vipAddress',
  },
  {
    title: 'common.column.operating-status',
    dataIndex: 'operatingStatus',
  },
  {
    title: 'common.column.provisioning-status',
    dataIndex: 'provisioningStatus',
  },
  {
    title: 'common.column.admin-status',
    dataIndex: 'adminStateUp',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
    // sorter: true,
  },
  {
    title: '',
    dataIndex: 'optionButton',
    align: 'center',
  },
];
const data = ref<LoadBalancerType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 로드밸런서 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getLoadBalancerList(pageNumber, pageSize)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        pagination.value.totalCount = res.data.totalCount;
        pagination.value.totalPage = res.data.totalPage;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const openConfirmModal = (action: string, loadBalancer?: LoadBalancerType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '로드밸런서',
    selectedData,
    loadBalancer?.id,
    loadBalancer?.name,
    'name',
    action,
    t
  );
  if (loadBalancer && loadBalancer.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(loadBalancer.id);
    selectedData.value.rows.push(loadBalancer);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

// 수정 모달
const openUpdateFormModal = (loadbalancer: LoadBalancerType) => {
  updateModalData.value = loadbalancer;
  loadBalancerUpdateForm.value.loadbalancer = loadbalancer;
  showUpdateModal.value = true;
};

// 자원 수정 : 로드밸런서 수정
const updateResource = (updateForm: BasicUpdateFormType<LoadBalancerType>) => {
  loadBalancerUpdateForm.value.loadbalancer.name = updateForm.name;
  loadBalancerUpdateForm.value.loadbalancer.description =
    updateForm.description;
  updateLoadBalancer(
    loadBalancerUpdateForm.value.loadbalancer.id,
    loadBalancerUpdateForm.value
  )
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.load-balancer'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.load-balancer'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

// 자원 삭제 : 로드밸런서 삭제
const loadBalancerDeleteForm = ref<LoadBalancerDeleteType>({
  loadbalancerIds: [] as string[],
});
const deleteResource = (idList: string[]) => {
  loadBalancerDeleteForm.value.loadbalancerIds = idList;
  deleteLoadBalancer(loadBalancerDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.load-balancer'),
        }),
        'color: #0068ff'
      );
      refresh();
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.load-balancer'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: LoadBalancerType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

const getStatusColor = (status: string) => {
  if (status?.toUpperCase() === 'ACTIVE') {
    return 'geekblue';
  } else if (status?.toUpperCase() === 'ERROR') {
    return 'volcano';
  }
  return 'lightgray';
};

onMounted(() => {
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
});
</script>

<style lang="scss" scoped></style>
