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
        t(column.title, { data: t('common.content.volume-snapshot') })
      }}</template>
      <template v-else-if="column.dataIndex === 'projectName'">{{
        t(column.title, { data: t('common.content.project') })
      }}</template>
      <template v-else>
        {{ t(column.title) }}
      </template>
    </template>
    <template #bodyCell="{ column, text }">
      <template v-if="column.dataIndex === 'size'">
        {{ gibConverter(text) }}
      </template>
      <template v-if="column.dataIndex === 'status'">
        <span>
          <a-tag
            :key="text"
            :color="
              text?.toUpperCase() === 'AVAILABLE' ? 'geekblue' : 'lightgray'
            "
          >
            {{ text?.toUpperCase() }}
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
import {
  ref,
  watch,
  onMounted,
  onUnmounted,
  computed,
  defineProps,
  defineEmits,
} from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { getVolumeSnapshotList } from '@/axios/storage-service/VolumeSnapshotApi';
import { VolumeSnapshotType } from '@/types/storage/volume-snapshot/VolumeSnapshotListType';
import { dateConverter, gibConverter } from '@/utils/Converter';

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const props = defineProps({
  volumeSnapshotId: {
    type: String,
    default: undefined,
  },
  selectedProjectId: {
    type: String,
    default: undefined,
  },
});

watch([props], () => {
  refresh();
  emits('update:volumeSnapshot', undefined);
});

const columns: TableColumnType<VolumeSnapshotType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.resource-name',
    dataIndex: 'projectName',
    // sorter: true,
  },
  {
    title: 'common.column.capacity',
    dataIndex: 'size',
  },
  {
    title: 'common.column.status',
    dataIndex: 'status',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
    // sorter: true,
  },
];

const refresh = () => {
  data.value = [];
  selectedData.value = { keys: [], rows: [] };
  if (props.selectedProjectId) {
    isLoading.value = true;
    getResourceList();
  }
};

const isLoading = ref<boolean>(true);

// 자원 목록 조회 : 볼륨 타입 목록 조회
const data = ref<VolumeSnapshotType[]>();
const selectedData = ref<{
  rows: VolumeSnapshotType[];
  keys: string[];
}>({
  rows: [],
  keys: [],
});
const getResourceList = () => {
  getVolumeSnapshotList(
    1,
    Number.MAX_SAFE_INTEGER,
    undefined,
    props.selectedProjectId
  )
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        if (props.volumeSnapshotId) {
          data.value.map((volumeSnapshot) => {
            if (volumeSnapshot.id === props.volumeSnapshotId) {
              selectedData.value.keys.push(volumeSnapshot.id);
              selectedData.value.rows.push(volumeSnapshot);
              emits('update:volumeSnapshot', volumeSnapshot);
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

const emits = defineEmits({});

const rowSelection = computed(() => {
  return {
    type: 'radio',
    onChange: (
      selectedRowKeys: string[],
      selectedRows: VolumeSnapshotType[]
    ) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      emits('update:volumeSnapshot', selectedRows[0]);
    },
    selectedRowKeys: selectedData.value.keys,
    getCheckboxProps: () => ({
      disabled: props.volumeSnapshotId,
    }),
  };
});

onMounted(() => {
  if (props.selectedProjectId) {
    getResourceList();
  } else {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  emits('update:volumeSnapshot', undefined);
});
</script>

<style scoped></style>
