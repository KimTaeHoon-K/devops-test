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
                v-model="portForm.name"
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
              <Field
                name="description"
                v-model="portForm.description"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.description')"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    v-model:value="portForm.description"
                    @blur="handleChange"
                    @input="handleChange"
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
                name="networkId"
                v-model="portForm.networkId"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  label="할당 네트워크"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-select
                    v-model:value="portForm.networkId"
                    style="width: 100%"
                    :placeholder="
                      t('message.placeholder.select-2', {
                        data: t('common.content.network'),
                      })
                    "
                    :loading="isNetworkLoading"
                    :disabled="networkOptionsDisabled"
                  >
                    <a-select-option
                      v-for="network in networkOptions"
                      v-bind:key="network"
                      :value="network.id"
                    >
                      {{ network.name }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field
                name="projectId"
                v-model="portForm.projectId"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  label="할당 프로젝트"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-select
                    v-model:value="portForm.projectId"
                    style="width: 100%"
                    :placeholder="
                      t('message.placeholder.select-2', {
                        data: t('common.content.project'),
                      })
                    "
                    :loading="isProjectLoading"
                    :disabled="projectOptionsDisabled"
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
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <a-form-item :label="'Mac Address'" :rules="[{ required: true }]">
                <a-radio-group v-model:value="macAddressAllocationType">
                  <a-radio :value="'auto'">자동 할당</a-radio>
                  <a-radio :value="'manual'">수동 할당</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col v-if="macAddressAllocationType === 'manual'" :span="12">
              <Field
                name="macAddress"
                v-model="portForm.macAddress"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'Mac Address 입력'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    v-model:value="portForm.macAddress"
                    @update:value="handleChange"
                    @blur="handleChange"
                    :placeholder="
                      t('message.placeholder.input-2', {
                        data: 'Mac Address',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <a-form-item :label="'포트 타입'" :rules="[{ required: true }]">
                <a-radio-group v-model:value="portTypeRadio">
                  <a-radio :value="'normal'">일반</a-radio>
                  <a-radio :value="'custom'">사용자 지정</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="portTypeRadio === 'custom'">
              <Field
                name="portType"
                v-model="portType"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="'포트 타입 선택'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-select
                    v-model:value="portType"
                    show-search
                    placeholder="포트 타입을 선택해 주세요."
                    style="width: 100%"
                    :options="portTypeOptions"
                  ></a-select>
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <a-form-item :label="'포트 보안'">
                <a-switch v-model:checked="portSecurityEnabled" />
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="portSecurityEnabled">
              <Field
                name="securityGroups"
                v-model="portForm.securityGroups"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  label="보안 그룹"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-select
                    v-model:value="portForm.securityGroups"
                    style="width: 100%"
                    :placeholder="
                      t('message.placeholder.select-1', {
                        data: t('common.content.security-group'),
                      })
                    "
                    :loading="isSecurityGroupLoading"
                    mode="multiple"
                  >
                    <a-select-option
                      v-for="securityGroup in securityGroupOptions"
                      v-bind:key="securityGroup"
                      :value="securityGroup.id"
                    >
                      {{ securityGroup.name }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
        </a-form>
      </a-card>
    </div>
    <div class="footer-bar">
      <div class="footer-bar-right">
        <a-space :size="SizeConst.sixteen">
          <a-button size="large" @click="goToPageByFrom">{{
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
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Field, Form, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { openNotification } from '@/utils/CommonUtil';
import { goToPageByName } from '@/utils/RouterUtil';
import { PortCreateType } from '@/types/network/port/PortCreateType';
import { createPort } from '@/axios/network-service/PortApi';
import { getNetworkList } from '@/axios/network-service/NetworkApi';
import { NetworkType } from '@/types/network/network/NetworkListType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { getSecurityGroupList } from '@/axios/network-service/SecurityGroupApi';
import { SecurityGroupType } from '@/types/network/security-group/SecurityGroupListType';
import { getProjectList } from '@/axios/identity-service/ProjectApi';
import { ProjectType } from '@/types/identity/project/ProjectListType';
import { SizeConst } from '@/types/common/constant/SizeConst';

// TODO: 생성 중 프로젝트 변경 하면 안되지 않나..?
const providerStore = ProviderStore();
watch(providerStore, () => {
  isNetworkLoading.value = true;
  portForm.value.networkId = undefined;
  networkOptions.value = [];
  getNetworkResourceList();
  isSecurityGroupLoading.value = true;
  portForm.value.securityGroups = [];
  securityGroupOptions.value = [];
  getSecurityGroupResourceList();
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const queryProjectId = route.query?.projectId as string;
const queryNetworkId = route.query?.networkId as string;
const querySubnetId = route.query?.subnetId as string;

const portTypeOptions = ref<SelectProps['options']>([
  {
    value: 'macvtap',
    label: 'macvtap',
  },
  {
    value: 'direct',
    label: 'direct',
  },
  {
    value: 'baremetal',
    label: 'baremetal',
  },
  {
    value: 'direct-physical',
    label: 'direct-physical',
  },
  {
    value: 'virtio-forwarder',
    label: 'virtio-forwarder',
  },
  {
    value: 'smart-nic',
    label: 'smart-nic',
  },
]);

const macAddressAllocationType = ref<string>('auto');
const portTypeRadio = ref<string>('normal');
const portType = ref<string | undefined>(undefined);
const portSecurityEnabled = ref<boolean>(true);
const portForm = ref<PortCreateType>({
  name: '',
  description: '',
  networkId: undefined,
  bindingVnicType: '',
  securityGroups: [],
  macAddress: undefined,
  portSecurityEnabled: true,
  projectId: undefined,
});

let createForm: any = useForm();
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  description: { conInputMaxText: 40 },
  networkId: { conSelectRequired: '네트워크' },
  securityGroups: { conMultipleSelectRequired: '보안 그룹' },
  macAddress: {},
  portType: {},
});

watch([macAddressAllocationType, portTypeRadio, portSecurityEnabled], () => {
  if (macAddressAllocationType.value === 'auto') {
    portForm.value.macAddress = undefined;
    validationSchema.value.macAddress = {};
  } else {
    validationSchema.value.macAddress = {
      conInputRequired: 'Mac Address',
      conInputMacAddress: String,
    };
  }

  if (portTypeRadio.value === 'normal') {
    portType.value = undefined;
    validationSchema.value.portType = {};
  } else {
    validationSchema.value.portType = { conSelectRequired: '포트 타입' };
  }

  if (portSecurityEnabled.value) {
    validationSchema.value.securityGroups = {
      conMultipleSelectRequired: '보안 그룹',
    };
  } else {
    validationSchema.value.securityGroups = {};
  }
});

const networkOptions = ref<NetworkType[]>();
const isNetworkLoading = ref<boolean>(true);
const networkOptionsDisabled = ref<boolean>(false);
const getNetworkResourceList = () => {
  let projectId = undefined;
  if (queryProjectId) {
    projectId = queryProjectId;
  } else if (
    providerStore.isSelected &&
    !providerStore.getSelectedProjectId.includes('all')
  ) {
    projectId = providerStore.getSelectedProjectId;
  }
  getNetworkList(1, Number.MAX_SAFE_INTEGER, projectId)
    .then((res) => {
      if (res.status === 200) {
        networkOptions.value = res.data.data;
        if (queryNetworkId) {
          portForm.value.networkId = queryNetworkId;
          networkOptionsDisabled.value = true;
        }
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isNetworkLoading.value = false;
    });
};

const projectOptions = ref<ProjectType[]>();
const isProjectLoading = ref<boolean>(true);
const projectOptionsDisabled = ref<boolean>(false);
const getProjectResourceList = () => {
  getProjectList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        projectOptions.value = res.data.data;
        if (queryProjectId) {
          portForm.value.projectId = queryProjectId;
          projectOptionsDisabled.value = true;
        }
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isProjectLoading.value = false;
    });
};

const securityGroupOptions = ref<SecurityGroupType[]>();
const isSecurityGroupLoading = ref<boolean>(true);
const getSecurityGroupResourceList = () => {
  let projectId = undefined;
  if (
    providerStore.isSelected &&
    !providerStore.getSelectedProjectId.includes('all')
  ) {
    projectId = providerStore.getSelectedProjectId;
  }
  getSecurityGroupList(1, Number.MAX_SAFE_INTEGER, projectId)
    .then((res) => {
      if (res.status === 200) {
        securityGroupOptions.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isSecurityGroupLoading.value = false;
    });
};
const checkValid = () => {
  // invalid submit
};

// 자원 생성 : 포트 생성
const createResource = () => {
  if (querySubnetId) {
    portForm.value.fixedIps = [{ subnetId: querySubnetId }];
  }
  portForm.value.portSecurityEnabled = portSecurityEnabled.value;
  if (portTypeRadio.value === 'normal') {
    portForm.value.bindingVnicType = portTypeRadio.value;
  } else if (portTypeRadio.value === 'custom' && portType.value) {
    portForm.value.bindingVnicType = portType.value;
  }
  createPort(portForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.port'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.port'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByFrom();
    });
};

const goToPageByFrom = () => {
  let prevPath = router.options.history.state.back as string;
  if (prevPath.includes('/topology')) {
    router.go(-1);
  } else {
    if (queryNetworkId) {
      if (querySubnetId) {
        goToPageByName(router, 'network subnet detail', {
          id: queryNetworkId,
          subnetId: querySubnetId,
        });
      } else {
        goToPageByName(router, 'network detail', { id: queryNetworkId });
      }
    } else {
      goToPageByName(router, 'port');
    }
  }
};

onMounted(() => {
  getNetworkResourceList();
  getProjectResourceList();
  getSecurityGroupResourceList();
});
</script>
<style lang="scss" scoped></style>
