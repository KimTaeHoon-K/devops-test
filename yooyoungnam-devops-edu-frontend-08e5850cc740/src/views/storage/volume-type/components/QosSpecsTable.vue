<template>
  <Field
    name="qosSpecs"
    v-slot="{ errorMessage }"
    v-model:value="selectedQosSpecs"
  >
    <a-form-item
      :rules="[{ required: true }]"
      :help="errorMessage"
      :validate-status="errorMessage ? 'error' : undefined"
    >
      <a-table
        v-model:value="selectedQosSpecs"
        :row-selection="rowSelection"
        :columns="columns"
        :data-source="data"
        :row-key="'id'"
        :loading="isLoading"
        :pagination="false"
        bordered
      >
        <template #headerCell="{ column }">
          <template v-if="column.dataIndex === 'name'">{{
            t(column.title, { data: t('common.content.qos') })
          }}</template>
          <template v-else>
            {{ t(column.title) }}
          </template>
        </template>
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'specs'">
            <span v-if="Object.keys(text).length === 0">-</span>
            <span
              v-for="(objKey, idx) in Object.keys(text)"
              v-bind:key="objKey"
            >
              {{ objKey + '=' + text[objKey]
              }}{{ idx === Object.keys(text).length - 1 ? '' : ', ' }}
            </span>
          </template>
        </template>
      </a-table>
    </a-form-item>
  </Field>
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
import type { TableColumnType } from 'ant-design-vue';
import { computed, defineProps, defineEmits, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Field } from 'vee-validate';
import { VolumeTypeType } from '@/types/storage/volume-type/VolumeTypeListType';
import { PaginationType } from '@/types/common/PaginationType';
import { getQosSpecsList } from '@/axios/storage-service/VolumeTypeApi';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { QosSpecsType } from '@/types/storage/volume-type/QosSpecsListType';
import { goToPageByName } from '@/utils/RouterUtil';
import { useRouter } from 'vue-router';

const props = defineProps({
  qosSpecsId: {
    type: String,
    required: false,
  },
  validateForm: {
    type: Object,
  },
});

const router = useRouter();

const providerStore = ProviderStore();
watch(providerStore, () => {
  goToPageByName(router, 'volume type');
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
    title: 'common.column.applied-target',
    dataIndex: 'consumer',
  },
  {
    title: 'common.column.specs',
    dataIndex: 'specs',
  },
];

const isLoading = ref<boolean>(true);

const selectedQosSpecs = ref<string | undefined>(props.qosSpecsId);

// 자원 목록 조회 : 볼륨 타입 목록 조회
const data = ref<QosSpecsType[]>();
const selectedData = ref<{
  rows: QosSpecsType[];
  keys: string[];
}>({
  rows: [],
  keys: [],
});
const getResourceList = (pageNumber: number, pageSize: number) => {
  getQosSpecsList(pageNumber, pageSize)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        pagination.value.totalCount = res.data.totalCount;
        pagination.value.totalPage = res.data.totalPage;
        if (props.qosSpecsId) {
          data.value.map((qos) => {
            if (qos.id === props.qosSpecsId) {
              selectedData.value.keys.push(qos.id);
              selectedData.value.rows.push(qos);
              selectedQosSpecs.value = qos.id;
              emits('update:qosSpecs', qos);
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
    onChange: (selectedRowKeys: string[], selectedRows: QosSpecsType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      selectedQosSpecs.value = selectedRowKeys[0];
      emits('update:qosSpecs', selectedRows[0]);
      validateField('qosSpecs', selectedQosSpecs.value);
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
</script>

<style scoped></style>
