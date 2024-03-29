<template>
  <div class="modal">
    <a-modal
      :visible="showModal"
      :title="title"
      :okText="'수정'"
      @ok="handleFormModalSubmit"
      :cancelText="'취소'"
      @cancel="handleFormModalCancel"
      centered
    >
      <Form :validation-schema="validationSchema" ref="updateForm">
        <a-form
          class="form"
          name="basic"
          :model="updateFormData"
          layout="vertical"
        >
          <Field
            name="name"
            v-model="updateFormData.name"
            v-slot="{ nameValue, handleChange, errorMessage }"
          >
            <a-form-item
              label="이름"
              :rules="[{ required: true }]"
              :help="errorMessage"
              :has-feedback="!!errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
            >
              <a-input
                :value="nameValue"
                :default-value="originData.name"
                @update:value="handleChange"
                @blur="handleChange"
                @input="nameValue = $event.target.value"
                :placeholder="'이름을 입력해 주세요.'"
                :disabled="nameDisabled"
              />
            </a-form-item>
          </Field>
          <Field
            v-if="descriptionUpdate"
            name="description"
            v-model="updateFormData.description"
            v-slot="{ descriptionValue, handleChange, errorMessage }"
          >
            <a-form-item
              :label="t('common.column.description')"
              :help="errorMessage"
              :has-feedback="!!errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
            >
              <a-input
                :value="descriptionValue"
                :default-value="originData.description"
                @update:value="handleChange"
                @blur="handleChange"
                @input="descriptionValue = $event.target.value"
                :placeholder="'설명을 입력해 주세요.'"
              />
            </a-form-item>
          </Field>
        </a-form>
      </Form>
      <slot />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
// 이름/설명 수정 폼 모달
import { defineEmits, defineProps, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Form, Field, useForm } from 'vee-validate';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true,
  },
  originData: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  nameDisabled: {
    type: Boolean,
    default: false,
  },
  descriptionUpdate: {
    type: Boolean,
    default: true,
  },
});

const validationSchema = {
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  description: { conInputMaxText: 40 },
};
let updateForm: any = useForm();

const updateFormData = ref<BasicUpdateFormType<any>>({
  originData: props.originData,
  name: props.originData.name,
  description: props.originData.description,
});

const emit = defineEmits({});

// TODO: 이미 30자 이상의 설명이 입력 되어 있던 데이터를 그대로 수정 하려고 했을 때 error message 노출.
const handleFormModalSubmit = () => {
  updateForm.setValues({
    name: updateFormData.value.name,
    description: updateFormData.value.description,
  });
  updateForm.validate().then((res: any) => {
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
  emit('updateMethod', updateFormData.value);
};

const handleFormModalCancel = () => {
  emit('update:modelValue', false);
};
</script>
<style lang="scss" scoped></style>
