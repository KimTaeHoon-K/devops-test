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
          :model="createFormData.name"
          layout="vertical"
        >
          <Field
            v-if="props.nameInput"
            name="name"
            v-model="createFormData.name"
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
                    data: t('common.column.name'),
                  })
                "
              />
            </a-form-item>
          </Field>
          <Field
            v-if="props.descriptionInput"
            name="description"
            v-model="createFormData.description"
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
                @update:value="handleChange"
                @blur="handleChange"
                @input="descriptionValue = $event.target.value"
                :placeholder="
                  t('message.placeholder.input-1', {
                    data: t('common.column.description'),
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
import { BasicCreateFormType } from '@/types/common/BasicCreateFormType';

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const emit = defineEmits({});

const props = defineProps({
  nameInput: {
    type: Boolean,
    default: false,
  },
  descriptionInput: {
    type: Boolean,
    default: false,
  },
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
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  description: { conInputMaxText: 40 },
};
let createForm: any = useForm();

const createFormData = ref<BasicCreateFormType>({
  name: '',
  description: '',
});

const handleFormModalSubmit = () => {
  if (props.nameInput) {
    createForm.setFieldValue('name', createFormData.value.name);
  }
  if (props.descriptionInput) {
    createForm.setFieldValue('description', createFormData.value.description);
  }
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
  emit('update:name', createFormData.value.name);
  emit('update:description', createFormData.value.description);
  emit('createMethod');
};

const handleFormModalCancel = () => {
  emit('update:modelValue', false);
};
</script>
<style lang="scss" scoped></style>
