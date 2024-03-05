<template>
  <a-table
    :row-selection="rowSelection"
    :columns="columns"
    :data-source="data"
    :row-key="'id'"
    :loading="isLoading"
    :pagination="false"
    :scroll="{ y: 300 }"
    bordered
  >
    <template #headerCell="{ column }">
      <template v-if="column.dataIndex === 'name'">{{
        t(column.title, { data: t('common.content.volume-type') })
      }}</template>
      <template v-else>
        {{ t(column.title) }}
      </template>
    </template>
    <template #bodyCell="{ column, text }">
      <template v-if="column.dataIndex === 'description'">
        <span class="txt">
          {{ text ? text : '-' }}
        </span>
      </template>
      <template v-if="column.dataIndex === 'publicIs'">
        <span class="txt">
          {{ text ? 'Yes' : 'No' }}
        </span>
      </template>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
import type { TableColumnType } from 'ant-design-vue';
import { ref, watch, onMounted, computed, defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { VolumeTypeType } from '@/types/storage/volume-type/VolumeTypeListType';
import { PaginationType } from '@/types/common/PaginationType';
import { getVolumeTypeList } from '@/axios/storage-service/VolumeTypeApi';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { VolumeSnapshotType } from '@/types/storage/volume-snapshot/VolumeSnapshotListType';

const props = defineProps({
  volumeSourceChoiceValue: {
    type: String,
    default: 'image',
  },
  selectedVolumeSnapshot: {
    type: Object as () => VolumeSnapshotType,
    default: undefined,
  },
});

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

const columns: TableColumnType<VolumeTypeType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
  },
  {
    title: 'common.column.description',
    dataIndex: 'description',
  },
  {
    title: 'common.column.is-public',
    dataIndex: 'publicIs',
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

// 자원 목록 조회 : 볼륨 타입 목록 조회
const data = ref<VolumeTypeType[]>();
const selectedData = ref<{
  rows: VolumeTypeType[];
  keys: string[];
}>({
  rows: [],
  keys: [],
});
const getResourceList = (pageNumber: number, pageSize: number) => {
  getVolumeTypeList(pageNumber, pageSize)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        pagination.value.totalCount = res.data.totalCount;
        pagination.value.totalPage = res.data.totalPage;
        if (props.volumeSourceChoiceValue === 'image') {
          data.value.map((volumeType) => {
            if (volumeType.name === '__DEFAULT__') {
              selectedData.value.keys.push(volumeType.id);
              selectedData.value.rows.push(volumeType);
              emits('update:volumeType', volumeType);
            }
          });
        }
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

watch(props, () => {
  if (props.volumeSourceChoiceValue === 'image' && data.value) {
    data.value.map((volumeType) => {
      if (volumeType.name === '__DEFAULT__') {
        selectedData.value.keys = [volumeType.id];
        selectedData.value.rows = [volumeType];
        emits('update:volumeType', volumeType);
      }
    });
  }

  if (props.selectedVolumeSnapshot && data.value) {
    data.value.map((volumeType) => {
      if (volumeType.name === props.selectedVolumeSnapshot?.volumeType) {
        selectedData.value.keys = [volumeType.id];
        selectedData.value.rows = [volumeType];
        emits('update:volumeType', volumeType);
      }
    });
  }
});

const emits = defineEmits({});

const rowSelection = computed(() => {
  return {
    type: 'radio',
    onChange: (selectedRowKeys: string[], selectedRows: VolumeTypeType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      emits('update:volumeType', selectedRows[0]);
    },
    selectedRowKeys: selectedData.value.keys,
    getCheckboxProps: () => ({
      disabled: props.selectedVolumeSnapshot,
    }),
  };
});

onMounted(() => {
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
});
</script>

<style scoped></style>
