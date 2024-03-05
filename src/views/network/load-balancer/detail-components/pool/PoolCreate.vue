<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header class="page-header" :title="t(route.meta?.title)" />
  <Form
    @submit="createResource"
    @invalid-submit="checkValid"
    :validation-schema="validationSchema"
    ref="createForm"
  >
    <div class="contents">
      <a-card>
        <a-form class="form" name="basic" layout="vertical">
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="name"
                v-model="poolForm.name"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.name')"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    :value="poolForm.name"
                    @update:value="handleChange"
                    @blur="handleChange"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: t('common.content.pool'),
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field
                name="description"
                v-model="poolForm.description"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.description')"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    v-model:value="poolForm.description"
                    @update:value="handleChange"
                    @blur="handleChange"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: t('common.column.description'),
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="algorithm"
                v-model="poolForm.lbAlgorithm"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="'알고리즘'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-select
                    v-model:value="poolForm.lbAlgorithm"
                    style="width: 100%"
                    :options="algorithmOptions"
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field
                name="protocol"
                v-model="poolForm.protocol"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="'프로토콜'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-select
                    v-model:value="poolForm.protocol"
                    style="width: 100%"
                    :options="protocolOptions"
                    :placeholder="
                      t('message.placeholder.select-1', {
                        data: '프로토콜',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="sessionPersistence"
                v-model="sessionPersistence"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="'세션 저항 상태'"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-select
                    v-model:value="sessionPersistence"
                    style="width: 100%"
                    :options="sessionPersistenceOptions"
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="6">
              <Field name="adminStateUp" v-model="poolForm.adminStateUp">
                <a-form-item :label="'Admin 관리 상태'">
                  <a-switch v-model:checked="poolForm.adminStateUp" />
                </a-form-item>
              </Field>
            </a-col>

            <a-col :span="6">
              <Field name="tls" v-model="poolForm.tlsEnabled">
                <a-form-item :label="'TLS 설정'">
                  <a-switch v-model:checked="poolForm.tlsEnabled" />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row v-if="poolForm.tlsEnabled" class="form-row" :gutter="12">
            <a-col :span="24">
              <Field
                name="tlsCipherString"
                v-model="poolForm.tlsCiphers"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'TLS Cipher String'"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    :value="poolForm.tlsCiphers"
                    @update:value="handleChange"
                    @blur="handleChange"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: 'TLS Cipher String',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row :gutter="12">
            <a-col :span="24">
              <Field
                v-model="selectedData.rows"
                v-slot="{ handleChange, errorMessage }"
                name="poolMember"
              >
                <a-form-item
                  :label="'풀 멤버'"
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
                        {{ record.name }}
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
            <template
              v-for="(port, idx) in selectedData.rows"
              v-bind:key="port"
            >
              <a-col :span="8">
                <Field
                  name="fixedIp"
                  v-model="poolMemberForm[idx].address"
                  v-slot="{ handleChange, errorMessage }"
                >
                  <a-form-item
                    :label="idx === 0 ? t('common.column.ip-address') : ''"
                    :help="errorMessage"
                    :has-feedback="!!errorMessage"
                    :validate-status="errorMessage ? 'error' : undefined"
                  >
                    <a-input
                      :value="port.fixedIp"
                      @update:value="handleChange"
                      @blur="handleChange"
                      :placeholder="
                        t('message.placeholder.input-1', {
                          data: t('common.column.ip-address'),
                        })
                      "
                      disabled
                    />
                  </a-form-item>
                </Field>
              </a-col>
              <a-col :span="6">
                <a-form-item :label="idx === 0 ? '포트' : ''" name="port">
                  <a-input-number
                    v-model:value="poolMemberForm[idx].protocolPort"
                    :default-value="66534"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item :label="idx === 0 ? '가중치' : ''" name="weight">
                  <a-input-number
                    v-model:value="poolMemberForm[idx].weight"
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
      </a-card>
    </div>
    <div class="footer-bar">
      <div class="footer-bar-right">
        <a-space :size="SizeConst.sixteen">
          <a-button
            size="large"
            @click="
              goToPageByName(router, 'load-balancer detail', {
                id: loadBalancerId,
              })
            "
            >{{ t('common.content.action.cancel') }}</a-button
          >
          <a-button type="primary" size="large" html-type="submit">{{
            t('common.content.action.create')
          }}</a-button>
        </a-space>
      </div>
    </div>
  </Form>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Field, Form, useForm } from 'vee-validate';
import {
  ApartmentOutlined,
  FolderOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { useRoute, useRouter } from 'vue-router';
import { openNotification } from '@/utils/CommonUtil';
import { goToPageByName } from '@/utils/RouterUtil';
import {
  PoolCreateType,
  PoolMemberCreateType,
} from '@/types/network/load-balancer/pool/PoolCreateType';
import { createPool } from '@/axios/network-service/PoolApi';
import { SelectProps } from 'ant-design-vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { InstanceType } from '@/types/compute/instance/InstanceListType';
import { getInstanceList } from '@/axios/compute-service/InstanceApi';
import { SizeConst } from '@/types/common/constant/SizeConst';

const router = useRouter();
const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const loadBalancerId = route.params.id as string;
const projectId = route.query?.projectId as string;

const protocolOptions = ref<SelectProps['options']>([
  {
    value: 'HTTP',
    label: 'HTTP',
  },
  {
    value: 'HTTPS',
    label: 'HTTPS',
  },
  {
    value: 'TCP',
    label: 'TCP',
  },
  {
    value: 'UDP',
    label: 'UDP',
  },
  {
    value: 'SCTP',
    label: 'SCTP',
  },
]);

const algorithmOptions = ref<SelectProps['options']>([
  {
    value: 'LEAST_CONNECTIONS',
    label: 'LEAST_CONNECTIONS',
  },
  {
    value: 'ROUND_ROBIN',
    label: 'ROUND_ROBIN',
  },
  {
    value: 'SOURCE_IP',
    label: 'SOURCE_IP',
  },
]);

const sessionPersistenceOptions = ref<SelectProps['options']>([
  {
    value: 'None',
    label: 'None',
  },
  {
    value: 'SOURCE_IP',
    label: 'SOURCE_IP',
  },
  {
    value: 'HTTP_COOKIE',
    label: 'HTTP_COOKIE',
  },
  {
    value: 'APP_COOKIE',
    label: 'APP_COOKIE',
  },
]);

const sessionPersistence = ref<string>('None');
const poolForm = ref<PoolCreateType>({
  loadbalancerId: loadBalancerId,
  listenerId: '', // TODO: 선택
  name: '',
  description: '',
  lbAlgorithm: 'LEAST_CONNECTIONS',
  protocol: undefined,
  sessionPersistence: undefined,
  adminStateUp: true,
  tlsEnabled: false,
  tlsCiphers: '',
  members: [],
});

let createForm: any = useForm();
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.resource-name', {
      data: t('common.content.listener'),
    }),
  },
  description: { conInputMaxText: 40 },
  protocol: {
    conSelectRequired: '프로토콜',
  },
});

