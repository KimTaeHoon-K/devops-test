<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra>
      <a-button
        size="middle"
        type="default"
        @click="goToPageByName(router, 'router create')"
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

  <!-- 폼 모달 -->
  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'라우터 수정'"
    :origin-data="updateModalData"
    :description-update="false"
    @updateMethod="updateResource"
  />

  <!-- 외부 네트워크 관리 모달 -->
  <RouterExternalNetworkManagementModal
    v-if="showManagementModal"
    v-model="showManagementModal"
    :title="'외부 게이트웨이 관리'"
    :show-modal="showManagementModal"
    :origin-data="managementOriginData"
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
          t(column.title, { data: t('common.content.router') })
        }}</template>
        <template v-else-if="column.dataIndex === 'projectName'">{{
          t(column.title, { data: t('common.content.project') })
        }}</template>
        <template v-else>
          {{ t(column.title) }}
        </template>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <a
            @click="
              goToPageByName(router, 'router detail', {
                id: record.id,
              })
            "
            >{{ text ? text : '(No name)' }}</a
          >
        </template>
        <template v-if="column.dataIndex === 'status'">
          <span>
            <a-tag
              :key="text"
              :color="
                text?.toUpperCase() === 'ACTIVE' ? 'geekblue' : 'lightgray'
              "
            >
              {{ text?.toUpperCase() }}
            </a-tag>
          </span>
        </template>
        <template v-if="column.dataIndex === 'externalGatewayInfo'">
          <span
            >{{
              text?.externalFixedIps[0]?.ipAddress
                ? text?.externalFixedIps[0]?.ipAddress
                : '-'
            }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'createdAt'">
          {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'optionButton'">
          <a-dropdown placement="bottomRight">
            <template #overlay>
              <a-menu>
                <a-menu-item @click="openUpdateFormModal(record)"
                  >{{ t('common.content.action.edit') }}
                </a-menu-item>
                <a-menu-item
                  @click="
                    goToPageByName(router, 'router ip range add', {
                      id: record.id,
                    })
                  "
                  >{{ t('common.content.action.ip-range-add') }}
                </a-menu-item>
                <a-menu-item
                  @click="openManagementModal(record)"
                  :disabled="record.routes.length > 0"
                  >{{ t('common.content.action.external-gateway-management') }}
                </a-menu-item>
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
import {
  deleteRouter,
  getRouterList,
  updateRouter,
} from '@/axios/network-service/RouterApi';
import { RouterType } from '@/types/network/router/RouterListType';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { RouterDeleteType } from '@/types/network/router/RouterDeleteType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import { NetworkType } from '@/types/network/network/NetworkListType';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import { RouterUpdateType } from '@/types/network/router/RouterUpdateType';
import RouterExternalNetworkManagementModal from '@/views/network/router/modal/RouterExternalNetworkManagementModal.vue';

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

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});
const selectedData = ref<{ rows: RouterType[]; keys: string[] }>({
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

const columns: TableColumnType<RouterType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.resource-name',
    dataIndex: 'projectName',
  },
  {
    title: 'common.column.external-fixed-ip',
    dataIndex: 'externalGatewayInfo',
  },
  {
    title: 'common.column.status',
    dataIndex: 'status',
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
const data = ref<RouterType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 라우터 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getRouterList(pageNumber, pageSize)
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

const showManagementModal = ref<boolean>(false);
const managementOriginData = ref<RouterType>({} as RouterType);
const openManagementModal = (router: RouterType) => {
  managementOriginData.value = router;
  showManagementModal.value = true;
};

const openConfirmModal = (action: string, router?: RouterType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '라우터',
    selectedData,
    router?.id,
    router?.name,
    'name',
    action,
    t
  );
  if (router && router.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(router.id);
    selectedData.value.rows.push(router);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

// 자원 삭제 : 라우터 삭제
const routerDeleteForm = ref<RouterDeleteType>({
  routerIds: [] as string[],
});
const deleteResource = (idList: string[]) => {
  routerDeleteForm.value.routerIds = idList;
  deleteRouter(routerDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.router'),
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
          data: t('common.content.router'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 자원 수정: 라우터 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<RouterType>({} as RouterType);
const routerUpdateForm = ref<RouterUpdateType>({
  router: {} as RouterType,
});
const openUpdateFormModal = (router: RouterType) => {
  updateModalData.value = Object.assign({}, router);
  routerUpdateForm.value.router.id = router.id;
  showUpdateModal.value = true;
};
const updateResource = (
  updateForm?: BasicUpdateFormType<NetworkType>,
  externalNetworkUpdateForm?: RouterUpdateType
) => {
  // 라우터 수정
  if (updateForm) {
    routerUpdateForm.value.router.name = updateForm.name;
  }
  // 외부 게이트웨이 관리
  if (externalNetworkUpdateForm) {
    routerUpdateForm.value.router = externalNetworkUpdateForm.router;
  }
  updateRouter(routerUpdateForm.value.router.id, routerUpdateForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.router'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.router'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: RouterType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

onMounted(() => {
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
});
</script>

<style lang="scss" scoped></style>
