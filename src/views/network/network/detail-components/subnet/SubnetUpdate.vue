<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header class="page-header" :title="t(route.meta?.title)" />
  <Form
    @submit="updateResource"
    @invalid-submit="checkValid"
    :validation-schema="validationSchema"
    ref="createForm"
  >
    <div class="contents">
      <a-card :loading="isLoading">
        <a-form class="form" name="basic" layout="vertical">
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="name"
                v-model:value="subnetUpdateForm.name"
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
                    v-model:value="subnetUpdateForm.name"
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
              <a-form-item :label="'CIDR'" :rules="[{ required: true }]">
                <a-input v-model:value="data.cidr" disabled />
              </a-form-item>
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
                    v-model="subnetUpdateForm.gatewayIp"
                    v-slot="{ handleChange, errorMessage }"
                  >
                    <a-form-item
                      :label="'게이트웨이 IP'"
                      :help="errorMessage"
                      :has-feedback="!!errorMessage"
                      :validate-status="errorMessage ? 'error' : undefined"
                    >
                      <a-input
                        v-model:value="subnetUpdateForm.gatewayIp"
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
          <a-button size="large" @click="goToPageByPrevPath">{{
            t('common.content.action.cancel')
          }}</a-button>
          <a-button type="primary" size="large" html-type="submit">{{
            t('common.content.action.edit')
          }}</a-button>
        </a-space>
      </div>
    </div>
  </Form>
</template>

<script lang="ts" setup>
import { MinusCircleOutlined } from '@ant-design/icons-vue';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Field, Form, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { goToPageByName } from '@/utils/RouterUtil';
import { SubnetType } from '@/types/network/network/subnet/SubnetListType';
import {
  getSubnetDetail,
  updateSubnet,
} from '@/axios/network-service/SubnetApi';
import {
  SubnetUpdateFormType,
  SubnetUpdateType,
} from '@/types/network/network/subnet/SubnetUpdateType';
import { openNotification } from '@/utils/CommonUtil';
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
const subnetId = route.params.subnetId as string;

const detailOptionActiveKey = ref();
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

const subnetUpdateForm = ref<SubnetUpdateFormType>({} as SubnetUpdateFormType);

let createForm: any = useForm();
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  gatewayIp: { conInputIpv4: String },
  // allocationPools: { conInputRequired: '할당 풀', conInputNotBlank: String },
  // dnsNameservers: { conInputRequired: 'DNS', conInputNotBlank: String },
  // hostRoutes: { conInputRequired: '호스트 라우트', conInputNotBlank: String },
});

const gatewayEnabled = ref<boolean>(true);
const enableDhcp = ref<boolean>(true);

const checkValid = () => {
  // invalid submit
};

const isLoading = ref<boolean>(true);

const data = ref<SubnetType>({} as SubnetType);

const getResource = (id: string) => {
  getSubnetDetail(id)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        subnetUpdateForm.value = {
          id: data.value.id,
          name: data.value.name,
          description: data.value.description,
          enableDhcp: data.value.enableDhcp,
          dnsNameservers: [],
          allocationPools: [],
          hostRoutes: [],
          ipVersion: data.value.ipVersion,
          gatewayIp: data.value.gatewayIp,
        };
        gatewayEnabled.value = !!data.value.gatewayIp;
        enableDhcp.value = data.value.enableDhcp;
        if (gatewayEnabled.value || enableDhcp.value) {
          detailOptionActiveKey.value = '1';
        }
        subnetFormToDynamicValidateForm(data.value);
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};
// 자원 수정 : 서브넷 수정
const updateResource = () => {
  // undefined: 비활성화 / 빈 문자열: 활성화, 자동 할당
  if (!gatewayEnabled.value) {
    subnetUpdateForm.value.gatewayIp = undefined;
  } else if (!subnetUpdateForm.value.gatewayIp) {
    subnetUpdateForm.value.gatewayIp = '';
  }
  if (!enableDhcp.value) {
    subnetUpdateForm.value.allocationPools = [];
    subnetUpdateForm.value.dnsNameservers = [];
    subnetUpdateForm.value.hostRoutes = [];
  } else {
    dynamicValidateFormToSubnetForm();
  }
  let subnetUpdateType = {
    subnet: {} as SubnetUpdateFormType,
  } as SubnetUpdateType;
  subnetUpdateType.subnet = subnetUpdateForm.value;
  updateSubnet(subnetUpdateType.subnet.id, subnetUpdateType)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.subnet'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.subnet'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByPrevPath();
    });
};

const subnetFormToDynamicValidateForm = (subnet: SubnetType) => {
  if (subnet.allocationPools.length) {
    dynamicValidateForm.value.allocationPools = [];
    subnet.allocationPools.map((pool) => {
      dynamicValidateForm.value.allocationPools.push({
        value: pool.start.concat(',', pool.end),
        key: Date.now(),
      });
    });
  }
  if (subnet.dnsNameservers.length) {
    dynamicValidateForm.value.dnsNameservers = [];
    subnet.dnsNameservers.map((dns) => {
      dynamicValidateForm.value.dnsNameservers.push({
        value: dns,
        key: Date.now(),
      });
    });
  }
  if (subnet.hostRoutes.length) {
    dynamicValidateForm.value.hostRoutes = [];
    subnet.hostRoutes.map((hostRoute) => {
      dynamicValidateForm.value.hostRoutes.push({
        value: hostRoute.destination.concat(',', hostRoute.nexthop),
        key: Date.now(),
      });
    });
  }
};

const dynamicValidateFormToSubnetForm = () => {
  dynamicValidateForm.value.allocationPools.map((pool: DynamicValidateType) => {
    if (pool.value.length > 0) {
      let splitPoolData = pool.value.split(',');
      subnetUpdateForm.value.allocationPools.push({
        start: splitPoolData[0],
        end: splitPoolData[1],
      });
    }
  });
  dynamicValidateForm.value.dnsNameservers.map((dns: DynamicValidateType) => {
    if (dns.value.length > 0) {
      subnetUpdateForm.value.dnsNameservers.push(dns.value);
    }
  });
  dynamicValidateForm.value.hostRoutes.map((hostRoute: DynamicValidateType) => {
    if (hostRoute.value.length > 0) {
      let splitHostRouteData = hostRoute.value.split(',');
      subnetUpdateForm.value.hostRoutes.push({
        destination: splitHostRouteData[0],
        nexthop: splitHostRouteData[1],
      });
    }
  });
};

const goToPageByPrevPath = () => {
  if (prevPath.value && prevPath.value.includes('/subnet')) {
    goToPageByName(router, 'network subnet detail', {
      id: networkId,
      subnetId: subnetId,
    });
  } else if (prevPath.value && prevPath.value.includes('/topology')) {
    router.go(-1);
  } else {
    goToPageByName(router, 'network detail', { id: networkId });
  }
};

const prevPath = ref<string>();
onMounted(async () => {
  await router.isReady();
  prevPath.value = router.options.history.state.back as string;
  getResource(subnetId);
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
