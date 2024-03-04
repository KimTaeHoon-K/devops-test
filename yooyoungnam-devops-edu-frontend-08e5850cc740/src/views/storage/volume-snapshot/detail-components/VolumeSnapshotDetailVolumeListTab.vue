<template>
  <div class="button-wrapper right">
    <a-button
      size="middle"
      type="default"
      @click="openConfirmModal('delete')"
      :disabled="selectedData.rows.length === 0"
    >
      {{ t('common.content.action.delete') }}
    </a-button>
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
          t(column.title, { data: t('common.content.volume') })
        }}</template>
        <template v-else>
          {{ t(column.title) }}
        </template></template
      >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <a
            @click="
              goToPageByName(router, 'volume detail', {
                id: record.id,
              })
            "
            >{{ text ? text : '(No name)' }}</a
          >
        </template>
        <template v-if="column.dataIndex === 'size'">
          {{ gibConverter(text) }}
        </template>
        <template v-if="column.dataIndex === 'attachments'">
          <span>
            {{
              text?.length > 0
                ? text[0].device +
                  ' on ' +
                  (text[0].serverName ? text[0].serverName : '삭제된 인스턴스')
                : '-'
            }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'bootable'">
          <span>
            {{ text ? 'Yes' : 'No' }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'multiattach'">
          <span>
            {{ text ? 'Yes' : 'No' }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'status'">
          <span>
            <a-tag :key="text" :color="getStatusColor(text)">
              {{ text?.toUpperCase() }}
            </a-tag>
          </span>
        </template>
        <template v-if="column.dataIndex === 'createdAt'">
          {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
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
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { dateConverter, gibConverter } from '@/utils/Converter';
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
  deleteVolume,
  getVolumeListByVolumeSnapshotId,
} from '@/axios/storage-service/VolumeApi';
import { VolumeType } from '@/types/storage/volume/VolumeListType';
import { VolumeDeleteType } from '@/types/storage/volume/VolumeDeleteType';

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

const props = defineProps({
  volumeSnapshotId: {
    type: String,
    required: true,
  },
});

watch(props, () => {
  if (props.volumeSnapshotId) {
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

const selectedData = ref<{ rows: VolumeType[]; keys: string[] }>({
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

const columns: TableColumnType<VolumeType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
  },
  {
    title: 'common.column.capacity',
    dataIndex: 'size',
  },
  {
    title: 'common.column.type',
    dataIndex: 'volumeType',
  },
  {
    title: 'common.column.location',
    dataIndex: 'attachments',
  },
  {
    title: 'common.column.booting',
    dataIndex: 'bootable',
  },
  {
    title: 'common.column.shared',
    dataIndex: 'multiattach',
  },
  {
    title: 'common.column.status',
    dataIndex: 'status',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
  },
];
const data = ref<VolumeType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 볼륨 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getVolumeListByVolumeSnapshotId(pageNumber, pageSize, props.volumeSnapshotId)
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

const getStatusColor = (status: string) => {
  if (status?.toUpperCase() === 'IN-USE') {
    return 'geekblue';
  } else if (status?.toUpperCase() === 'ERROR') {
    return 'volcano';
  }
  return 'lightgray';
};

const openConfirmModal = (action: string, volume?: VolumeType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '볼륨',
    selectedData,
    volume?.id,
    volume?.name,
    'name',
    action,
    t
  );
  if (volume && volume.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(volume.id);
    selectedData.value.rows.push(volume);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

const volumeDeleteForm = ref<VolumeDeleteType>({
  volumeIds: [] as string[],
});
// 자원 삭제 : 볼륨 스냅샷 삭제
const deleteResource = (idList: string[]) => {
  volumeDeleteForm.value.volumeIds = idList;
  deleteVolume(volumeDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.volume'),
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
          data: t('common.content.volume'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: VolumeType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

onMounted(() => {
  if (props.volumeSnapshotId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
});
</script>
