<template>
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
    @confirmMethod="deleteResource"
  />

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
        t(column.title, { data: t('common.content.host-aggregates') })
      }}</template>
      <template v-else>
        {{ t(column.title) }}
      </template>
    </template>
    <template #bodyCell="{ column, text, record, index }">
      <template v-if="column.dataIndex === 'name'">
        <a
          @click="
            goToPageByName(router, 'host-aggregates detail', {
              id: record.id,
            })
          "
          >{{ text ? text : '(No name)' }}</a
        >
      </template>
      <template v-else-if="column.dataIndex === 'availabilityZone'">
        <span>
          {{ text !== null ? text : '-' }}
        </span>
      </template>
      <template v-else-if="column.dataIndex === 'hosts'">
        {{ text.length ? text.length : '-' }}
      </template>
      <template v-else-if="column.dataIndex === 'metadata'">
        {{ Object.keys(text).length !== 0 ? text : '-' }}
      </template>
      <template v-else-if="column.dataIndex === 'createdAt'">
        {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
      </template>
      <template v-if="column.dataIndex === 'optionButton'">
        <a-dropdown placement="bottomRight">
          <template #overlay>
            <a-menu>
              <a-menu-item>호스트 관리</a-menu-item>
              <a-menu-item>메타데이터 관리</a-menu-item>
              <a-menu-item @click="openConfirmModal('delete', record)"
                >삭제</a-menu-item
              >
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
    :show-total="(total, range) => `${range[0]}-${range[1]} of ${total} items`"
    :default-current="1"
    :default-page-size="10"
    :show-size-changer="true"
    @change="changePagination"
  />
</template>

<script lang="ts" setup>
import { computed, defineEmits, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import { EllipsisOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { dateConverter } from '@/utils/Converter';
import { goToPageByName } from '@/utils/RouterUtil';
import { HypervisorType } from '@/types/compute/hypervisor/HypervisorListType';
import { HostAggregatesType } from '@/types/compute/host-aggregates/HostAggregatesListType';
import {
  deleteHostAggregates,
  getHostAggregatesList,
} from '@/axios/compute-service/HostAggregatesApi';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { PaginationType } from '@/types/common/PaginationType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';

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
const selectedData = ref<{ rows: HostAggregatesType[]; keys: string[] }>({
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

const btnStatusEmits = defineEmits(['update:btnValue']);

const handleBtn = (e: number, selectedData: object) => {
  if (e > 0) {
    btnStatusEmits('update:btnValue', false);
  } else {
    btnStatusEmits('update:btnValue', true);
  }
};

const activeKey = ref('1');

const isLoading = ref<boolean>(true);

const columns: TableColumnType<HypervisorType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.availability-zone',
    dataIndex: 'availabilityZone',
    // sorter: true,
  },
  {
    title: 'common.column.host-count',
    dataIndex: 'hosts',
    // sorter: true,
  },
  {
    title: 'common.column.metadata',
    dataIndex: 'metadata',
    // sorter: true,
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

const data = ref<HostAggregatesType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 호스트 집합 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getHostAggregatesList(pageNumber, pageSize)
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

const openConfirmModal = (
  action: string,
  hostAggregates?: HostAggregatesType
) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '호스트 집합',
    selectedData,
    hostAggregates?.id,
    hostAggregates?.name,
    'name',
    action,
    t
  );
  if (hostAggregates && hostAggregates.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(hostAggregates.id);
    selectedData.value.rows.push(hostAggregates);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

// 자원 삭제 : 호스트 집합 삭제
const deleteResource = (idList?: string | string[]) => {
  showConfirmModal.value = false;
  console.log(idList);
  deleteHostAggregates(idList)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.host-aggregates'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.host-aggregates'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

const rowSelection = computed(() => {
  return {
    onChange: (
      selectedRowKeys: string[],
      selectedRows: HostAggregatesType[]
    ) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      handleBtn(selectedRowKeys.length, selectedData);
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

onMounted(() => {
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
});
</script>

<style lang="scss" scoped></style>
