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
    @confirmMethod="confirmModalData.confirmMethod"
    @cancelMethod="cancelModal"
  />

  <!-- QoS Specs 생성 모달 -->
  <QosSpecsCreateFormModal
    v-if="showCreateModel"
    v-model="showCreateModel"
    v-model:is-succeed="isSucceed"
    :show-modal="showCreateModel"
    :title="'QoS Specs 생성'"
    @cancelMethod="cancelModal"
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
        t(column.title, { data: t('common.content.qos') })
      }}</template>
      <template v-else>
        {{ t(column.title) }}
      </template>
    </template>
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'name'">
        <a
          @click="
            goToPageByName(router, 'volume type detail', {
              id: record.id,
            })
          "
          >{{ text ? text : '(No name)' }}</a
        >
      </template>
      <template v-if="column.dataIndex === 'specs'">
        <span v-if="Object.keys(text).length === 0">-</span>
        <span v-for="(objKey, idx) in Object.keys(text)" v-bind:key="objKey">
          {{ objKey + '=' + text[objKey]
          }}{{ idx === Object.keys(text).length - 1 ? '' : ', ' }}
        </span>
      </template>
      <template v-if="column.dataIndex === 'optionButton'">
        <a-dropdown placement="bottomRight">
          <template #overlay>
            <a-menu>
              <a-menu-item
                @click="
                  goToPageByName(router, 'volume type edit', {
                    id: record.id,
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
    :show-total="(total, range) => `${range[0]}-${range[1]} of ${total} items`"
    :default-current="1"
    :default-page-size="10"
    :show-size-changer="true"
    @change="changePagination"
  />
</template>

<script lang="ts" setup>
import {
  computed,
  defineEmits,
  defineProps,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import { EllipsisOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { goToPageByName } from '@/utils/RouterUtil';
import { PaginationType } from '@/types/common/PaginationType';
import {
  deleteQosSpecs,
  getQosSpecsList,
} from '@/axios/storage-service/VolumeTypeApi';
import { QosSpecsType } from '@/types/storage/volume-type/QosSpecsListType';
import { QosSpecsDeleteType } from '@/types/storage/volume-type/QosSpecsDeleteType';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import QosSpecsCreateFormModal from '@/views/storage/volume-type/modal/QosSpecsCreateFormModal.vue';

const props = defineProps({
  showConfirmModalProp: {
    type: Boolean,
    default: false,
  },
  showCreateModalProp: {
    type: Boolean,
    default: false,
  },
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

const cancelModal = (action: string) => {
  if (action === 'confirm') {
    emit('update:showConfirmModalProp', false);
  } else if (action === 'create') {
    emit('update:showCreateModalProp', false);
  } else if (action === 'update') {
    emit('update:showUpdateModalProp', false);
  }
};

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

const selectedData = ref<{ rows: QosSpecsType[]; keys: string[] }>({
  rows: [],
  keys: [],
});

const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const isLoading = ref<boolean>(true);

const columns: TableColumnType<QosSpecsType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
  },
  {
    title: 'common.column.consumer',
    dataIndex: 'consumer',
  },
  {
    title: 'common.column.specs',
    dataIndex: 'specs',
  },
  {
    title: '',
    dataIndex: 'optionButton',
    align: 'center',
  },
];
const data = ref<QosSpecsType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 볼륨 타입 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getQosSpecsList(pageNumber, pageSize)
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

const openConfirmModal = (action: string, qosSpecs?: QosSpecsType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    'QoS Specs',
    selectedData,
    qosSpecs?.id,
    qosSpecs?.name,
    'name',
    action,
    t
  );
  if (qosSpecs && qosSpecs.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(qosSpecs.id);
    selectedData.value.rows.push(qosSpecs);
  }
  emit('update:selectedDataCount', selectedData.value.rows.length);
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

// 자원 삭제 : QoS Specs 삭제
const qosSpecsDeleteType = ref<QosSpecsDeleteType>({
  qosIds: [] as string[],
  projectId: '',
});
const deleteResource = (idList: string[]) => {
  qosSpecsDeleteType.value.qosIds = idList;
  deleteQosSpecs(qosSpecsDeleteType.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.qos-specs'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.qos-specs'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      emit('update:showConfirmModalProp');
    });
};

const emit = defineEmits({});

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: QosSpecsType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      emit('update:selectedDataCount', selectedRows.length);
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

watch([props, isSucceed], () => {
  if (props.showConfirmModalProp) {
    openConfirmModal('delete');
  }
  if (props.showCreateModalProp) {
    openCreateModal();
  }
  if (isSucceed.value) {
    isSucceed.value = false;
    emit('update:showCreateModalProp');
    refresh();
  }
});

onMounted(() => {
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
});
onUnmounted(() => {
  emit('update:selectedDataCount', 0);
});
</script>

<style lang="scss" scoped></style>
