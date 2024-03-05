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
                v-model="subnetForm.name"
                v-slot="{ handleChange, errorMessage }"
              >
                <!-- :rules="[{ required: true }]" : label 필수 표시 위해 추가 -->
                <a-form-item
                  :label="t('common.column.name')"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    @update:value="handleChange"
                    @blur="handleChange"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: t('common.column.name'),
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <a-form-item
                :label="t('common.column.project')"
                :rules="[{ required: true }]"
                style="width: 100%"
              >
                <a-select
                  :value="subnetForm.projectId"
                  style="width: 100%"
                  :placeholder="
                    t('message.placeholder.select-2', {
                      data: t('common.content.project'),
                    })
                  "
                  disabled
                >
                  <a-select-option
                    v-for="project in projectOptions"
                    v-bind:key="project"
                    :value="project.id"
                  >
                    {{ project.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field name="ipVersion" v-model="ipVersion">
                <a-form-item label="IP Version">
                  <a-select
                    v-model:value="ipVersion"
                    show-search
                    placeholder="IP Version을 선택해 주세요."
                    style="width: 100%"
                    :options="ipVersionOptions"
                    disabled
                  ></a-select>
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field
                name="cidr"
                v-model="subnetForm.cidr"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'CIDR'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    @update:value="handleChange"
                    @blur="handleChange"
                    :placeholder="'e.g. 192.168.0.0/24'"
                  />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-collapse
            v-model:activeKey="detailOptionActiveKey"
            expandIconPosition="right"
            ghost
          >
            <a-collapse-panel key="1" header="세부 옵션">
              <a-row class="form-row" :gutter="12">
                <a-col :span="12">
                  <a-form-item :label="'게이트웨이 활성화'">
                    <a-switch v-model:checked="gatewayEnabled" />
                  </a-form-item>
                </a-col>
                <a-col v-if="gatewayEnabled" :span="12">
                  <Field
                    name="gatewayIp"
                    v-model="subnetForm.gatewayIp"
                    v-slot="{ handleChange, errorMessage }"
                  >
                    <a-form-item
                      :label="'게이트웨이 IP'"
                      :help="errorMessage"
                      :has-feedback="!!errorMessage"
                      :validate-status="errorMessage ? 'error' : undefined"
                    >
                      <a-input
                        @update:value="handleChange"
                        @blur="handleChange"
                        :placeholder="
                          t('message.placeholder.input-2', {
                            data: '게이트웨이 IP',
                          })
                        "
                      />
                    </a-form-item>
                  </Field>
                </a-col>
              </a-row>
              <a-row class="form-row" :gutter="12">
                <a-col :span="6">
                  <a-form-item :label="'DHCP 활성화'">
                    <a-switch v-model:checked="enableDhcp" />
                  </a-form-item>
                </a-col>
                <a-col v-if="enableDhcp" :span="6">
                  <Field
                    v-for="(pool, index) in dynamicValidateForm.allocationPools"
                    :key="pool.key"
                    name="allocationPools"
                    v-model:value="pool.value"
                    v-slot="{ handleChange, errorMessage }"
                  >
                    <a-form-item
                      :label="index === 0 ? '할당 풀' : ''"
                      :help="errorMessage"
                      :has-feedback="!!errorMessage"
                      :validate-status="errorMessage ? 'error' : undefined"
                    >
                      <a-input
                        v-model:value="pool.value"
                        :placeholder="
                          t('message.placeholder.input-1', {
                            data: '할당 풀',
                          })
                        "
                        @update:value="handleChange"
                        @blur="handleChange"
                        style="width: 80%; margin-right: 8px"
                      />
                      <MinusCircleOutlined
                        v-if="dynamicValidateForm.allocationPools.length > 1"
                        class="dynamic-delete-button"
                        @click="
                          removeDynamicValidateItem(pool, 'allocationPools')
                        "
                      />
                    </a-form-item>
                  </Field>
                  <a-form-item>
                    <a-button
                      type="dashed"
                      style="width: 80%"
                      @click="addDynamicValidateItem('allocationPools')"
                    >
                      <PlusOutlined />
                      Add New
                    </a-button>
                  </a-form-item>
                </a-col>
                <a-col v-if="enableDhcp" :span="6">
                  <Field
                    v-for="(dns, index) in dynamicValidateForm.dnsNameservers"
                    :key="dns.key"
                    name="dnsNameservers"
                    v-model:value="dns.value"
                    v-slot="{ handleChange, errorMessage }"
                  >
                    <a-form-item
                      :label="index === 0 ? 'DNS' : ''"
                      :help="errorMessage"
                      :has-feedback="!!errorMessage"
                      :validate-status="errorMessage ? 'error' : undefined"
                    >
                      <a-input
                        v-model:value="dns.value"
                        :placeholder="
                          t('message.placeholder.input-1', {
                            data: 'DNS',
                          })
                        "
                        @update:value="handleChange"
                        @blur="handleChange"
                        style="width: 80%; margin-right: 8px"
                      />
                      <MinusCircleOutlined
                        v-if="dynamicValidateForm.dnsNameservers.length > 1"
                        class="dynamic-delete-button"
                        @click="
                          removeDynamicValidateItem(dns, 'dnsNameservers')
                        "
                      />
                    </a-form-item>
                  </Field>
                  <a-form-item>
                    <a-button
                      type="dashed"
                      style="width: 80%"
                      @click="addDynamicValidateItem('dnsNameservers')"
                    >
                      <PlusOutlined />
                      Add New
                    </a-button>
                  </a-form-item>
                </a-col>
                <a-col v-if="enableDhcp" :span="6">
                  <Field
                    v-for="(hostRoute, index) in dynamicValidateForm.hostRoutes"
                    v-bind:key="hostRoute.key"
                    name="hostRoutes"
                    v-model:value="hostRoute.value"
                    v-slot="{ handleChange, errorMessage }"
                  >
                    <a-form-item
                      :label="index === 0 ? '호스트 라우트' : ''"
                      :help="errorMessage"
                      :has-feedback="!!errorMessage"
                      :validate-status="errorMessage ? 'error' : undefined"
                    >
                      <a-input
                        v-model:value="hostRoute.value"
                        :placeholder="
                          t('message.placeholder.input-1', {
                            data: '호스트 라우트',
                          })
                        "
                        @update:value="handleChange"
                        @blur="handleChange"
                        style="width: 80%; margin-right: 8px"
                      />
                      <MinusCircleOutlined
                        v-if="dynamicValidateForm.hostRoutes.length > 1"
                        class="dynamic-delete-button"
                        @click="
                          removeDynamicValidateItem(hostRoute, 'hostRoutes')
                        "
                      />
                    </a-form-item>
                  </Field>
                  <a-form-item>
                    <a-button
                      type="dashed"
                      style="width: 80%"
                      @click="addDynamicValidateItem('hostRoutes')"
                    >
                      <PlusOutlined />
                      Add New
                    </a-button>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-collapse-panel>
          </a-collapse>
        </a-form>
      </a-card>
    </div>
    <div class="footer-bar">
      <div class="footer-bar-right">
        <a-space :size="SizeConst.sixteen">
          <a-button size="large" @click="router.go(-1)">{{
            t('common.content.action.cancel')
          }}</a-button>
          <a-button type="primary" size="large" html-type="submit">{{
            t('common.content.action.create')
          }}</a-button>
        </a-space>
      </div>
    </div>
  </Form>
</template>

<script lang="ts" setup>
import type { SelectProps } from 'ant-design-vue';
import { MinusCircleOutlined } from '@ant-design/icons-vue';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Field, Form, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { getProjectList } from '@/axios/identity-service/ProjectApi';
import { ProjectType } from '@/types/identity/project/ProjectListType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { SubnetCreateType } from '@/types/network/network/subnet/SubnetCreateType';
import { openNotification } from '@/utils/CommonUtil';
import { goToPageByName } from '@/utils/RouterUtil';
import { createSubnet } from '@/axios/network-service/SubnetApi';
import { SizeConst } from '@/types/common/constant/SizeConst';

// TODO: 생성 중 프로젝트 변경 하면 안되지 않나..?
const providerStore = ProviderStore();
watch(providerStore, () => {
  goToPageByName(router, 'network list');
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const networkId = route.params.id as string;
const projectId = route.query.projectId as string;

const detailOptionActiveKey = ref();
const ipVersion = ref<number>(4);
const ipVersionOptions = ref<SelectProps['options']>([
  {
    value: 4,
    label: 'IPv4',
  },
  {
    value: 6,
    label: 'IPv6',
  },
]);

interface DynamicValidateType {
  value: string;
  key: number;
}
const dynamicValidateForm = ref<any>({
  allocationPools: [
    {
      value: '',
      key: Date.now(),
    },
  ],
  dnsNameservers: [
    {
      value: '',
      key: Date.now(),
    },
  ],
  hostRoutes: [
    {
      value: '',
      key: Date.now(),
    },
  ],
});
const removeDynamicValidateItem = (
  item: DynamicValidateType,
  field: string
) => {
  let index = dynamicValidateForm.value[field].indexOf(item);
  if (index !== -1) {
    dynamicValidateForm.value[field].splice(index, 1);
  }
};
const addDynamicValidateItem = (field: string) => {
  dynamicValidateForm.value[field].push({
    value: '',
    key: Date.now(),
  });
};

// 자원 목록 조회 : 프로젝트 목록 조회
const projectOptions = ref<ProjectType[]>([]);
const getProjectResourceList = () => {
  getProjectList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        projectOptions.value = res.data.data;
        // 서브넷 생성의 경우 프로젝트 아이디 네트워크의 프로젝트 아이디와 일치.
        subnetForm.value.projectId = projectId;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

const subnetForm = ref<SubnetCreateType>({
  name: '',
  description: '',
  networkId: '',
  projectId: '',
  ipVersion: 4,
  cidr: '',
  gatewayIp: undefined,
  enableDhcp: false,
  allocationPools: [],
  dnsNameservers: [],
  hostRoutes: [],
});

let createForm: any = useForm();
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  cidr: { conInputRequired: 'CIDR', conInputIpv4Cidr: String },
  gatewayIp: { conInputIpv4: String },
  // allocationPools: { conInputRequired: '할당 풀', conInputNotBlank: String },
  // dnsNameservers: { conInputRequired: 'DNS', conInputNotBlank: String },
  // hostRoutes: { conInputRequired: '호스트 라우트', conInputNotBlank: String },
});

const gatewayEnabled = ref<boolean>(false);
const enableDhcp = ref<boolean>(false);

watch([gatewayEnabled, enableDhcp], () => {
  if (!gatewayEnabled.value) {
    subnetForm.value.gatewayIp = undefined;
  } else {
    subnetForm.value.gatewayIp = '';
  }

  if (enableDhcp.value) {
    // validationSchema.value.allocationPools = { conInputRequired: '할당 풀' };
    // validationSchema.value.dnsNameservers = { conInputRequired: 'DNS' };
    // validationSchema.value.hostRoutes = { conInputRequired: '호스트 라우트' };
  } else {
    dynamicValidateForm.value = {
      allocationPools: [
        {
          value: '',
          key: Date.now(),
        },
      ],
      dnsNameservers: [
        {
          value: '',
          key: Date.now(),
        },
      ],
      hostRoutes: [
        {
          value: '',
          key: Date.now(),
        },
      ],
    };
    // validationSchema.value.allocationPools = {};
    // validationSchema.value.dnsNameservers = {};
    // validationSchema.value.hostRoutes = {};
  }
});

const checkValid = () => {
  // invalid submit
};

// 자원 생성 : 서브넷 생성
const createResource = () => {
  subnetForm.value.networkId = networkId;
  subnetForm.value.enableDhcp = enableDhcp.value;
  // undefined: 비활성화 / 빈 문자열: 활성화, 자동 할당
  if (!gatewayEnabled.value) {
    subnetForm.value.gatewayIp = undefined;
  }
  if (subnetForm.value.enableDhcp) {
    dynamicValidateFormToSubnetForm();
  }
  createSubnet(subnetForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.subnet'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.subnet'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      router.go(-1);
      // goToPageByName(router, 'network detail', { id: networkId });
    });
};

const dynamicValidateFormToSubnetForm = () => {
  dynamicValidateForm.value.allocationPools.map((pool: DynamicValidateType) => {
    if (pool.value.length > 0) {
      let splitPoolData = pool.value.split(',');
      subnetForm.value.allocationPools.push({
        start: splitPoolData[0],
        end: splitPoolData[1],
      });
    }
  });
  dynamicValidateForm.value.dnsNameservers.map((dns: DynamicValidateType) => {
    if (dns.value.length > 0) {
      subnetForm.value.dnsNameservers.push(dns.value);
    }
  });
  dynamicValidateForm.value.hostRoutes.map((hostRoute: DynamicValidateType) => {
    if (hostRoute.value.length > 0) {
      let splitHostRouteData = hostRoute.value.split(',');
      subnetForm.value.hostRoutes.push({
        destination: splitHostRouteData[0],
        nexthop: splitHostRouteData[1],
      });
    }
  });
};

onMounted(() => {
  getProjectResourceList();
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
