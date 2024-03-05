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
                v-model="listenerForm.name"
                v-slot="{ handleChange, errorMessage }"
                name="name"
              >
                <a-form-item
                  :label="t('common.column.name')"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    :value="listenerForm.name"
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
                v-model="listenerForm.description"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.description')"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    v-model:value="listenerForm.description"
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
                name="protocol"
                v-model="listenerForm.protocol"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="'리스너 프로토콜'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-select
                    v-model:value="listenerForm.protocol"
                    style="width: 100%"
                    :options="protocolOptions"
                    @change="handleProtocolChange"
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field name="adminStateUp" v-model="listenerForm.adminStateUp">
                <a-form-item :label="'Admin 관리 상태'">
                  <a-switch v-model:checked="listenerForm.adminStateUp" />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="protocolPort"
                v-model="listenerForm.protocolPort"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'리스너 프로토콜 포트'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="listenerForm.protocolPort"
                    @blur="handleChange"
                    @input="handleChange"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: '리스너 프로토콜 포트',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field
                name="connectionLimit"
                v-model="listenerForm.connectionLimit"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'리스너 연결 제한'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="listenerForm.connectionLimit"
                    @blur="handleChange"
                    @input="handleChange"
                    :default-value="-1"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: '리스너 연결 제한',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row
            v-if="
              listenerForm.protocol === 'HTTP' ||
              listenerForm.protocol === 'HTTPS' ||
              listenerForm.protocol === 'TCP'
            "
            class="form-row"
            :gutter="12"
          >
            <a-col :span="12">
              <Field
                name="timeoutClientData"
                v-model="listenerForm.timeoutClientData"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'클라이언트 데이터 제한 시간'"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="listenerForm.timeoutClientData"
                    @blur="handleChange"
                    @input="handleChange"
                    :default-value="50000"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: '클라이언트 데이터 제한 시간',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field
                name="timeoutTcpInspect"
                v-model="listenerForm.timeoutTcpInspect"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'TCP 검사 제한 시간'"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="listenerForm.timeoutTcpInspect"
                    @blur="handleChange"
                    @input="handleChange"
                    :default-value="0"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: 'TCP 검사 제한 시간',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row
            v-if="
              listenerForm.protocol === 'HTTP' ||
              listenerForm.protocol === 'HTTPS' ||
              listenerForm.protocol === 'TCP'
            "
            class="form-row"
            :gutter="12"
          >
            <a-col :span="12">
              <Field
                name="timeoutMemberConnect"
                v-model="listenerForm.timeoutMemberConnect"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'멤버 연결 제한 시간'"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="listenerForm.timeoutMemberConnect"
                    @blur="handleChange"
                    @input="handleChange"
                    :default-value="5000"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: '멤버 연결 제한 시간',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field
                name="timeoutMemberData"
                v-model="listenerForm.timeoutMemberData"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'멤버 데이터 제한 시간'"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="listenerForm.timeoutMemberData"
                    @blur="handleChange"
                    @input="handleChange"
                    :default-value="50000"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: '멤버 데이터 제한 시간',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="24">
              <Field
                v-model="allowedCidrs"
                v-slot="{ handleChange, errorMessage }"
                name="allowedCidrs"
              >
                <a-form-item
                  :label="'허용 CIDR'"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    :value="allowedCidrs"
                    @update:value="handleChange"
                    @blur="handleChange"
                    placeholder="0.0.0.0/0"
                  />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row
            v-if="listenerForm.protocol === 'HTTP'"
            class="form-row"
            :gutter="12"
          >
            <a-col :span="24">
              <a-form-item :label="'헤더 삽입'">
                <a-checkbox-group
                  class="vertical-type"
                  v-model:value="headerCheckedList"
                  :options="headerOptions"
                />
              </a-form-item>
            </a-col>
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Field, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { SelectProps } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import { ListenerCreateType } from '@/types/network/load-balancer/listener/ListenerCreateType';
import { openNotification } from '@/utils/CommonUtil';
import { goToPageByName } from '@/utils/RouterUtil';
import { createListener } from '@/axios/network-service/ListenerApi';
import Breadcrumb from '@/components/Breadcrumb.vue';
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

const headerCheckedList = ref<string[]>([]);
const headerOptions = [
  'X-Forwarded-For',
  'X-Forwarded-Port',
  'X-Forwarded-Proto',
];

const allowedCidrs = ref<string>();
const listenerForm = ref<ListenerCreateType>({
  loadbalancerId: loadBalancerId,
  name: '',
  description: '',
  protocol: 'HTTP',
  adminStateUp: true,
  protocolPort: 80,
  connectionLimit: -1,
  timeoutClientData: 50000,
  timeoutTcpInspect: 0,
  timeoutMemberConnect: 5000,
  timeoutMemberData: 50000,
  allowedCidrs: undefined,
  insertHeaders: undefined,
});

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
const handleProtocolChange = (e: any) => {
  if (e === 'HTTP') {
    listenerForm.value.protocolPort = 80;
  } else {
    listenerForm.value.protocolPort = undefined;
  }
};

let createForm: any = useForm();
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.resource-name', {
      data: t('common.content.listener'),
    }),
  },
  description: { conInputMaxText: 40 },
  protocolPort: {
    conInputRequired: '리스너 프로토콜 포트',
    conInputOnlyNaturalNumber: String,
  },
  connectionLimit: {
    conInputRequired: '리스너 연결 제한',
    // conInputOnlyNaturalNumber: String,
  },
  timeoutClientData: { conInputOnlyNaturalNumber: String },
  timeoutTcpInspect: { conInputOnlyNaturalNumber: String },
  timeoutMemberConnect: { conInputOnlyNaturalNumber: String },
  timeoutMemberData: { conInputOnlyNaturalNumber: String },
  allowedCidrs: { conInputIpv4Cidr: String },
});

const checkValid = () => {
  // invalid submit
};

// 자원 생성 : 서브넷 생성
const createResource = () => {
  if (allowedCidrs.value) {
    listenerForm.value.allowedCidrs = [allowedCidrs.value];
  }
  let headersObj = {} as any;
  headerCheckedList.value.map((header: string) => {
    headersObj[header] = 'true';
  });
  listenerForm.value.insertHeaders = headersObj;
  createListener(listenerForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.listener'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.listener'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByName(router, 'load-balancer detail', { id: loadBalancerId });
    });
};
</script>
<style lang="scss" scoped></style>