const poolMemberForm = ref<PoolMemberCreateType[]>(
  [] as PoolMemberCreateType[]
);
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
  getInstanceList(1, Number.MAX_SAFE_INTEGER, projectId)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        data.value.map((instance) => {
          let childrenData = [] as TableDataItem[];
          instance.network.addresses.map((addr, index) => {
            childrenData.push({
              id: addr.serverId + '_' + index.toString(),
              name: 'port name',
              networkName: addr.networkName,
              fixedIp: addr.addr,
              type: 'port',
            });
          });
          tableData.value.push({
            id: instance.id,
            name: instance.name,
            type: 'instance',
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

      poolMemberForm.value = [];
      selectedData.value.rows.map((data) => {
        if (data.fixedIp) {
          poolMemberForm.value.push({
            address: data.fixedIp,
            protocolPort: 66534,
            weight: 256,
          });
        }
      });
    },
    hideSelectAll: true,
    selectedRowKeys: selectedData.value.keys,
    getCheckboxProps: (record: TableDataItem) => ({
      disabled: record.checkDisabled,
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

const checkValid = () => {
  // invalid submit
};

// 자원 생성 : 서브넷 생성
const createResource = () => {
  if (sessionPersistence.value !== 'None') {
    poolForm.value.sessionPersistence = { type: sessionPersistence.value };
  }
  if (poolMemberForm.value.length > 0) {
    poolForm.value.members = poolMemberForm.value;
  }
  createPool(poolForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.pool'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.pool'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByName(router, 'load-balancer detail', { id: loadBalancerId });
    });
};

onMounted(() => {
  getInstanceResourceList();
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
