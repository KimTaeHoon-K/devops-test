<template>
  <div class="button-wrapper right">
    <a-button
      size="middle"
      type="default"
      @click="openConfirmModal('deallocate')"
      :disabled="selectedData.rows.length === 0"
    >
      {{ t('common.content.action.deallocate') }}
    </a-button>
  </div>
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

  <div class="table-wrapper">
    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      :row-key="'id'"
      :pagination="false"
      :loading="isLoading"
      bordered
    >
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'projectName'">{{
          t(column.title, { data: t('common.content.project') })
        }}</template>
        <template v-else>
          {{ t(column.title) }}
        </template>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'floatingIpAddress'">
          <a
            @click="
              goToPageByName(router, 'floating ip detail', {
                id: record.id,
              })
            "
            >{{ text ? text : '(No IP)' }}</a
          >
        </template>
        <template v-if="column.dataIndex === 'status'">
          <span>
            <a-tag
              :key="text"
              :color="text?.toUpperCase() === 'UP' ? 'geekblue' : 'lightgray'"
            >
              {{ text?.toUpperCase() }}
            </a-tag>
          </span>
        </template>
        <template v-if="column.dataIndex === 'createdAt'">
          {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'optionButton'">
          <a-dropdown placement="bottomRight">
            <template #overlay>
              <a-menu>
                <a-menu-item
                  @click="
                    goToPageByName(router, 'floating ip edit', {
                      id: record.id,
                    })
                  "
                  >{{ t('common.content.action.edit') }}
                </a-menu-item>
                <a-menu-item @click="openConfirmModal('deallocate', record)"
                  >{{ t('common.content.action.deallocate') }}
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
import { computed, defineProps, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import { EllipsisOutlined } from '@ant-design/icons-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { dateConverter } from '@/utils/Converter';
import { goToPageByName } from '@/utils/RouterUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { getFloatingIpList } from '@/axios/network-service/FloatingApi';
import { FloatingIpType } from '@/types/network/floating-ip/FloatingIpListType';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import { confirmModalContentCreator } from '@/utils/CommonUtil';

const pagination = ref<PaginationType>({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPage: 0,
});

const props = defineProps({
  instanceId: {
    type: String,
    required: true,
  },
});

watch(props, () => {
  if (props.instanceId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
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
const selectedData = ref<{ rows: FloatingIpType[]; keys: string[] }>({
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

const columns: TableColumnType<FloatingIpType>[] = [
  {
    title: 'common.column.floating-ip',
    dataIndex: 'floatingIpAddress',
  },
  {
    title: 'common.column.resource-name',
    dataIndex: 'projectName',
  },
  {
    title: 'common.column.status',
    dataIndex: 'status',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
  },
  {
    title: '',
    dataIndex: 'optionButton',
  },
];
const data = ref<FloatingIpType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 유동 IP 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getFloatingIpList(pageNumber, pageSize, null, props.instanceId)
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

const openConfirmModal = (action: string, floatingIp?: FloatingIpType) => {
  if (action === 'deallocate') {
    confirmModalData.value.confirmMethod = deallocateResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '유동 IP',
    selectedData,
    floatingIp?.id,
    floatingIp?.floatingIpAddress,
    'floatingIpAddress',
    action,
    t
  );
  if (floatingIp && floatingIp.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(floatingIp.id);
    selectedData.value.rows.push(floatingIp);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

// 자원 삭제 : 유동 IP 삭제
const deallocateResource = (idList?: string | string[]) => {
  console.log(idList);
  // deallocateFloatingIp(idList)
  //   .then((res) => {
  //     openNotification(
  //       true,
  //       '삭제가 성공적으로 완료되었습니다.',
  //       'color: #0068ff'
  //     );
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     openNotification(
  //       false,
  //       '삭제에 실패하였습니다.\n' + err.code + err.message,
  //       'color: #ff4d4f'
  //     );
  //   });
};

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: FloatingIpType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

onMounted(() => {
  if (props.instanceId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
});
</script>

<style lang="scss" scoped></style>
