<template>
  <a-form class="form" name="basic" layout="vertical">
    <div class="head-title-wrapper">
      <h3 class="heading-sub-title">
        {{ t('message.create.step-info.load-balancer.listener.title') }}
      </h3>
      <p class="description">
        {{ t('message.create.step-info.load-balancer.listener.description') }}
      </p>
    </div>
    <a-row class="form-row" :gutter="12">
      <a-col :span="12">
        <Field
          v-model="emitsListenerInfo.name"
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
              :value="emitsListenerInfo.name"
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
          v-model="emitsListenerInfo.description"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="t('common.column.description')"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input
              v-model:value="emitsListenerInfo.description"
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
          v-model="emitsListenerInfo.protocol"
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
              v-model:value="emitsListenerInfo.protocol"
              style="width: 100%"
              :options="protocolOptions"
              @change="handleProtocolChange"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="12">
        <Field name="adminStateUp" v-model="emitsListenerInfo.adminStateUp">
          <a-form-item :label="'Admin 관리 상태'">
            <a-switch v-model:checked="emitsListenerInfo.adminStateUp" />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="12">
        <Field
          name="protocolPort"
          v-model="emitsListenerInfo.protocolPort"
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
              v-model:value="emitsListenerInfo.protocolPort"
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
          v-model="emitsListenerInfo.connectionLimit"
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
              v-model:value="emitsListenerInfo.connectionLimit"
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
        emitsListenerInfo.protocol === 'HTTP' ||
        emitsListenerInfo.protocol === 'HTTPS' ||
        emitsListenerInfo.protocol === 'TCP'
      "
      class="form-row"
      :gutter="12"
    >
      <a-col :span="12">
        <Field
          name="timeoutClientData"
          v-model="emitsListenerInfo.timeoutClientData"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="'클라이언트 데이터 제한 시간'"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input-number
              v-model:value="emitsListenerInfo.timeoutClientData"
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
          v-model="emitsListenerInfo.timeoutTcpInspect"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="'TCP 검사 제한 시간'"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input-number
              v-model:value="emitsListenerInfo.timeoutTcpInspect"
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
        emitsListenerInfo.protocol === 'HTTP' ||
        emitsListenerInfo.protocol === 'HTTPS' ||
        emitsListenerInfo.protocol === 'TCP'
      "
      class="form-row"
      :gutter="12"
    >
      <a-col :span="12">
        <Field
          name="timeoutMemberConnect"
          v-model="emitsListenerInfo.timeoutMemberConnect"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="'멤버 연결 제한 시간'"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input-number
              v-model:value="emitsListenerInfo.timeoutMemberConnect"
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
          v-model="emitsListenerInfo.timeoutMemberData"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="'멤버 데이터 제한 시간'"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input-number
              v-model:value="emitsListenerInfo.timeoutMemberData"
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
          v-model="emitsListenerInfo.allowedCidrs"
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
              :value="emitsListenerInfo.allowedCidrs"
              @update:value="handleChange"
              @blur="handleChange"
              placeholder="0.0.0.0/0"
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row
      v-if="emitsListenerInfo.protocol === 'HTTP'"
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
</template>

<script lang="ts" setup>
import { defineEmits, defineProps, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Field } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { ListenerInfoType } from '@/types/network/load-balancer/LoadBalancerCreateType';
import { SelectProps } from 'ant-design-vue';

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  listenerInfo: {
    type: Object as () => ListenerInfoType,
    required: true,
  },
  isCheckValid: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const initData = () => {
  if (props.isCheckValid) {
    emitsListenerInfo.value = {
      name: props.listenerInfo?.name,
      description: props.listenerInfo?.description,
      protocol: props.listenerInfo?.protocol,
      adminStateUp: props.listenerInfo?.adminStateUp,
      protocolPort: props.listenerInfo?.protocolPort,
      connectionLimit: props.listenerInfo?.connectionLimit,
      timeoutClientData: props.listenerInfo?.timeoutClientData,
      timeoutTcpInspect: props.listenerInfo?.timeoutTcpInspect,
      timeoutMemberConnect: props.listenerInfo?.timeoutMemberConnect,
      timeoutMemberData: props.listenerInfo?.timeoutMemberData,
      allowedCidrs: props.listenerInfo?.allowedCidrs,
      insertHeaders: props.listenerInfo?.insertHeaders,
    };
    Object.keys(props.listenerInfo?.insertHeaders).map((key) => {
      headerCheckedList.value.push(key);
    });
  }
};

const headerCheckedList = ref<string[]>([]);
const headerOptions = [
  'X-Forwarded-For',
  'X-Forwarded-Port',
  'X-Forwarded-Proto',
];

const emits = defineEmits(['update:listenerInfo', 'update:isCheckValid']);
const emitsListenerInfo = ref<ListenerInfoType>({
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
  allowedCidrs: '',
  insertHeaders: undefined,
});
const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

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
    emitsListenerInfo.value.protocolPort = 80;
  } else {
    emitsListenerInfo.value.protocolPort = undefined;
  }
};

onMounted(() => {
  initData();
});

onUnmounted(() => {
  let headersObj = {} as any;
  headerCheckedList.value.map((header: string) => {
    headersObj[header] = 'true';
  });
  emitsListenerInfo.value.insertHeaders = headersObj;
  emits('update:listenerInfo', emitsListenerInfo.value);
  emits('update:isCheckValid', true);
});
</script>

<style lang="scss" scoped></style>
