<template>
  <div class="button-wrapper right">
    <a-space class="space-block" :size="SizeConst.sixteen">
      <a-button size="middle" type="default" @click="openCreateMetadataModal">
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

  <!-- 메타데이터 생성 모달 -->
  <MetadataCreateFormModal
    v-if="showCreateMetadataModal"
    v-model="showCreateMetadataModal"
    :show-modal="showCreateMetadataModal"
    :title="
      t('common.content.action.resource-create', {
        data: t('common.content.metadata'),
      })
    "
    @createMethod="createResource"
  />

  <!-- 폼 모달 -->
  <MetadataUpdateFormModal
    v-if="showUpdateMetadataModal"
    v-model="showUpdateMetadataModal"
    :show-modal="showUpdateMetadataModal"
    :title="'메타데이터 수정'"
    :origin-data="updateMetadataModalData"
    @updateMethod="updateResource"
  />

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
      :data-source="props.metadataInfoData"
      :row-key="'id'"
      :pagination="tablePagination"
      :loading="props.isLoading"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'optionButton'">
          <a-dropdown placement="bottomRight">
            <template #overlay>
              <a-menu>
                <a-menu-item @click="openUpdateMetadataModal(record)">{{
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
  </div>
</template>

<script lang="ts" setup>
import { computed, defineEmits, defineProps, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { TableColumnType } from 'ant-design-vue';
import { EllipsisOutlined } from '@ant-design/icons-vue';
import { MetadataType } from '@/types/common/MetadataType';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import MetadataCreateFormModal from '@/components/modal/MetadataCreateFormModal.vue';
import { MetadataCreateFormType } from '@/types/common/MetadataCreateFormType';
import { MetadataDeleteType } from '@/types/common/MetadataDeleteType';
import MetadataUpdateFormModal from '@/components/modal/MetadataUpdateFormModal.vue';
import { MetadataUpdateFormType } from '@/types/common/MetadataUpdateFormType';
import { PaginationType } from '@/types/common/PaginationType';
import { SizeConst } from '@/types/common/constant/SizeConst';

const props = defineProps({
  title: String,
  metadataInfoData: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

watch(props, () => {
  if (props.metadataInfoData) {
    pagination.value.totalCount = props.metadataInfoData.length;
    pagination.value.totalPage =
      pagination.value.totalCount / pagination.value.pageSize;
  }
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const pagination = ref<PaginationType>({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPage: 0,
});

const tablePagination = computed(() => ({
  total: pagination.value.totalCount,
  current: pagination.value.currentPage,
  pageSize: pagination.value.pageSize,
  showTotal: (total: any, range: any[]) =>
    `${range[0]}-${range[1]} of ${total} items`,
  showSizeChanger: true,
  onChange: (current: number, pageSize: number) => {
    selectedData.value = { keys: [], rows: [] };
    if (pagination.value.pageSize === pageSize) {
      pagination.value.currentPage = current;
    } else {
      pagination.value.currentPage = 1;
    }
    pagination.value.pageSize = pageSize;
  },
}));

const selectedData = ref<{ rows: MetadataType[]; keys: string[] }>({
  rows: [],
  keys: [],
});

const columns: TableColumnType<MetadataType>[] = [
  {
    title: 'Key',
    dataIndex: 'key',
  },
  {
    title: 'Value',
    dataIndex: 'value',
  },
  {
    title: '',
    dataIndex: 'optionButton',
    align: 'center',
  },
];

const emit = defineEmits({});

// 메타데이터 생성
const showCreateMetadataModal = ref<boolean>(false);
const openCreateMetadataModal = () => {
  showCreateMetadataModal.value = true;
};
const createResource = (metadataCreateData: MetadataCreateFormType) => {
  emit('createResource', metadataCreateData);
};

// 메타데이터 수정
const showUpdateMetadataModal = ref<boolean>(false);
const updateMetadataModalData = ref<MetadataType>({} as MetadataType);
const metadataUpdateForm = ref<MetadataUpdateFormType>(
  {} as MetadataUpdateFormType
);
const openUpdateMetadataModal = (metadata: MetadataType) => {
  updateMetadataModalData.value = Object.assign({}, metadata);
  metadataUpdateForm.value.key = metadata.key;
  showUpdateMetadataModal.value = true;
};
const updateResource = (metadataUpdateData: MetadataUpdateFormType) => {
  emit('updateResource', metadataUpdateData);
};

// 메타데이터 삭제
const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});
const openConfirmModal = (action: string, metadata?: MetadataType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  // 일반 삭제 메시지와 반대로 id(key) / value 형태로 노출
  let title = '메타데이터';
  let messageData = '';
  if (metadata) {
    messageData = `${metadata.key} / ${metadata.value}`;
  } else {
    messageData = `${selectedData.value.rows.map(
      (md: MetadataType) => md.key + ' / ' + md.value
    )}`;
  }
  confirmModalData.value.modalContent = t(`message.confirm.${action}`, {
    title: title,
    data: messageData,
  });
  if (metadata && metadata.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(metadata.id);
    selectedData.value.rows.push(metadata);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

const deleteResource = (keyNames: string[]) => {
  const metadataDeleteData = {} as MetadataDeleteType;
  metadataDeleteData.keyNames = keyNames;
  emit('deleteResource', metadataDeleteData);
};

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: MetadataType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

onMounted(() => {
  if (props.metadataInfoData) {
    pagination.value.totalCount = props.metadataInfoData.length;
    pagination.value.totalPage =
      pagination.value.totalCount / pagination.value.pageSize;
  }
});
</script>
<style scoped></style>
