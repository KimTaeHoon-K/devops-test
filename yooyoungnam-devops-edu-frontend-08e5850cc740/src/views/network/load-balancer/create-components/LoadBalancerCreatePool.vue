<template>
  <a-form class="form" name="basic" layout="vertical">
    <div class="head-title-wrapper">
      <h3 class="heading-sub-title">
        {{ t('message.create.step-info.load-balancer.pool.title') }}
      </h3>
      <p class="description">
        {{ t('message.create.step-info.load-balancer.pool.description') }}
      </p>
    </div>
    <a-row class="form-row" :gutter="12">
      <a-col :span="12">
        <Field
          name="name"
          v-model="emitsPoolInfo.name"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="t('common.column.name')"
            :rules="[{ required: true }]"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input
              :value="emitsPoolInfo.name"
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
          v-model="emitsPoolInfo.description"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="t('common.column.description')"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input
              v-model:value="emitsPoolInfo.description"
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
          name="algorithm"
          v-model="emitsPoolInfo.algorithm"
          v-slot="{ errorMessage }"
        >
          <a-form-item
            :label="'알고리즘'"
            :rules="[{ required: true }]"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-select
              v-model:value="emitsPoolInfo.algorithm"
              style="width: 100%"
              :options="algorithmOptions"
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="12">
        <Field
          name="sessionPersistence"
          v-model="emitsPoolInfo.sessionPersistence"
          v-slot="{ errorMessage }"
        >
          <a-form-item
            :label="'세션 저항 상태'"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-select
              v-model:value="emitsPoolInfo.sessionPersistence"
              style="width: 100%"
              :options="sessionPersistenceOptions"
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="12">
        <Field name="tls" v-model="emitsPoolInfo.tls">
          <a-form-item :label="'TLS 설정'">
            <a-switch v-model:checked="emitsPoolInfo.tls" />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="12">
        <Field name="adminStateUp" v-model="emitsPoolInfo.adminStateUp">
          <a-form-item :label="'Admin 관리 상태'">
            <a-switch v-model:checked="emitsPoolInfo.adminStateUp" />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
  </a-form>
</template>

<script lang="ts" setup>
import {
  defineEmits,
  defineProps,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { Field } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { PoolInfoType } from '@/types/network/load-balancer/LoadBalancerCreateType';
import { SelectProps } from 'ant-design-vue';

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  poolInfo: {
    type: Object as () => PoolInfoType,
    required: true,
  },
  isCheckValid: {
    type: Boolean,
    default: false,
  },
  listenerProtocol: {
    type: String,
    required: true,
  },
});

watch(props, () => {
  if (props.listenerProtocol) {
    emitsPoolInfo.value.protocol = props.listenerProtocol;
  }
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const initData = () => {
  if (props.isCheckValid) {
    emitsPoolInfo.value = {
      name: props.poolInfo?.name,
      description: props.poolInfo?.description,
      protocol: props.listenerProtocol,
      algorithm: props.poolInfo?.algorithm,
      sessionPersistence: props.poolInfo?.sessionPersistence,
      tls: props.poolInfo?.tls,
      adminStateUp: props.poolInfo?.adminStateUp,
    };
  }
};

const emits = defineEmits(['update:poolInfo', 'update:isCheckValid']);
const emitsPoolInfo = ref<PoolInfoType>({
  name: '',
  description: '',
  protocol: props.listenerProtocol,
  algorithm: 'LEAST_CONNECTIONS',
  sessionPersistence: 'None',
  tls: false,
  adminStateUp: true,
});

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

const algorithmOptions = ref<SelectProps['options']>([
  {
    value: 'LEAST_CONNECTIONS',
    label: 'LEAST_CONNECTIONS',
  },
  {
    value: 'ROUND_ROBIN',
    label: 'ROUND_ROBIN',
  },
  {
    value: 'SOURCE_IP',
    label: 'SOURCE_IP',
  },
]);

const sessionPersistenceOptions = ref<SelectProps['options']>([
  {
    value: 'None',
    label: 'None',
  },
  {
    value: 'SOURCE_IP',
    label: 'SOURCE_IP',
  },
  {
    value: 'HTTP_COOKIE',
    label: 'HTTP_COOKIE',
  },
  {
    value: 'APP_COOKIE',
    label: 'APP_COOKIE',
  },
]);

onMounted(() => {
  initData();
});

onUnmounted(() => {
  if (emitsPoolInfo.value.sessionPersistence === 'None') {
    emitsPoolInfo.value.sessionPersistence = undefined;
  }
  emits('update:poolInfo', emitsPoolInfo.value);
  emits('update:isCheckValid', true);
});
</script>

<style lang="scss" scoped></style>
