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
                name="protocol"
                v-model="protocol"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="'프로토콜'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                  style="width: 100%"
                >
                  <a-select
                    v-model:value="protocol"
                    style="width: 100%"
                    :placeholder="
                      t('message.placeholder.select-1', {
                        data: '프로토콜',
                      })
                    "
                    :options="protocolOptions"
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field
                name="description"
                v-model="securityGroupRuleForm.description"
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
                name="direction"
                v-model="securityGroupRuleForm.direction"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="'경로'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                  style="width: 100%"
                >
                  <a-select
                    v-model:value="securityGroupRuleForm.direction"
                    style="width: 100%"
                    :placeholder="
                      t('message.placeholder.select-1', {
                        data: '경로',
                      })
                    "
                    :options="directionOptions"
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <a-form-item
                :label="'이더 타입'"
                :rules="[{ required: true }]"
                style="width: 100%"
              >
                <a-input :value="securityGroupRuleForm.ethertype" disabled />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <a-form-item :label="'포트 타입'" :rules="[{ required: true }]">
                <a-radio-group v-model:value="portTypeRadio">
                  <a-radio :value="'normal'">모든 포트</a-radio>
                  <a-radio :value="'custom'">지정 포트</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="portTypeRadio === 'custom'">
              <Field
                name="portRange"
                v-model="securityGroupRuleForm.portRangeMax"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'포트 지정'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    v-model:value="securityGroupRuleForm.portRangeMax"
                    @blur="handleChange"
                    @input="handleChange"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: t('common.column.port'),
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <a-form-item :label="'원격 타입'" :rules="[{ required: true }]">
                <a-radio-group v-model:value="remoteTypeRadio">
                  <a-radio :value="'cidr'">CIDR</a-radio>
                  <a-radio :value="'securityGroup'">보안 그룹</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col v-if="remoteTypeRadio === 'cidr'" :span="12">
              <Field
                name="remoteIpPrefix"
                v-model="securityGroupRuleForm.remoteIpPrefix"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'원격 IP'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    v-model:value="securityGroupRuleForm.remoteIpPrefix"
                    @blur="handleChange"
                    @input="handleChange"
                    :placeholder="
                      t('message.placeholder.input-2', {
                        data: t('common.column.remote-ip-prefix'),
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col v-else-if="remoteTypeRadio === 'securityGroup'" :span="12">
              <Field
                name="securityGroupId"
                v-model="securityGroupRuleForm.securityGroupId"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'보안 그룹'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-select
                    v-model:value="securityGroupRuleForm.securityGroupId"
                    style="width: 100%"
                    :placeholder="
                      t('message.placeholder.select-1', {
                        data: t('common.content.security-group'),
                      })
                    "
                    @update:value="handleChange"
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
import { Field, Form, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { goToPageByName } from '@/utils/RouterUtil';
import { openNotification } from '@/utils/CommonUtil';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import {
  createSecurityGroupRule,
  getSecurityGroupList,
} from '@/axios/network-service/SecurityGroupApi';
import { SecurityGroupRuleCreateType } from '@/types/network/security-group/security-group-rule/SecurityGroupRuleCreateType';
import { SecurityGroupType } from '@/types/network/security-group/SecurityGroupListType';
import { SizeConst } from '@/types/common/constant/SizeConst';

// TODO: 생성 중 프로젝트 변경 하면 안되지 않나..?
const providerStore = ProviderStore();
watch(providerStore, () => {
  goToPageByName(router, 'security group');
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

//   None,
//   ah
//   dccp
//   egp
//   esp
//   gre
//   hopopt
//   icmp
//   igmp
//   ip
//   ipip
//   ipv6-encap
//   ipv6-frag
//   ipv6-icmp
//   icmpv6
//   ipv6-nonxt
//   ipv6-opts
//   ipv6-route
//   ospf
//   pgm
//   rsvp
//   sctp
//   tcp
//   udp
//   udplite
//   vrrp
//   integer representations [0 to 255]
const protocol = ref<string | undefined>(undefined);
const protocolOptions = ref<SelectProps['options']>([
  {
    value: 'any',
    label: 'Any',
  },
  {
    value: 'tcp',
    label: 'TCP',
  },
  {
    value: 'udp',
    label: 'UDP',
  },
  {
    value: 'icmp',
    label: 'ICMP',
  },
]);

const directionOptions = ref<SelectProps['options']>([
  {
    value: 'ingress',
    label: 'Ingress',
  },
  {
    value: 'egress',
    label: 'Egress',
  },
]);

const portTypeRadio = ref<string>('normal');
const remoteTypeRadio = ref<string>('cidr');

// 자원 목록 조회 : 보안 그룹 목록 조회
const securityGroupOptions = ref<SecurityGroupType[]>([]);
const getSecurityGroupResourceList = () => {
  getSecurityGroupList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        securityGroupOptions.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

const securityGroupRuleForm = ref<SecurityGroupRuleCreateType>({
  ethertype: 'IPv4',
  direction: undefined,
  protocol: undefined,
  description: '',
  tenantId: '',
  securityGroupId: undefined,
  portRangeMin: undefined,
  portRangeMax: undefined,
  remoteIpPrefix: undefined,
  remoteAddressGroupId: '',
  normalizedCidr: '',
  remoteGroupId: '',
  projectId: '',
});

let createForm: any = useForm();
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  protocol: { conSelectRequired: '프로토콜' },
  description: { conInputMaxText: 40 },
  direction: { conSelectRequired: '경로' },
  portRange: {},
  remoteIpPrefix: { conInputRequired: '원격 IP', conInputIpv4Cidr: String },
  securityGroupId: {},
});

watch([portTypeRadio, remoteTypeRadio], () => {
  if (portTypeRadio.value === 'normal') {
    validationSchema.value.portRange = {};
    securityGroupRuleForm.value.portRangeMax = undefined;
  } else if (portTypeRadio.value === 'custom') {
    validationSchema.value.portRange = { conInputRequired: '지정 포트' };
  }

  if (remoteTypeRadio.value === 'cidr') {
    validationSchema.value.remoteIpPrefix = {
      conInputRequired: '원격 IP',
      conInputIpv4Cidr: String,
    };
    securityGroupRuleForm.value.securityGroupId = undefined;
    validationSchema.value.securityGroupId = {};
  } else if (remoteTypeRadio.value === 'securityGroup') {
    securityGroupRuleForm.value.remoteIpPrefix = undefined;
    validationSchema.value.remoteIpPrefix = {};
    validationSchema.value.securityGroupId = { conSelectRequired: '보안 그룹' };
  }
});

const checkValid = () => {
  // invalid submit
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

// 자원 생성 : 보안 규칙 생성
const createResource = () => {
  if (protocol.value === 'any') {
    securityGroupRuleForm.value.protocol = undefined;
  }
  createSecurityGroupRule(securityGroupRuleForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.security-rule'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.security-rule'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByName(router, 'security group detail');
    });
};

onMounted(() => {
  getSecurityGroupResourceList();
});
</script>
<style lang="scss" scoped></style>
