<template>
  <div class="button-wrapper right">
    <a-space class="space-block" :size="SizeConst.sixteen">
      <a-button size="middle" type="default" @click="openCreateModal">
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
    </a-space>
  </div>

  <!-- 모달 -->
  <ConfirmModal
    v-model:confirm-modal-data="confirmModalData"
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

  <!-- 정적 경로 추가 모달 -->
  <StaticRouteCreateFormModal
    :router-id="props.routerId"
    v-if="showCreateModel"
    v-model="showCreateModel"
    v-model:is-succeed="isSucceed"
    :show-modal="showCreateModel"
    :title="'정적 경로 추가'"
  />

  <div class="table-wrapper">
    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      :row-key="'id'"
      :pagination="false"
      :loading="props.isLoading"
      bordered
    >
      <template #headerCell="{ column }">{{ t(column.title) }}</template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'optionButton'">
          <a-dropdown placement="bottomRight">
            <template #overlay>
              <a-menu>
                <a-menu-item @click="openConfirmModal('delete', record)"
                  >{{ t('common.content.action.delete') }}
                </a-menu-item>
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
import { computed, defineEmits, defineProps, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import { EllipsisOutlined } from '@ant-design/icons-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { VolumeSnapshotType } from '@/types/storage/volume-snapshot/VolumeSnapshotListType';
import { openNotification } from '@/utils/CommonUtil';
import { RouterType } from '@/types/network/router/RouterListType';
import StaticRouteCreateFormModal from '@/views/network/router/modal/StaticRouteCreateFormModal.vue';
import { deleteRouterStaticRoute } from '@/axios/network-service/RouterApi';
import { HostRouteType } from '@/types/network/common/NetworkCommonType';
import { SizeConst } from '@/types/common/constant/SizeConst';

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
  selectedData.value = { keys: [], rows: [] };
  getResourceList();
};

const emits = defineEmits({});

const showCreateModel = ref<boolean>(false);
const isSucceed = ref<boolean>(false);
const openCreateModal = () => {
  showCreateModel.value = true;
};

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});

const selectedData = ref<{ rows: HostRouteType[]; keys: string[] }>({
  rows: [],
  keys: [],
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const props = defineProps({
  routerId: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  routesData: {
    type: Object as () => HostRouteType[],
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

watch([isSucceed, props], () => {
  if (isSucceed.value) {
    isSucceed.value = false;
    emits('update:isSucceed', true);
  }
  if (props.isLoading) {
    refresh();
  }
});

const columns: TableColumnType<VolumeSnapshotType>[] = [
  {
    title: 'common.column.destination-cidr',
    dataIndex: 'destination',
  },
  {
    title: 'Next Hop',
    dataIndex: 'nexthop',
  },
  {
    title: '',
    dataIndex: 'optionButton',
    align: 'center',
  },
];
const data = ref<HostRouteType[]>([]);

// 새로고침
const refresh = () => {
  data.value = [];
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList();
};

// 자원 목록 조회 : 서브넷 목록 조회
const getResourceList = () => {
  propsDataToTableData();
};

const propsDataToTableData = () => {
  // 임의 ID 값 부여
  props.routesData?.map((route, index) => {
    data.value.push({
      id: index.toString(),
      ...route,
    });
  });
};

const openConfirmModal = (action: string, route?: HostRouteType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  // 일반 삭제 메시지와 다르게 destination / nexthop 형태로 노출
  let title = '정적 경로';
  let messageData = '';
  if (route) {
    messageData = `${route.destination} / ${route.nexthop}`;
  } else {
    messageData = `${selectedData.value.rows.map(
      (rt: HostRouteType) => rt.destination + ' / ' + rt.nexthop
    )}`;
  }
  confirmModalData.value.modalContent = t(`message.confirm.${action}`, {
    title: title,
    data: messageData,
  });
  if (route && route.destination) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(route.destination);
    selectedData.value.rows.push(route);
  }
  // 일반 삭제와 다르게 keys 가 아닌 rows 전달
  confirmModalData.value.confirmData = selectedData.value.rows;
  showConfirmModal.value = true;
};

// 자원 삭제 : 정적 경로 삭제
const deleteResource = (routeList: HostRouteType[]) => {
  let routerUpdateForm = { router: {} as RouterType };
  routerUpdateForm.router.id = props.routerId;
  routerUpdateForm.router.routes = [];
  routeList.map((route) => {
    routerUpdateForm.router.routes.push(route);
  });
  deleteRouterStaticRoute(props.routerId, routerUpdateForm)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.static-route'),
        }),
        'color: #0068ff'
      );
      isSucceed.value = true;
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.static-route'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: HostRouteType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

onMounted(() => {
  getResourceList();
});
</script>
