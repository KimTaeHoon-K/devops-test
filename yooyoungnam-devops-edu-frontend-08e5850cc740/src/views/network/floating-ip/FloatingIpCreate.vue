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
                name="owner"
                v-model="floatingIpForm.tenantId"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="'할당 프로젝트'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                  style="width: 100%"
                >
                  <!-- TODO: @update:value / @blur 동시 유효성 체크? -->
                  <a-select
                    :value="floatingIpForm.tenantId"
                    style="width: 100%"
                    :placeholder="
                      t('message.placeholder.select-2', {
                        data: t('common.content.project'),
                      })
                    "
                    :disabled="projectOptionsDisabled"
                    @update:value="handleProjectChange"
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
            <a-col :span="12">
              <Field
                name="description"
                v-model="floatingIpForm.description"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.description')"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    @update:value="handleChange"
                    @blur="handleBlur('description')"
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
                v-model="networkId"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="'할당 네트워크'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                  style="width: 100%"
                >
                  <a-select
                    v-model:value="networkId"
                    style="width: 100%"
                    :placeholder="
                      t('message.placeholder.select-2', {
                        data: t('common.content.network'),
                      })
                    "
                    :loading="networkLoading"
                  >
                    <a-select-option
                      v-for="network in networkOptions"
                      v-bind:key="network"
                      :value="network.id"
                    >
                      {{ network.name ? network.name : network.id }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field name="subnetId" v-model="floatingIpForm.subnetId">
                <a-form-item label="할당 서브넷">
                  <a-select
                    v-model:value="floatingIpForm.subnetId"
                    style="width: 100%"
                    :placeholder="
                      t('message.placeholder.select-1', {
                        data: t('common.content.subnet'),
                      })
                    "
                    :loading="subnetLoading"
                    :not-found-content="
                      networkId
                        ? undefined
                        : t('message.table.select-previous-data-first', {
                            prevData: t('common.content.network'),
                            data: t('common.content.subnet'),
                          })
                    "
                  >
                    <a-select-option
                      v-for="subnet in subnetOptions"
                      v-bind:key="subnet"
                      :value="subnet.id"
                    >
                      {{ subnet.name ? subnet.name : subnet.id }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="floatingIp"
                v-model="floatingIpForm.floatingIpAddress"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'유동 IP'"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    @update:value="handleChange"
                    @blur="handleBlur('floatingIpAddress')"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: t('common.column.floating-ip'),
                      })
                    "
                  />
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
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Field, Form, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { goToPageByName } from '@/utils/RouterUtil';
import { openNotification } from '@/utils/CommonUtil';
import { getProjectList } from '@/axios/identity-service/ProjectApi';
import { ProjectType } from '@/types/identity/project/ProjectListType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { NetworkType } from '@/types/network/network/NetworkListType';
import { getNetworkList } from '@/axios/network-service/NetworkApi';
import { SubnetType } from '@/types/network/network/subnet/SubnetListType';
import { getSubnetList } from '@/axios/network-service/SubnetApi';
import { FloatingIpCreateType } from '@/types/network/floating-ip/FloatingIpCreateType';
import { createFloatingIp } from '@/axios/network-service/FloatingApi';
import { SizeConst } from '@/types/common/constant/SizeConst';

// TODO: 생성 중 프로젝트 변경 하면 안되지 않나..?
const providerStore = ProviderStore();
const projectOptionsDisabled = ref<boolean>();
watch(providerStore, () => {
  getProjectResourceList();
  setProjectSelection();
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

// 자원 목록 조회 : 프로젝트 목록 조회
const projectOptions = ref<ProjectType[]>([]);
const getProjectResourceList = () => {
  getProjectList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        projectOptions.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};
// 공급자/프로젝트 선택 시 선택된 프로젝트 변경
const setProjectSelection = () => {
  projectOptionsDisabled.value =
    providerStore.isSelected &&
    !providerStore.getSelectedProjectId.includes('all');
  if (projectOptionsDisabled.value) {
    floatingIpForm.value.tenantId = providerStore.getSelectedProjectId;
  } else {
    floatingIpForm.value.tenantId = undefined;
    setValidateFieldError('owner', undefined);
  }
};

// 자원 목록 조회 : 네트워크 목록 조회
const networkLoading = ref<boolean>(true);
const networkId = ref<string | undefined>();
const networkOptions = ref<NetworkType[]>([]);
const getNetworkResourceList = () => {
  getNetworkList(1, Number.MAX_SAFE_INTEGER, undefined, true)
    .then((res) => {
      if (res.status === 200) {
        networkOptions.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      networkLoading.value = false;
    });
};
watch(networkId, () => {
  if (networkId.value) {
    subnetLoading.value = true;
    getSubnetResourceList(networkId.value);
  }
});

// 자원 목록 조회 : 서브넷 목록 조회
const subnetLoading = ref<boolean>(false);
const subnetOptions = ref<SubnetType[]>([]);
const getSubnetResourceList = (networkId: string) => {
  getSubnetList(1, Number.MAX_SAFE_INTEGER, networkId)
    .then((res) => {
      if (res.status === 200) {
        subnetOptions.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      subnetLoading.value = false;
    });
};

const floatingIpForm = ref<FloatingIpCreateType>({
  tenantId: '',
  description: '',
  floatingNetworkId: '',
  subnetId: undefined,
  floatingIpAddress: undefined,
});

let createForm: any = useForm();
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  description: { conInputMaxText: 40 },
  owner: { conSelectRequired: '할당 프로젝트' },
  networkId: { conSelectRequired: '할당 네트워크' },
});

const checkValid = () => {
  // invalid submit
};

const handleProjectChange = (e: any) => {
  floatingIpForm.value.tenantId = e;
  createForm.validateField('owner').then();
};

const handleBlur = (field: string, inputType?: string) => {
  if (field !== 'owner') {
    createForm.validateField(field);
    setValidateFieldError('owner', undefined);
  }
};

const setValidateFieldError = (field: string, error: string | undefined) => {
  createForm.validateField(field).then((res: any) => {
    if (!res.valid) {
      createForm.setFieldError(field, error);
    }
  });
};

// 자원 생성 : 유동 IP 생성
const createResource = () => {
  if (networkId.value) {
    floatingIpForm.value.floatingNetworkId = networkId.value;
  }
  if (floatingIpForm.value.floatingIpAddress?.length === 0) {
    floatingIpForm.value.floatingIpAddress = undefined;
  }
  createFloatingIp(floatingIpForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.floating-ip'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.floating-ip'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByName(router, 'floating-ip');
    });
};

onMounted(() => {
  getProjectResourceList();
  setProjectSelection();
  getNetworkResourceList();
});
</script>
<style lang="scss" scoped></style>
