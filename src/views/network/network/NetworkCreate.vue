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
        <a-row>
          <a-form-item>
            <a-radio-group
              class="radio-group-button"
              v-model:value="classification"
              name="classificationChoice"
            >
              <a-radio-button value="public">관리 네트워크</a-radio-button>
              <a-radio-button value="project">테넌트 네트워크</a-radio-button>
            </a-radio-group>
          </a-form-item>
        </a-row>
        <a-form class="form" name="basic" layout="vertical">
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="name"
                v-model="networkForm.name"
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
                v-model="networkForm.description"
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
                v-model="networkForm.projectId"
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
                    :value="networkForm.projectId"
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
                v-model="networkForm.availabilityZoneHints"
                v-slot="{ errorMessage }"
              >
                <a-form-item label="Availability Zone Hint">
                  <a-select
                    v-model:value="networkForm.availabilityZoneHints"
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
          <a-row
            v-if="classification === 'public'"
            class="form-row"
            :gutter="12"
          >
            <a-col :span="12">
              <Field
                name="providerNetworkType"
                v-model="providerNetworkType"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="'공급자 네트워크 타입'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                  style="width: 100%"
                >
                  <a-select
                    v-model:value="providerNetworkType"
                    style="width: 100%"
                    :placeholder="
                      t('message.placeholder.select-1', {
                        data: '공급자 네트워크 타입',
                      })
                    "
                    :options="networkTypeOptions"
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col v-if="physicalNetworkEnabled" :span="12">
              <Field
                name="providerPhysicalNetwork"
                v-model="networkForm.providerPhysicalNetwork"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  label="공급자 물리 네트워크"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    @update:value="handleChange"
                    @blur="handleBlur('providerPhysicalNetwork')"
                    v-model:value="networkForm.providerPhysicalNetwork"
                    placeholder="공급자 물리 네트워크를 선택해 주세요."
                  />
                </a-form-item>
              </Field>
            </a-col>
            <!--            <a-col v-if="segmentEnabled" :span="6">-->
            <!--              <Field-->
            <!--                name="providerSegmentationId"-->
            <!--                v-model="networkForm.providerSegmentationId"-->
            <!--                v-slot="{ handleChange, errorMessage }"-->
            <!--              >-->
            <!--                <a-form-item-->
            <!--                  label="세그먼트 ID"-->
            <!--                  :help="errorMessage"-->
            <!--                  :has-feedback="!!errorMessage"-->
            <!--                  :validate-status="errorMessage ? 'error' : undefined"-->
            <!--                >-->
            <!--                  <a-input-number-->
            <!--                    v-model:value="networkForm.providerSegmentationId"-->
            <!--                    @update:value="handleChange"-->
            <!--                    @blur="handleBlur('segmentId', 'number')"-->
            <!--                    @input="handleChange"-->
            <!--                    :min="0"-->
            <!--                    :placeholder="-->
            <!--                      t('message.placeholder.input-1', {-->
            <!--                        data: '세그먼트 ID',-->
            <!--                      })-->
            <!--                    "-->
            <!--                  />-->
            <!--                </a-form-item>-->
            <!--              </Field>-->
            <!--            </a-col>-->
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="mtu"
                v-model="networkForm.mtu"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  label="MTU"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="networkForm.mtu"
                    @update:value="handleChange"
                    @blur="handleBlur('mtu', 'number')"
                    @input="handleChange"
                    :min="68"
                    :default-value="68"
                    :placeholder="
                      t('message.placeholder.input-2', {
                        data: 'MTU',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="4">
              <a-form-item :label="'공유'">
                <a-switch v-model:checked="networkForm.shared" />
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item :label="'외부 라우팅'">
                <a-switch v-model:checked="networkForm.routerExternal" />
              </a-form-item>
            </a-col>
            <a-col :span="4">
              <a-form-item :label="'포트 보안'">
                <a-switch v-model:checked="networkForm.portSecurityEnabled" />
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
import { NetworkCreateType } from '@/types/network/network/NetworkCreateType';
import { createNetwork } from '@/axios/network-service/NetworkApi';
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

const classification = ref<string>('public');

const networkTypeOptions = ref<SelectProps['options']>([
  // {
  //   value: 'local',
  //   label: '로컬',
  // },
  {
    value: 'flat',
    label: 'Flat',
  },
  {
    value: 'vlan',
    label: 'VLAN',
  },
  // {
  //   value: 'gre',
  //   label: 'GRE',
  // },
  {
    value: 'vxlan',
    label: 'VXLAN',
  },
  // {
  //   value: 'geneve',
  //   label: 'Geneve',
  // },
]);

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
    networkForm.value.projectId = providerStore.getSelectedProjectId;
  } else {
    networkForm.value.projectId = undefined;
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

const networkForm = ref<NetworkCreateType>({
  name: '',
  description: '',
  projectId: '',
  providerNetworkType: undefined,
  providerPhysicalNetwork: undefined,
  // providerSegmentationId: undefined,
  shared: false,
  routerExternal: false,
  portSecurityEnabled: true,
  mtu: 68,
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
  providerNetworkType: { conSelectRequired: '공급자 네트워크 타입' },
  providerPhysicalNetwork: {},
  // providerSegmentationId: {},
  mtu: {
    conInputNotBlank: String,
    conInputOnlyNaturalNumber: String,
    conInputGreaterThanOrEqualTo: 68,
  },
});

const providerNetworkType = ref<string | undefined>(undefined);
const physicalNetworkEnabled = ref<boolean>(false);
// const segmentEnabled = ref<boolean>(false);

watch(classification, () => {
  if (classification.value === 'project') {
    validationSchema.value.providerNetworkType = {};
    providerNetworkType.value = undefined;
    networkForm.value.providerNetworkType = undefined;
  } else {
    validationSchema.value.providerNetworkType = {
      conSelectRequired: '공급자 네트워크 타입',
    };
  }
});

watch(providerNetworkType, () => {
  networkForm.value.providerNetworkType = providerNetworkType.value;
  physicalNetworkEnabled.value =
    providerNetworkType.value === 'flat' ||
    providerNetworkType.value === 'vlan' ||
    providerNetworkType.value === 'gre';
  networkForm.value.providerPhysicalNetwork = undefined;
  if (physicalNetworkEnabled.value) {
    validationSchema.value.providerPhysicalNetwork = {
      conInputRequired: '공급자 물리 네트워크',
    };
    setValidateFieldError('providerPhysicalNetwork', undefined);
  } else {
    validationSchema.value.providerPhysicalNetwork = {};
  }
  // segmentEnabled.value =
  //   providerNetworkType.value === 'vxlan' ||
  //   providerNetworkType.value === 'vlan' ||
  //   providerNetworkType.value === 'gre';
  // if (segmentEnabled.value) {
  //   networkForm.value.providerSegmentationId = undefined;
  //   let segmentIdRange = [1, 4094];
  //   if (providerNetworkType.value === 'vxlan') {
  //     segmentIdRange = [1, 16777215];
  //   } else if (providerNetworkType.value === 'gre') {
  //     segmentIdRange = [1, 4294967295];
  //   }
  //   validationSchema.value.providerSegmentationId = {
  //     conInputNotBlank: String,
  //     conInputOnlyNaturalNumber: String,
  //     conInputBetween: segmentIdRange,
  //   };
  // } else {
  //   validationSchema.value.providerSegmentationId = {};
  // }
});

const checkValid = () => {
  // invalid submit
};

const handleProjectChange = (e: any) => {
  networkForm.value.projectId = e;
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

// 자원 생성 : 네트워크 생성
const createResource = () => {
  createNetwork(networkForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.network'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.network'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      router.go(-1);
      // goToPageByName(router, 'network list');
    });
};

onMounted(() => {
  getAvailabilityZoneHintResourceList();
  getProjectResourceList();
  setProjectSelection();
});
</script>
<style lang="scss" scoped></style>
