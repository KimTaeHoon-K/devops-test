<template>
  <div class="modal">
    <a-modal
      :visible="showModal"
      :title="title"
      :okText="t('common.content.action.edit')"
      @ok="handleFormModalSubmit"
      :cancelText="t('common.content.action.cancel')"
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
            name="key"
            v-model="updateFormData.key"
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
                :default-value="originData.key"
                @update:value="handleChange"
                @blur="handleChange"
                @input="keyValue = $event.target.value"
                :placeholder="
                  t('message.placeholder.input-2', {
                    data: 'Key',
                  })
                "
                disabled
              />
            </a-form-item>
          </Field>
          <Field
            name="value"
            v-model="updateFormData.value"
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
                :default-value="originData.value"
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
          <slot />
        </a-form>
      </Form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { defineEmits, defineProps, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Form, Field, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { MetadataUpdateFormType } from '@/types/common/MetadataUpdateFormType';
import { MetadataType } from '@/types/common/MetadataType';

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
    type: Object as () => MetadataType,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
});

const validationSchema = {
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  value: { conInputRequired: 'Value' },
};
let updateForm: any = useForm();

const updateFormData = ref<MetadataUpdateFormType>({
  key: props.originData.key,
  value: props.originData.value,
});

const emit = defineEmits({});

const handleFormModalSubmit = () => {
  updateForm.setValues({
    key: updateFormData.value.key,
    value: updateFormData.value.value,
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
  emit('cancelMethod');
};
</script>
<style lang="scss" scoped></style>
