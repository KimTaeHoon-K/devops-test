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
          name="key"
          :model="createFormData.key"
          layout="vertical"
        >
          <Field
            name="key"
            v-model="createFormData.key"
            v-slot="{ keyValue, handleChange, errorMessage }"
          >
            <a-form-item
              :label="'Key'"
              :rules="[{ required: true }]"
              :help="errorMessage"
              :has-feedback="!!errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
            >
              <a-input
                :value="keyValue"
                @update:value="handleChange"
                @blur="handleChange"
                @input="keyValue = $event.target.value"
                :placeholder="
                  t('message.placeholder.input-2', {
                    data: 'Key',
                  })
                "
              />
            </a-form-item>
          </Field>
          <Field
            name="value"
            v-model="createFormData.value"
            v-slot="{ valueValue, handleChange, errorMessage }"
          >
            <a-form-item
              :label="'Value'"
              :rules="[{ required: true }]"
              :help="errorMessage"
              :has-feedback="!!errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
            >
              <a-input
                :value="valueValue"
                @update:value="handleChange"
                @blur="handleChange"
                @input="valueValue = $event.target.value"
                :placeholder="
                  t('message.placeholder.input-2', {
                    data: 'Value',
                  })
                "
              />
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
import { Field, Form, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { MetadataCreateFormType } from '@/types/common/MetadataCreateFormType';

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const emit = defineEmits({});

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
});

const validationSchema = {
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  key: { conInputRequired: 'Key' },
  value: { conInputRequired: 'Value' },
};
let createForm: any = useForm();

const createFormData = ref<MetadataCreateFormType>({
  key: '',
  value: '',
});

const handleFormModalSubmit = () => {
  createForm.setValues({
    key: createFormData.value.key,
    value: createFormData.value.value,
  });
  createForm.validate().then((res: any) => {
    if (res.valid) {
      handleFormModalOk();
    } else {
      return;
    }
  });
};

const handleFormModalOk = () => {
  emit('update:modelValue', false);
  // 이부분에 prop에 넘겨준 이벤트 이름으로 설정
  emit('createMethod', createFormData.value);
};

const handleFormModalCancel = () => {
  emit('update:modelValue', false);
};
</script>
<style lang="scss" scoped></style>
