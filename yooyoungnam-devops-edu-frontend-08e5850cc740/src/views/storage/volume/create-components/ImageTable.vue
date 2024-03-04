<template>
  <a-table
    :row-selection="rowSelection"
    :columns="columns"
    :data-source="data"
    :row-key="'id'"
    :pagination="false"
    :loading="isLoading"
    :scroll="{ y: 300 }"
    bordered
  >
    <template #headerCell="{ column }">
      <template v-if="column.dataIndex === 'name'">{{
        t(column.title, { data: t('common.content.image') })
      }}</template>
      <template v-else>
        {{ t(column.title) }}
      </template>
    </template>
    <template #bodyCell="{ column, text }">
      <template v-if="column.dataIndex === 'name'">
        {{ text ? text : '(No name)' }}
      </template>
      <template v-if="column.dataIndex === 'isProtected'">
        <span v-if="text">
          <lock-outlined :style="{ color: '#DE350B' }" />
        </span>
        <span v-else-if="!text">
          <unlock-outlined :style="{ color: '#1890ff' }" />
        </span>
      </template>
      <template v-if="column.dataIndex === 'size'">
        {{ bytesToGibConverter(text) }}
      </template>
      <template v-if="column.dataIndex === 'status'">
        <span>
          <a-tag :key="text" :color="getStatusColor(text)">
            {{ text.toUpperCase() }}
          </a-tag>
        </span>
      </template>
      <template v-if="column.dataIndex === 'createdAt'">
        {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
      </template>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import type { TableColumnType } from 'ant-design-vue';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons-vue';
import { computed, onMounted, onUnmounted, ref, defineEmits, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { PaginationType } from '@/types/common/PaginationType';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { getImageList } from '@/axios/compute-service/ImageApi';
import { ImageType } from '@/types/compute/image/ImageListType';
import { bytesToGibConverter, dateConverter } from '@/utils/Converter';
import { ProviderStore } from '@/stores/provider/ProviderStore';

const providerStore = ProviderStore();
watch(providerStore, () => {
  refresh();
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const pagination = ref<PaginationType>({
  currentPage: 1,
  pageSize: Number.MAX_SAFE_INTEGER,
  totalCount: 0,
  totalPage: 0,
});

// 페이지 변경
const changePagination = (pageNumber: number, pageSize: number) => {
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  getResourceList(pageNumber, pageSize);
};

const columns: TableColumnType<ImageType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
  },
  {
    title: 'common.column.visibility',
    dataIndex: 'visibility',
  },
  {
    title: 'common.column.disk-format',
    dataIndex: 'diskFormat',
  },
  {
    title: 'common.column.is-protected',
    dataIndex: 'isProtected',
  },
  {
    title: 'common.column.size',
    dataIndex: 'size',
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

const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 1000;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

const isLoading = ref<boolean>(true);

// 자원 목록 조회 : 이미지 목록 조회
const data = ref<ImageType[]>();
const selectedData = ref<{
  rows: ImageType[];
  keys: string[];
}>({
  rows: [],
  keys: [],
});
const getResourceList = (pageNumber: number, pageSize: number) => {
  getImageList(pageNumber, pageSize)
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

const emits = defineEmits({});

const rowSelection = computed(() => {
  return {
    type: 'radio',
    onChange: (selectedRowKeys: string[], selectedRows: ImageType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      emits('update:image', selectedRows[0]);
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

const getStatusColor = (status: string) => {
  if (status?.toUpperCase() === 'ACTIVE') {
    return 'geekblue';
  } else if (status?.toUpperCase() === 'ERROR') {
    return 'volcano';
  }
  return 'lightgray';
};

onMounted(() => {
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
});

onUnmounted(() => {
  emits('update:image', undefined);
});
</script>

<style scoped></style>
