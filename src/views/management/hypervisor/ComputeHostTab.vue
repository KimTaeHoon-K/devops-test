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
  />
  <a-table
    :row-selection="rowSelection"
    :columns="columns"
    :data-source="data"
    :row-key="'hypervisorId'"
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
      <template v-if="column.dataIndex === 'hypervisorHostName'">{{
        t(column.title, { data: t('common.content.host') })
      }}</template>
      <template v-else>
        {{ t(column.title) }}
      </template>
    </template>
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'hypervisorHostName'">
        <a
          @click="
            goToPageByName(router, 'compute-host detail', {
              id: record.hypervisorId,
            })
          "
          >{{ text ? text : '(No name)' }}</a
        >
      </template>
      <template v-if="column.dataIndex === 'status'">
        <span>
          <a-tag
            :key="text"
            :color="text === 'enabled' ? 'geekblue' : 'lightgray'"
          >
            {{ text.toUpperCase() }}
          </a-tag>
        </span>
      </template>
      <template v-else-if="column.dataIndex === 'state'">
        <span>
          <a-tag :key="text" :color="text === 'up' ? 'geekblue' : 'lightgray'">
            {{ text.toUpperCase() }}
          </a-tag>
        </span>
      </template>
      <template v-else-if="column.dataIndex === 'optionButton'">
        <a-dropdown placement="bottomRight">
          <template #overlay>
            <a-menu>
              <a-menu-item
                @click="
                  openConfirmModal(
                    'changeStatus',
                    record.hypervisorId,
                    record.hypervisorHostName
                  )
                "
                >상태 변경</a-menu-item
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
import { goToPageByName } from '@/utils/RouterUtil';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { ComputeHostType } from '@/types/compute/hypervisor/ComputeHostListType';
import { getComputeHostList } from '@/axios/compute-service/HypervisorApi';
import { PaginationType } from '@/types/common/PaginationType';

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

const selectedData = ref<{ rows: ComputeHostType[]; keys: string[] }>({
  rows: [],
  keys: [],
});

// const props = defineProps({
//   btnStatus: Boolean
// })

const btnStatusEmits = defineEmits(['update:btnValue']);
// const dataEmits = defineEmits(['update:selectedData'])

const handleBtn = (e: number, selectedData: object) => {
  if (e > 0) {
    btnStatusEmits('update:btnValue', false);
  } else {
    btnStatusEmits('update:btnValue', true);
  }
  // dataEmits('update:selectedData', selectedData)
};

const router = useRouter();
const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const isLoading = ref<boolean>(true);

const columns: TableColumnType<ComputeHostType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'hypervisorHostName',
    // sorter: true,
  },
  {
    title: 'common.column.service-status',
    dataIndex: 'status',
    // sorter: true,
  },
  {
    title: 'common.column.service-state',
    dataIndex: 'state',
    // sorter: true,
  },
  {
    title: '',
    dataIndex: 'optionButton',
    align: 'center',
  },
];
const data = ref<ComputeHostType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 컴퓨트 호스트 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getComputeHostList(pageNumber, pageSize)
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

// TODO: 개발 시 수정
const openConfirmModal = (action: string, id?: string, name?: string) => {
  if (action === 'changeStatus') {
    if (!id) {
      confirmModalData.value.modalContent =
        '컴퓨트 호스트 ' +
        selectedData.value.rows.map(
          (row: ComputeHostType) => row.hypervisorHostName
        ) +
        '을 활성화/비활성화 하시겠습니까?';
      confirmModalData.value.confirmData = selectedData.value.keys;
    } else {
      confirmModalData.value.modalContent =
        '컴퓨트 호스트 ' + name + '을 활성화/비활성화 하시겠습니까?';
      confirmModalData.value.confirmData = id;
    }
    // confirmModalData.value.confirmMethod = deleteResource;
  }
  showConfirmModal.value = true;
};

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: ComputeHostType[]) => {
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
