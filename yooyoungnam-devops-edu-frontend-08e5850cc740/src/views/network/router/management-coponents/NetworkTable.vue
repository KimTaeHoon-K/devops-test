<template>
  <Field
    name="networkId"
    v-slot="{ errorMessage }"
    v-model:value="selectedNetworkId"
  >
    <a-form-item
      :help="errorMessage"
      :validate-status="errorMessage ? 'error' : undefined"
    >
      <a-table
        v-model:value="selectedNetworkId"
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
            t(column.title, { data: t('common.content.network') })
          }}</template>
          <template v-else-if="column.dataIndex === 'projectName'">{{
            t(column.title, { data: t('common.content.project') })
          }}</template>
          <template v-else>
            {{ t(column.title) }}
          </template>
        </template>
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'routerExternal'">
            <span>{{ text ? 'Yes' : 'No' }} </span>
          </template>
          <template v-if="column.dataIndex === 'shared'">
            <span>{{ text ? 'Yes' : 'No' }} </span>
          </template>
          <template v-if="column.dataIndex === 'subnets'">
            <span>{{ text?.length }} </span>
          </template>
          <template v-if="column.dataIndex === 'status'">
            <span>
              <a-tag
                :key="text"
                :color="
                  text?.toUpperCase() === 'ACTIVE' ? 'geekblue' : 'lightgray'
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
    </a-form-item>
  </Field>
</template>

<script lang="ts" setup>
import type { TableColumnType } from 'ant-design-vue';
import { computed, defineProps, defineEmits, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Field } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { getNetworkList } from '@/axios/network-service/NetworkApi';
import { NetworkType } from '@/types/network/network/NetworkListType';
import { dateConverter } from '@/utils/Converter';

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
  network: {
    type: Object as () => NetworkType,
    default: undefined,
  },
  validateForm: {
    type: Object,
  },
});

watch(props, () => {
  if (!props.network) {
    selectedData.value = { rows: [], keys: [] };
    selectedNetworkId.value = undefined;
  }
  if (props.projectId && isLoading.value) {
    getResourceList();
  }
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const columns: TableColumnType<NetworkType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.resource-name',
    dataIndex: 'projectName',
  },
  {
    title: 'common.column.router-external',
    dataIndex: 'routerExternal',
  },
  {
    title: 'common.column.shared',
    dataIndex: 'shared',
  },
  {
    title: 'common.column.subnet-count',
    dataIndex: 'subnets',
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

const isLoading = ref<boolean>(true);

const selectedNetworkId = ref<string | undefined>();

// 자원 목록 조회 : 볼륨 타입 목록 조회
const data = ref<NetworkType[]>();
const selectedData = ref<{
  rows: NetworkType[];
  keys: string[];
}>({
  rows: [],
  keys: [],
});
const getResourceList = () => {
  getNetworkList(1, Number.MAX_SAFE_INTEGER, undefined, false)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data.filter((net) => {
          return (
            net.subnets.length > 0 &&
            (net.shared || net.projectId === props.projectId)
          );
        });
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
    onChange: (selectedRowKeys: string[], selectedRows: NetworkType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      selectedNetworkId.value = selectedRowKeys[0];
      emits('update:network', selectedRows[0]);
      validateField('networkId', selectedNetworkId.value);
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

onMounted(() => {
  if (props.projectId) {
    getResourceList();
  }
});
</script>

<style scoped></style>
