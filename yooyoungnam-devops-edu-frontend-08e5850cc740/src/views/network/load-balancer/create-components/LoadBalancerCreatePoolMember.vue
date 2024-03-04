<template>
  <a-form class="form" name="basic" layout="vertical">
    <div class="head-title-wrapper">
      <h3 class="heading-sub-title">
        {{ t('message.create.step-info.load-balancer.pool-member.title') }}
      </h3>
      <p class="description">
        {{
          t('message.create.step-info.load-balancer.pool-member.description')
        }}
      </p>
    </div>
    <a-row :gutter="12">
      <a-col :span="24">
        <Field
          v-model="selectedData.rows"
          v-slot="{ errorMessage }"
          name="poolMember"
        >
          <a-form-item
            :label="'풀 멤버'"
            :rules="[{ required: true }]"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-table
              :row-selection="rowSelection"
              :columns="columns"
              :data-source="tableData"
              :row-key="'id'"
              :pagination="false"
              :loading="isLoading"
              :scroll="{ y: 300 }"
              bordered
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <span v-if="record.type === 'instance'">
                    <apartment-outlined />
                  </span>
                  <span v-if="record.type === 'port'">
                    <folder-outlined />
                  </span>
                  {{ record.name ? record.name : '(No Name)' }}
                </template>
                <template v-if="column.key === 'id'">
                  <div class="text-ellipsis">
                    <span>{{ record.id }}</span>
                  </div>
                </template>
              </template>
            </a-table>
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <template v-for="(port, idx) in selectedData.rows" v-bind:key="port">
        <a-col :span="8">
          <a-form-item :label="idx === 0 ? t('common.column.ip-address') : ''">
            <a-input
              :value="port.fixedIp"
              :placeholder="
                t('message.placeholder.input-1', {
                  data: t('common.column.ip-address'),
                })
              "
              disabled
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item :label="idx === 0 ? '포트' : ''" name="port">
            <a-input-number v-model:value="port.port" :default-value="65535" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item :label="idx === 0 ? '가중치' : ''" name="weight">
            <a-input-number
              v-model:value="port.weight"
              :default-value="256"
              style="width: 80%; margin-right: 8px"
            />
            <minus-circle-outlined
              class="dynamic-delete-button"
              @click="removeSelectedData(port)"
            />
          </a-form-item>
        </a-col>
      </template>
    </a-row>
  </a-form>
</template>

<script lang="ts" setup>
import {
  computed,
  defineEmits,
  defineProps,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { Field } from 'vee-validate';
import {
  ApartmentOutlined,
  FolderOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { PoolMemberInfoType } from '@/types/network/load-balancer/LoadBalancerCreateType';
import { getInstanceList } from '@/axios/compute-service/InstanceApi';
import { InstanceType } from '@/types/compute/instance/InstanceListType';

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  poolMemberInfo: {
    type: Array as () => PoolMemberInfoType[],
    required: true,
  },
  isCheckValid: {
    type: Boolean,
    default: false,
  },
  projectId: {
    type: String,
    required: true,
  },
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const initData = () => {
  if (props.isCheckValid) {
    props.poolMemberInfo.map((poolMem, index) => {
      emitsPoolMemberInfo.value.push({
        name: poolMem.name,
        fixedIp: poolMem.fixedIp,
        port: poolMem.port,
        weight: poolMem.weight,
      });
      selectedData.value.keys.push(poolMem.fixedIp);
      selectedData.value.rows.push({
        id: poolMem.fixedIp,
        name: 'port name',
        fixedIp: poolMem.fixedIp,
        port: 65535,
        weight: 256,
        type: 'port',
      });
    });
  }
};

const emits = defineEmits(['update:poolMemberInfo', 'update:isCheckValid']);
const emitsPoolMemberInfo = ref<PoolMemberInfoType[]>(
  [] as PoolMemberInfoType[]
);

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

// table data
const columns = [
  {
    title: '인스턴스/포트명',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '네트워크',
    dataIndex: 'networkName',
    key: 'networkName',
  },
  {
    title: '고정 IP',
    dataIndex: 'fixedIp',
    key: 'fixedIp',
  },
];

interface TableDataItem {
  id: string;
  name: string;
  type: string; // 인스턴스와 포트 구분 필드명. instance/port
  networkName?: string;
  fixedIp?: string;
  port: number;
  weight: number;
  checkDisabled?: boolean;
  children?: TableDataItem[];
}

const isLoading = ref<boolean>(true);
const tableData = ref<TableDataItem[]>([]);

const selectedData = ref<{ rows: TableDataItem[]; keys: string[] }>({
  rows: [],
  keys: [],
});

const data = ref<InstanceType[]>();
const getInstanceResourceList = () => {
  getInstanceList(1, Number.MAX_SAFE_INTEGER, props.projectId)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        data.value.map((instance) => {
          let childrenData = [] as TableDataItem[];
          instance.network.addresses.map((addr, index) => {
            childrenData.push({
              id: addr.addr,
              name: addr.portName,
              networkName: addr.networkName,
              fixedIp: addr.addr,
              port: 65535,
              weight: 256,
              type: 'port',
            });
          });
          tableData.value.push({
            id: instance.id,
            name: instance.name,
            type: 'instance',
            port: 0,
            weight: 0,
            checkDisabled: true,
            children: childrenData.length > 0 ? childrenData : undefined,
          });
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
const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: TableDataItem[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    hideSelectAll: true,
    selectedRowKeys: selectedData.value.keys,
    getCheckboxProps: (record: TableDataItem) => ({
      disabled: record.checkDisabled,
      style: record.checkDisabled ? 'display: none;' : '',
    }),
  };
});

const removeSelectedData = (item: TableDataItem) => {
  let index = selectedData.value.rows.indexOf(item);
  if (index !== -1) {
    selectedData.value.rows.splice(index, 1);
    selectedData.value.keys.splice(index, 1);
  }
};

onMounted(() => {
  initData();
  getInstanceResourceList();
});

onUnmounted(() => {
  if (selectedData.value.rows.length > 0) {
    selectedData.value.rows.map((data) => {
      if (data.fixedIp) {
        emitsPoolMemberInfo.value.push({
          name: data.name,
          fixedIp: data.fixedIp,
          port: data.port,
          weight: data.weight,
        });
      }
    });
  }
  emits('update:poolMemberInfo', emitsPoolMemberInfo.value);
  emits('update:isCheckValid', true);
});
</script>

<style lang="scss" scoped>
.dynamic-delete-button {
  cursor: pointer;
  position: relative;
  top: 4px;
  font-size: 24px;
  color: #999;
  transition: all 0.3s;
}
.dynamic-delete-button:hover {
  color: #777;
}
.dynamic-delete-button[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
