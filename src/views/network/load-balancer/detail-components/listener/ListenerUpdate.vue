<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header class="page-header" :title="t(route.meta?.title)" />
  <Form
    @submit="createResource"
    @invalid-submit="checkValid"
    :validation-schema="validationSchema"
    ref="updateForm"
  >
    <div class="contents">
      <a-card>
        <a-form class="form" name="basic" layout="vertical">
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                v-model="listenerUpdateForm.name"
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
                    :value="listenerUpdateForm.name"
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
                v-model="listenerUpdateForm.description"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.description')"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    v-model:value="listenerUpdateForm.description"
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
              <a-form-item
                :label="'리스너 프로토콜'"
                :rules="[{ required: true }]"
              >
                <a-input v-model:value="listenerUpdateForm.protocol" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <Field
                name="adminStateUp"
                v-model="listenerUpdateForm.adminStateUp"
              >
                <a-form-item :label="'Admin 관리 상태'">
                  <a-switch v-model:checked="listenerUpdateForm.adminStateUp" />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <a-form-item
                :label="'리스너 프로토콜 포트'"
                :rules="[{ required: true }]"
              >
                <a-input-number
                  v-model:value="listenerUpdateForm.protocolPort"
                  disabled
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <Field
                name="connectionLimit"
                v-model="listenerUpdateForm.connectionLimit"
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
                    v-model:value="listenerUpdateForm.connectionLimit"
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
              listenerUpdateForm.protocol === 'HTTP' ||
              listenerUpdateForm.protocol === 'HTTPS' ||
              listenerUpdateForm.protocol === 'TCP'
            "
            class="form-row"
            :gutter="12"
          >
            <a-col :span="12">
              <Field
                name="timeoutClientData"
                v-model="listenerUpdateForm.timeoutClientData"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'클라이언트 데이터 제한 시간'"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="listenerUpdateForm.timeoutClientData"
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
                v-model="listenerUpdateForm.timeoutTcpInspect"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'TCP 검사 제한 시간'"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="listenerUpdateForm.timeoutTcpInspect"
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
              listenerUpdateForm.protocol === 'HTTP' ||
              listenerUpdateForm.protocol === 'HTTPS' ||
              listenerUpdateForm.protocol === 'TCP'
            "
            class="form-row"
            :gutter="12"
          >
            <a-col :span="12">
              <Field
                name="timeoutMemberConnect"
                v-model="listenerUpdateForm.timeoutMemberConnect"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'멤버 연결 제한 시간'"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="listenerUpdateForm.timeoutMemberConnect"
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
                v-model="listenerUpdateForm.timeoutMemberData"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'멤버 데이터 제한 시간'"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="listenerUpdateForm.timeoutMemberData"
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
            v-if="listenerUpdateForm.protocol === 'HTTP'"
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
            t('common.content.action.edit')
          }}</a-button>
        </a-space>
      </div>
    </div>
  </Form>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Field, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { useRoute, useRouter } from 'vue-router';
import { openNotification } from '@/utils/CommonUtil';
import { goToPageByName } from '@/utils/RouterUtil';
import {
  getListenerDetail,
  updateListener,
} from '@/axios/network-service/ListenerApi';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { ListenerType } from '@/types/network/load-balancer/listener/ListenerListType';
import {
  ListenerUpdateFormType,
  ListenerUpdateType,
} from '@/types/network/load-balancer/listener/ListenerUpdateType';
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
const listenerId = route.params.listenerId as string;

const headerCheckedList = ref<string[]>([]);
const headerOptions = [
  'X-Forwarded-For',
  'X-Forwarded-Port',
  'X-Forwarded-Proto',
];

const allowedCidrs = ref<string>();
const listenerUpdateForm = ref<ListenerUpdateFormType>(
  {} as ListenerUpdateFormType
);
let updateForm: any = useForm();
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.resource-name', {
      data: t('common.content.listener'),
    }),
  },
  description: { conInputMaxText: 40 },
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

const isLoading = ref<boolean>(true);
const data = ref<ListenerType>({} as ListenerType);

const getResource = (id: string) => {
  getListenerDetail(id)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        listenerUpdateForm.value = {
          id: data.value.id,
          name: data.value.name,
          description: data.value.description,
          protocol: data.value.protocol,
          adminStateUp: data.value.adminStateUp,
          protocolPort: data.value.protocolPort,
          connectionLimit: data.value.connectionLimit,
          timeoutClientData: data.value.timeoutClientData,
          timeoutTcpInspect: data.value.timeoutTcpInspect,
          timeoutMemberConnect: data.value.timeoutMemberConnect,
          timeoutMemberData: data.value.timeoutMemberData,
        };
        if (data.value.allowedCidrs?.length > 0) {
          allowedCidrs.value = data.value.allowedCidrs[0];
        }
        if (data.value.insertHeaders?.length > 0) {
          headerCheckedList.value = Object.keys(data.value.insertHeaders);
        }
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

// 자원 수정 : 리스너 수정
const createResource = () => {
  if (allowedCidrs.value) {
    listenerUpdateForm.value.allowedCidrs = [allowedCidrs.value];
  }
  let headersObj = {} as any;
  headerCheckedList.value.map((header: string) => {
    headersObj[header] = 'true';
  });
  listenerUpdateForm.value.insertHeaders = headersObj;

  let listenerUpdateType = {
    listener: {} as ListenerUpdateFormType,
  } as ListenerUpdateType;
  listenerUpdateType.listener = listenerUpdateForm.value;
  updateListener(listenerId, listenerUpdateType)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.listener'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.listener'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByName(router, 'load-balancer detail', { id: loadBalancerId });
    });
};

const prevPath = ref<string>();
onMounted(async () => {
  await router.isReady();
  prevPath.value = router.options.history.state.back as string;
  getResource(listenerId);
});
</script>
<style lang="scss" scoped></style>
