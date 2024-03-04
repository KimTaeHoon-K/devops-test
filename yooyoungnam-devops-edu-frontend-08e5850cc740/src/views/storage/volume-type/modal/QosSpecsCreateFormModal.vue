<template>
  <div class="modal">
    <a-modal
      :visible="showModal"
      :title="title"
      :okText="t('common.content.action.create')"
      @ok="handleFormModalSubmit"
      :cancelText="t('common.content.action.cancel')"
      @cancel="handleFormModalCancel"
      centered
    >
      <Form :validation-schema="validationSchema" ref="createForm">
        <a-form
          class="form"
          name="basic"
          :model="qosSpecsForm.name"
          layout="vertical"
        >
          <Field
            name="name"
            v-model="qosSpecsForm.name"
            v-slot="{ nameValue, handleChange, errorMessage }"
          >
            <a-form-item
              :label="t('common.column.name')"
              :rules="[{ required: true }]"
              :help="errorMessage"
              :has-feedback="!!errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
            >
              <a-input
                :value="nameValue"
                @update:value="handleChange"
                @blur="handleChange"
                @input="nameValue = $event.target.value"
                :placeholder="
                  t('message.placeholder.input-1', {
                    data: t('common.column.resource-name', {
                      data: t('common.content.qos'),
                    }),
                  })
                "
              />
            </a-form-item>
          </Field>
          <Field
            name="consumer"
            v-model="qosSpecsForm.consumer"
            v-slot="{ handleChange, errorMessage }"
          >
            <a-form-item
              label="적용 대상"
              :rules="[{ required: true }]"
              :help="errorMessage"
              :has-feedback="!!errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
              style="width: 100%"
            >
              <a-select
                v-model:value="qosSpecsForm.consumer"
                placeholder="적용 대상을 선택해 주세요."
                style="width: 100%"
                :options="consumerOptions"
                @update:value="handleChange"
              ></a-select>
            </a-form-item>
          </Field>
        </a-form>
      </Form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { defineEmits, defineProps, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { SelectProps } from 'ant-design-vue';
import { Field, Form, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { QosSpecsCreateType } from '@/types/storage/volume-type/QosSpecsCreateType';
import { createQosSpecs } from '@/axios/storage-service/VolumeTypeApi';
import { openNotification } from '@/utils/CommonUtil';

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const emit = defineEmits({});

defineProps({
  showModal: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
});

const consumerOptions = ref<SelectProps['options']>([
  {
    value: 'front-end',
    label: 'Front End',
  },
  {
    value: 'back-end',
    label: 'Back End',
  },
  {
    value: 'both',
    label: 'Both',
  },
]);

const validationSchema = {
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  consumer: { conSelectRequired: '적용 대상' },
};
let createForm: any = useForm();

const qosSpecsForm = ref<QosSpecsCreateType>({
  name: '',
  consumer: undefined,
});

const handleFormModalSubmit = () => {
  createForm.validate().then((res: any) => {
    if (res.valid) {
      handleFormModalOk();
    } else {
      return;
    }
  });
};

const handleFormModalOk = () => {
  createQosSpecs(qosSpecsForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.qos-specs'),
        }),
        'color: #0068ff'
      );
      emit('update:isSucceed', true);
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.qos-specs'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      emit('update:modelValue', false);
    });
};

const handleFormModalCancel = () => {
  emit('update:modelValue', false);
  emit('cancelMethod', 'create');
};
</script>
<style lang="scss" scoped></style>
