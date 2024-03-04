<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra>
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

  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'인스턴스 스냅샷 수정'"
    :origin-data="updateModalData"
    :description-update="false"
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
          t(column.title, { data: t('common.content.instance-snapshot') })
        }}</template>
        <template v-else-if="column.dataIndex === 'ownerProjectName'">{{
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
              goToPageByName(router, 'instance snapshot detail', {
                id: record.id,
              })
            "
            >{{ text ? text : '(No name)' }}</a
          >
        </template>
        <template v-if="column.dataIndex === 'createdAt'">
          {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'optionButton'">
          <a-dropdown placement="bottomRight">
            <template #overlay>
              <a-menu>
                <a-menu-item @click="openUpdateFormModal(record)">{{
                  t('common.content.action.edit')
                }}</a-menu-item>
                <a-menu-item>{{
                  `${t('common.content.instance')} ${t(
                    'common.content.action.create'
                  )}`
                }}</a-menu-item>
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
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { InstanceSnapshotType } from '@/types/compute/instance-snapshot/InstanceSnapshotListType';
import { PaginationType } from '@/types/common/PaginationType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { InstanceSnapshotDeleteType } from '@/types/compute/instance-snapshot/InstanceSnapshotDeleteType';
import {
  deleteInstanceSnapshot,
  getInstanceSnapshotList,
  updateInstanceSnapshot,
} from '@/axios/compute-service/InstanceSnapshotApi';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import { InstanceSnapshotUpdateType } from '@/types/compute/instance-snapshot/InstanceSnapshotUpdateType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';

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

const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<InstanceSnapshotType>();

const selectedData = ref<{ rows: InstanceSnapshotType[]; keys: string[] }>({
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

const columns: TableColumnType<InstanceSnapshotType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.resource-name',
    dataIndex: 'ownerProjectName',
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
const data = ref<InstanceSnapshotType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 인스턴스 스냅샷 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getInstanceSnapshotList(pageNumber, pageSize)
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

const openUpdateFormModal = (instanceSnapshot: InstanceSnapshotType) => {
  updateModalData.value = instanceSnapshot;
  instanceSnapshotUpdateForm.value.snapshot = instanceSnapshot;
  showUpdateModal.value = true;
};

const instanceSnapshotUpdateForm = ref<InstanceSnapshotUpdateType>({
  snapshot: {} as InstanceSnapshotType,
});
const updateResource = (
  updateForm: BasicUpdateFormType<InstanceSnapshotType>
) => {
  instanceSnapshotUpdateForm.value.snapshot.name = updateForm.name;
  instanceSnapshotUpdateForm.value.snapshot.description =
    updateForm.description;
  updateInstanceSnapshot(
    instanceSnapshotUpdateForm.value.snapshot.id,
    instanceSnapshotUpdateForm.value
  )
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.instance-snapshot'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.instance-snapshot'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

const openConfirmModal = (
  action: string,
  instanceSnapshot?: InstanceSnapshotType
) => {
  if (action === 'delete') {
    if (
      (instanceSnapshot && instanceSnapshot.protected) ||
      (!instanceSnapshot && !canDelete.value)
    ) {
      confirmModalData.value.modalContent =
        '해당 인스턴스 스냅샷 보호된 인스턴스 스냅샷입니다. 보호 해제 뒤 다시 시도해 주세요.';
      confirmModalData.value.okButtonProps = { hidden: true };
      confirmModalData.value.cancelText = '확인';
      showConfirmModal.value = true;
      return;
    } else {
      confirmModalData.value.confirmMethod = deleteResource;
    }
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '인스턴스 스냅샷',
    selectedData,
    instanceSnapshot?.id,
    instanceSnapshot?.name,
    'name',
    action,
    t
  );
  if (instanceSnapshot && instanceSnapshot.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(instanceSnapshot.id);
    selectedData.value.rows.push(instanceSnapshot);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

const instanceSnapshotDeleteForm = ref<InstanceSnapshotDeleteType>({
  snapshotIds: [] as string[],
});
// 자원 삭제 : 인스턴스 스냅샷 삭제
const deleteResource = (idList: string[]) => {
  instanceSnapshotDeleteForm.value.snapshotIds = idList;
  deleteInstanceSnapshot(instanceSnapshotDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.flavor'),
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
          data: t('common.content.flavor'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

const canDelete = ref<boolean>(true);
const rowSelection = computed(() => {
  return {
    onChange: (
      selectedRowKeys: string[],
      selectedRows: InstanceSnapshotType[]
    ) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      canDelete.value = selectedRows.filter((row) => row.protected).length <= 0;
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

onMounted(() => {
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
});
</script>
