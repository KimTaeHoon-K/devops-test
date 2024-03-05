<template>
  <Field
    name="subnetId"
    v-slot="{ errorMessage }"
    v-model:value="selectedSubnetId"
  >
    <a-form-item
      :rules="[{ required: true }]"
      :help="errorMessage"
      :validate-status="errorMessage ? 'error' : undefined"
    >
      <a-table
        v-model:value="selectedSubnetId"
        :row-selection="rowSelection"
        :columns="columns"
        :data-source="data"
        :row-key="'id'"
        :loading="isLoading"
        :pagination="false"
        :scroll="{ y: 300 }"
        bordered
      >
        <template v-if="!props.networkId" #emptyText>
          <div class="txt list-pre">
            {{
              t('message.table.select-previous-data-first', {
                prevData: t('common.content.network'),
                data: t('common.content.subnet'),
              })
            }}
          </div>
        </template>
        <template #headerCell="{ column }">
          <template v-if="column.dataIndex === 'name'">{{
            t(column.title, { data: t('common.content.subnet') })
          }}</template>
          <template v-else-if="column.dataIndex === 'projectName'">{{
            t(column.title, { data: t('common.content.project') })
          }}</template>
          <template v-else>
            {{ t(column.title) }}
          </template>
        </template>
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'allocationPools'">
            <template v-if="text.length === 0"> - </template>
            <template v-for="(pool, idx) in text" v-bind:key="pool">
              {{ pool.start }} ~ {{ pool.end }}
              {{ idx < text.length - 1 ? ', ' : '' }}
            </template>
          </template>
          <template v-if="column.dataIndex === 'gatewayIp'">
            {{ text ? text : '-' }}
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
import { computed, defineEmits, defineProps, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Field } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { dateConverter } from '@/utils/Converter';
import { getSubnetList } from '@/axios/network-service/SubnetApi';
import { SubnetType } from '@/types/network/network/subnet/SubnetListType';

const props = defineProps({
  subnet: {
    type: Object as () => SubnetType,
    default: undefined,
  },
  networkId: {
    type: String,
    default: undefined,
  },
  validateForm: {
    type: Object,
  },
});

const prevNetworkId = ref<string>();

watch(props, () => {
  if (props.networkId && props.networkId !== prevNetworkId.value) {
    refresh(props.networkId);
  } else if (!props.networkId) {
    data.value = [];
    selectedData.value = { keys: [], rows: [] };
    selectedSubnetId.value = undefined;
    validateFieldInit('subnetId');
  } else if (!props.subnet) {
    selectedData.value = { keys: [], rows: [] };
    selectedSubnetId.value = undefined;
    validateFieldInit('subnetId');
  }
});

const refresh = (networkId: string) => {
  prevNetworkId.value = networkId;
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  selectedSubnetId.value = undefined;
  validateFieldInit('subnetId');
  emits('update:subnet', undefined);
  getResourceList(networkId);
};

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const columns: TableColumnType<SubnetType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
  },
  {
    title: 'CIDR',
    dataIndex: 'cidr',
  },
  {
    title: 'common.column.allocation-pool',
    dataIndex: 'allocationPools',
  },
  {
    title: 'common.column.gateway-ip',
    dataIndex: 'gatewayIp',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
  },
];

const isLoading = ref<boolean>(true);

const selectedSubnetId = ref<string | undefined>();

// 자원 목록 조회 : 서브넷 목록 조회
const data = ref<SubnetType[]>();
const selectedData = ref<{
  rows: SubnetType[];
  keys: string[];
}>({
  rows: [],
  keys: [],
});
const getResourceList = (networkId: string) => {
  getSubnetList(1, Number.MAX_SAFE_INTEGER, networkId)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
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
    onChange: (selectedRowKeys: string[], selectedRows: SubnetType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      selectedSubnetId.value = selectedRowKeys[0];
      emits('update:subnet', selectedRows[0]);
      validateField('subnetId', selectedSubnetId.value);
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

const validateFieldInit = (field: string) => {
  props.validateForm?.setFieldValue(field, undefined);
  props.validateForm?.setFieldError(field, undefined);
};

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

onMounted(() => {
  if (props.networkId) {
    getResourceList(props.networkId);
  } else {
    isLoading.value = false;
  }
});
</script>

<style scoped></style>
