<template>
  <a-form class="form" name="basic" layout="vertical">
    <div class="head-title-wrapper">
      <h3 class="heading-sub-title">
        {{ t('message.create.step-info.load-balancer.health-check.title') }}
      </h3>
      <p class="description">
        {{
          t('message.create.step-info.load-balancer.health-check.description')
        }}
      </p>
    </div>
    <a-row class="form-row" :gutter="12">
      <a-col :span="24">
        <Field
          name="name"
          v-model="emitsHealthCheckInfo.name"
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
              :value="emitsHealthCheckInfo.name"
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
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="12">
        <a-form-item :label="'유형'" :rules="[{ required: true }]">
          <a-input :value="props.listenerProtocol" disabled />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <Field name="adminStateUp" v-model="emitsHealthCheckInfo.adminStateUp">
          <a-form-item :label="'Admin 관리 상태'">
            <a-switch v-model:checked="emitsHealthCheckInfo.adminStateUp" />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="12">
        <Field
          name="maxRetries"
          v-model="emitsHealthCheckInfo.maxRetries"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="'Max Retries'"
            :rules="[{ required: true }]"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input-number
              v-model:value="emitsHealthCheckInfo.maxRetries"
              @update:value="handleChange"
              @blur="handleChange"
              :min="0"
              :placeholder="
                t('message.placeholder.input-1', {
                  data: 'Max Retries',
                })
              "
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="12">
        <Field
          name="maxRetriesDown"
          v-model="emitsHealthCheckInfo.maxRetriesDown"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="'Max Retries Down'"
            :rules="[{ required: true }]"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input-number
              v-model:value="emitsHealthCheckInfo.maxRetriesDown"
              @update:value="handleChange"
              @blur="handleChange"
              :min="0"
              :placeholder="
                t('message.placeholder.input-1', {
                  data: 'Max Retries Down',
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
          name="delay"
          v-model="emitsHealthCheckInfo.delay"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="'딜레이 (sec)'"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input-number
              v-model:value="emitsHealthCheckInfo.delay"
              @update:value="handleChange"
              @blur="handleChange"
              :min="0"
              :default-value="50000"
              :placeholder="
                t('message.placeholder.input-1', {
                  data: '딜레이',
                })
              "
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="12">
        <Field
          name="timeout"
          v-model="emitsHealthCheckInfo.timeout"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="'타임 아웃 (sec)'"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input-number
              v-model:value="emitsHealthCheckInfo.timeout"
              @update:value="handleTimeoutChange"
              @blur="handleChange"
              :min="0"
              :default-value="0"
              :placeholder="
                t('message.placeholder.input-1', {
                  data: '타임 아웃',
                })
              "
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
  </a-form>
</template>

<script lang="ts" setup>
import { defineEmits, defineProps, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { Field } from 'vee-validate';
import { HealthCheckInfoType } from '@/types/network/load-balancer/LoadBalancerCreateType';

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  healthCheckInfo: {
    type: Object as () => HealthCheckInfoType,
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

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const initData = () => {
  if (props.isCheckValid) {
    emitsHealthCheckInfo.value = {
      name: props.healthCheckInfo?.name,
      type: props.listenerProtocol,
      adminStateUp: props.healthCheckInfo?.adminStateUp,
      maxRetries: props.healthCheckInfo?.maxRetries,
      maxRetriesDown: props.healthCheckInfo?.maxRetriesDown,
      delay: props.healthCheckInfo?.delay,
      timeout: props.healthCheckInfo?.timeout,
    };
  }
};

const emits = defineEmits([
  'update:healthCheckInfo',
  'update:healthCheckTimeout',
  'update:isCheckValid',
]);
const emitsHealthCheckInfo = ref<HealthCheckInfoType>({
  name: '',
  type: props.listenerProtocol,
  adminStateUp: true,
  maxRetries: 3,
  maxRetriesDown: 3,
  delay: 5,
  timeout: 5,
});

const handleTimeoutChange = (e: any) => {
  emitsHealthCheckInfo.value.timeout = e;
  if (emitsHealthCheckInfo.value.delay < emitsHealthCheckInfo.value.timeout) {
    emitsHealthCheckInfo.value.delay = e;
  }
  emits('update:healthCheckTimeout', e);
  validateField('delay', emitsHealthCheckInfo.value.delay);
};

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

onMounted(() => {
  initData();
});

onUnmounted(() => {
  emits('update:healthCheckInfo', emitsHealthCheckInfo.value);
  emits('update:isCheckValid', true);
});
</script>

<style lang="scss" scoped></style>
