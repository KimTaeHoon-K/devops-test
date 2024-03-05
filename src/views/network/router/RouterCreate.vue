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
                v-model="routerForm.name"
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
                    @blur="handleBlur('name')"
                    @input="nameValue = $event.target.value"
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
                v-model="routerForm.description"
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
                name="owner"
                v-model="routerForm.projectId"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.owner-project')"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                  style="width: 100%"
                >
                  <!-- TODO: @update:value / @blur 동시 유효성 체크? -->
                  <a-select
                    :value="routerForm.projectId"
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
                name="availabilityZoneHint"
                v-model="routerForm.availabilityZoneHints"
              >
                <a-form-item label="Availability Zone Hint">
                  <a-select
                    v-model:value="routerForm.availabilityZoneHints"
                    mode="multiple"
                    show-search
                    placeholder="Availability Zone Hint를 선택해 주세요."
                    style="width: 100%"
                    :options="availabilityZoneHintOptions"
                  ></a-select>
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <a-form-item :label="'외부 네트워크'">
                <a-switch v-model:checked="routerExternal" />
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="routerExternal">
              <Field
                name="networkId"
                v-model="externalGatewayInfo.networkId"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.network')"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                  style="width: 100%"
                >
                  <a-select
                    v-model:value="externalGatewayInfo.networkId"
                    style="width: 100%"
                    :placeholder="
                      t('message.placeholder.select-2', {
                        data: t('common.content.network'),
                      })
                    "
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
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12" v-if="routerExternal">
              <a-form-item :label="'SNAT 활성화'">
                <a-switch v-model:checked="externalGatewayInfo.enableSnat" />
              </a-form-item>
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
import type { SelectProps } from 'ant-design-vue';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Field, Form, useField, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { goToPageByName } from '@/utils/RouterUtil';
import { openNotification } from '@/utils/CommonUtil';
import { getProjectList } from '@/axios/identity-service/ProjectApi';
import { ProjectType } from '@/types/identity/project/ProjectListType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { getAvailabilityZoneSummaryList } from '@/axios/compute-service/HostAggregatesApi';
import { RouterCreateType } from '@/types/network/router/RouterCreateType';
import { createRouter } from '@/axios/network-service/RouterApi';
import { NetworkType } from '@/types/network/network/NetworkListType';
import { getNetworkList } from '@/axios/network-service/NetworkApi';
import { ExternalGateWayInfoType } from '@/types/network/common/NetworkCommonType';
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
    routerForm.value.projectId = providerStore.getSelectedProjectId;
  } else {
    routerForm.value.projectId = undefined;
    setValidateFieldError('owner', undefined);
  }
};

// 자원 목록 조회 : 가용 존 목록 조회
const availabilityZoneHintOptions = ref<SelectProps['options']>([]);
const getAvailabilityZoneHintResourceList = () => {
  getAvailabilityZoneSummaryList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        res.data.data.forEach((avaZone) => {
          if (avaZone.zoneState.available) {
            availabilityZoneHintOptions.value?.push({
              value: avaZone.zoneName,
              label: avaZone.zoneName,
            });
          }
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

// 자원 목록 조회 : 네트워크 목록 조회
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
    });
};

const routerForm = ref<RouterCreateType>({
  name: '',
  description: '',
  projectId: '',
  routerExternal: false,
  externalGatewayInfo: undefined,
  availabilityZoneHints: [],
});

let createForm: any = useForm();
const { value: nameValue } = useField('name');
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  description: { conInputMaxText: 40 },
  owner: { conSelectRequired: '소유 프로젝트' },
  networkId: {},
});

const routerExternal = ref<boolean>(false);
const externalGatewayInfo = ref<ExternalGateWayInfoType>({
  enableSnat: false,
  networkId: undefined,
  externalFixedIps: [], // 자동 할당
});

watch(routerExternal, () => {
  if (routerExternal.value) {
    validationSchema.value.networkId = { conSelectRequired: '네트워크' };
  } else {
    validationSchema.value.networkId = {};
    externalGatewayInfo.value.enableSnat = false;
    externalGatewayInfo.value.networkId = undefined;
  }
});

const checkValid = () => {
  // invalid submit
};

const handleProjectChange = (e: any) => {
  routerForm.value.projectId = e;
  createForm.validateField('projectId').then();
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

// 자원 생성 : 라우터 생성
const createResource = () => {
  if (routerExternal.value) {
    routerForm.value.externalGatewayInfo = externalGatewayInfo.value;
  }
  createRouter(routerForm.value)
    .then((res) => {
      openNotification(
        true,
        '라우터 생성이 성공적으로 완료되었습니다.',
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        '라우터 생성에 실패하였습니다.\n' + err.code + err.message,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      router.go(-1);
      // goToPageByName(router, 'router');
    });
};

onMounted(() => {
  getAvailabilityZoneHintResourceList();
  getProjectResourceList();
  setProjectSelection();
  getNetworkResourceList();
});
</script>
<style lang="scss" scoped></style>
