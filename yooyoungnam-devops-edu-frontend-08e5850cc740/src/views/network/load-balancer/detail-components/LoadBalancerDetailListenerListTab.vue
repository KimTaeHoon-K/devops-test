<template>
  <div class="button-wrapper right">
    <a-space class="space-block" :size="SizeConst.sixteen">
      <a-button
        size="middle"
        type="default"
        @click="
          goToPageByName(router, 'load-balancer listener create', {
            id: props.loadBalancerId,
          })
        "
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
      <template #headerCell="{ column }"
        ><template v-if="column.dataIndex === 'name'">{{
          t(column.title, { data: t('common.content.listener') })
        }}</template>
        <template v-else>
          {{ t(column.title) }}
        </template></template
      >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <a
            @click="
              goToPageByName(router, 'listener detail', {
                id: props.loadBalancerId,
                subnetId: record.id,
              })
            "
            >{{ text ? text : '(No name)' }}</a
          >
        </template>
        <template v-if="column.dataIndex === 'adminStateUp'">
          {{ text ? 'Up' : 'Down' }}
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
                    goToPageByName(router, 'load-balancer listener update', {
                      id: props.loadBalancerId,
                      listenerId: record.id,
                    })
                  "
                  >{{ t('common.content.action.edit') }}
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
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import {
  deleteListener,
  getListenerList,
} from '@/axios/network-service/ListenerApi';
import { ListenerDeleteType } from '@/types/network/load-balancer/listener/ListenerDeleteType';
import { ListenerType } from '@/types/network/load-balancer/listener/ListenerListType';
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

const selectedData = ref<{ rows: ListenerType[]; keys: string[] }>({
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

const props = defineProps({
  loadBalancerId: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
});

watch(props, () => {
  if (props.loadBalancerId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
});

const isLoading = ref<boolean>(true);

const columns: TableColumnType<ListenerType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
  },
  {
    title: 'common.column.protocol',
    dataIndex: 'protocol',
  },
  {
    title: 'common.column.port',
    dataIndex: 'protocolPort',
  },
  {
    title: 'common.column.status',
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
  },
  {
    title: '',
    dataIndex: 'optionButton',
    align: 'center',
  },
];
const data = ref<ListenerType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 리스너 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getListenerList(pageNumber, pageSize, props.loadBalancerId)
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

const openConfirmModal = (action: string, listener?: ListenerType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '리스너',
    selectedData,
    listener?.id,
    listener?.name,
    'name',
    action,
    t
  );
  if (listener && listener.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(listener.id);
    selectedData.value.rows.push(listener);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

const listenerDeleteForm = ref<ListenerDeleteType>({
  listenerIds: [] as string[],
});
// 자원 삭제 : 리스너 삭제
const deleteResource = (idList: string[]) => {
  listenerDeleteForm.value.listenerIds = idList;
  deleteListener(listenerDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.listener'),
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
          data: t('common.content.listener'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: ListenerType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

onMounted(() => {
  if (props.loadBalancerId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
});
</script>
