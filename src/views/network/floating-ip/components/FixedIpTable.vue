<template>
  <Field
    name="fixedIp"
    v-slot="{ errorMessage }"
    v-model:value="selectedFixedIp"
  >
    <a-form-item
      :help="errorMessage"
      :validate-status="errorMessage ? 'error' : undefined"
    >
      <a-table
        v-model:value="selectedFixedIp"
        :row-selection="rowSelection"
        :columns="columns"
        :data-source="data"
        :row-key="'id'"
        :pagination="false"
        :loading="isLoading"
        :scroll="{ y: 300 }"
        bordered
      >
        <template v-if="!props.resourceId" #emptyText>
          <div class="txt list-pre">
            {{
              t('message.table.select-previous-data-first', {
                prevData: '할당 자원',
                data: '고정 IP',
              })
            }}
          </div>
        </template>
        <template #headerCell="{ column }">{{ t(column.title) }}</template>
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'fixedIps'">
            <template v-if="text.length === 0"> - </template>
            <template v-for="(fixedIp, idx) in text" v-bind:key="fixedIp">
              {{ fixedIp.ipAddress }}
              {{ idx + 1 < text.length ? ', ' : '' }}
            </template>
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
import { ImageType } from '@/types/compute/image/ImageListType';
import { getPortList } from '@/axios/network-service/PortApi';
import { PortType } from '@/types/network/port/PortType';

const props = defineProps({
  resourceId: {
    type: String,
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

const prevResourceId = ref<string>();
watch(props, () => {
  if (props.resourceId && props.resourceId !== prevResourceId.value) {
    prevResourceId.value = props.resourceId;
    data.value = [];
    selectedData.value = { rows: [], keys: [] };
    emits('update:fixedIp', undefined);
    selectedFixedIp.value = undefined;
    validateFieldInit('fixedIp');
    isLoading.value = true;
    getResourceList();
  }
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const columns: TableColumnType<ImageType>[] = [
  {
    title: 'common.column.ip-address',
    dataIndex: 'fixedIps',
  },
  {
    title: 'common.column.mac-address',
    dataIndex: 'macAddress',
  },
  {
    title: 'common.column.network',
    dataIndex: 'networkName',
  },
  {
    title: 'common.column.is-attachable',
    dataIndex: 'floatingIpAttachableReason',
  },
];

const isLoading = ref<boolean>(false);

const selectedFixedIp = ref<string | undefined>();

// 자원 목록 조회 : 포트 목록 조회
const data = ref<PortType[]>();
const selectedData = ref<{
  rows: PortType[];
  keys: string[];
}>({
  rows: [],
  keys: [],
});
const getResourceList = () => {
  getPortList(
    1,
    Number.MAX_SAFE_INTEGER,
    undefined,
    undefined,
    undefined,
    props.resourceId,
    props.networkId
  )
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        for (let port of data.value) {
          if (port.floatingIpAttachable) {
            selectedData.value = {
              rows: [port],
              keys: [port.id],
            };
            emits('update:fixedIp', port);
            selectedFixedIp.value = port.id;
            validateField('fixedIp', selectedFixedIp.value);
            break;
          }
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

const emits = defineEmits(['update:fixedIp']);

const rowSelection = computed(() => {
  return {
    type: 'radio',
    onChange: (selectedRowKeys: string[], selectedRows: PortType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      selectedFixedIp.value = selectedRowKeys[0];
      emits('update:fixedIp', selectedRows[0]);
      validateField('fixedIp', selectedFixedIp.value);
    },
    selectedRowKeys: selectedData.value.keys,
    getCheckboxProps: (record: PortType) => ({
      disabled: !record.floatingIpAttachable,
    }),
  };
});

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

const validateFieldInit = (field: string) => {
  props.validateForm?.setFieldValue(field, undefined);
  props.validateForm?.setFieldError(field, undefined);
};

onMounted(() => {
  if (props.resourceId) {
    getResourceList();
  }
});
</script>

<style scoped></style>
