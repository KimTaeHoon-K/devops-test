<template>
  <Field
    name="instance"
    v-slot="{ errorMessage }"
    v-model:value="selectedInstanceId"
  >
    <a-form-item
      :help="errorMessage"
      :validate-status="errorMessage ? 'error' : undefined"
    >
      <a-table
        v-model:value="selectedInstanceId"
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
            t(column.title, { data: t('common.content.instance') })
          }}</template>
          <template v-else>
            {{ t(column.title) }}
          </template>
        </template>
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'name'">
            {{ text ? text : '(No name)' }}
          </template>
          <template v-if="column.dataIndex === 'network'">
            <div v-for="net in text.addresses" v-bind:key="net.networkName">
              <div v-if="net.ipsType === 'fixed'">
                {{ net.addr }}
              </div>
            </div>
            <div v-if="!text.addresses || text.addresses.length === 0">-</div>
          </template>
          <template v-else-if="column.dataIndex === 'flavor'">
            {{ text.originalName ? text.originalName : '-' }}
          </template>
          <template v-else-if="column.dataIndex === 'osExtStsPowerState'">
            <span>
              <a-tag v-if="record.status === 'REBOOT'" :color="'warning'">
                <span> REBOOTING </span>
              </a-tag>
              <a-tag
                v-if="
                  record.osExtStsTaskState === 'deleting' ||
                  record.osExtStsVmState === 'deleted'
                "
                :color="'warning'"
              >
                <span> DELETING </span>
              </a-tag>
              <a-tag
                v-else-if="record.status !== 'ERROR'"
                :key="text"
                :color="text === 1 ? 'geekblue' : 'lightgray'"
              >
                <span v-if="record.status === 'BUILD'"> BUILDING </span>
                <span v-else-if="text === 1"> RUNNING </span>
                <span v-else-if="text === 3"> PAUSED </span>
                <span v-else-if="text === 4"> SHUT DOWN </span>
                <span v-else-if="text === 6"> CRASHED </span>
                <span v-else-if="text === 7"> SUSPENDED </span>
              </a-tag>
              <a-tag v-else-if="record.status === 'ERROR'" :color="'volcano'">
                <span> ERROR </span>
              </a-tag>
            </span>
          </template>
          <template v-if="column.dataIndex === 'created'">
            {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
          </template>
        </template>
      </a-table>
    </a-form-item>
  </Field>
</template>

<script lang="ts" setup>
import type { TableColumnType } from 'ant-design-vue';
import {
  computed,
  defineEmits,
  defineProps,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { Field } from 'vee-validate';
import { PaginationType } from '@/types/common/PaginationType';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { dateConverter } from '@/utils/Converter';
import { InstanceType } from '@/types/compute/instance/InstanceListType';
import { getInstanceList } from '@/axios/compute-service/InstanceApi';

const props = defineProps({
  instance: {
    type: Object as () => InstanceType,
    default: undefined,
  },
  validateForm: {
    type: Object,
  },
});

watch(props, () => {
  if (!props.instance) {
    selectedData.value = { rows: [], keys: [] };
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

const columns: TableColumnType<InstanceType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
  },
  // {
  //   title: 'common.column.image',
  //   dataIndex: 'image',
  // },
  {
    title: 'common.column.fixed-ip',
    dataIndex: 'network',
  },
  {
    title: 'common.column.flavor',
    dataIndex: 'flavor',
  },
  {
    title: 'common.column.status',
    dataIndex: 'osExtStsPowerState',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'created',
  },
];

const isLoading = ref<boolean>(true);

const selectedInstanceId = ref<string | undefined>();

// 자원 목록 조회 : 인스턴스 목록 조회
const data = ref<InstanceType[]>();
const selectedData = ref<{
  rows: InstanceType[];
  keys: string[];
}>({
  rows: [],
  keys: [],
});
const getResourceList = (pageNumber: number, pageSize: number) => {
  getInstanceList(pageNumber, pageSize)
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
    onChange: (selectedRowKeys: string[], selectedRows: InstanceType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      selectedInstanceId.value = selectedRowKeys[0];
      emits('update:instance', selectedRows[0]);
      validateField('instance', selectedInstanceId.value);
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

onMounted(() => {
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
});

onUnmounted(() => {
  emits('update:instance', undefined);
});
</script>

<style scoped></style>
