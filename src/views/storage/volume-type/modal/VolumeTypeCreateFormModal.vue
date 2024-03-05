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
          :model="volumeTypeForm.name"
          layout="vertical"
        >
          <Field
            name="name"
            v-model="volumeTypeForm.name"
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
                      data: t('common.content.volume-type'),
                    }),
                  })
                "
              />
            </a-form-item>
          </Field>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <a-form-item :label="t('common.column.shared')">
                <a-switch v-model:checked="volumeTypeShared" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :label="t('common.column.public')">
                <a-switch v-model:checked="volumeTypeForm.is_public" />
              </a-form-item>
            </a-col>
          </a-row>
          <Field
            name="description"
            v-model="volumeTypeForm.description"
            v-slot="{ handleChange, errorMessage }"
          >
            <a-form-item
              :label="t('common.column.description')"
              :help="errorMessage"
              :has-feedback="!!errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
            >
              <a-input
                :value="volumeTypeForm.description"
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
import { VolumeTypeCreateType } from '@/types/storage/volume-type/VolumeTypeCreateType';
import { createVolumeType } from '@/axios/storage-service/VolumeTypeApi';
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

const validationSchema = {
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  description: { conInputMaxText: 40 },
};
let createForm: any = useForm();

const volumeTypeShared = ref<boolean>(false);
const volumeTypeForm = ref<VolumeTypeCreateType>({
  name: '',
  is_public: true, // TODO: 카멜 케이스
  description: '',
  extraSpecs: {},
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
  if (volumeTypeShared.value) {
    volumeTypeForm.value.extraSpecs = { multiattach: '<is> True' };
  }
  createVolumeType(volumeTypeForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.volume-type'),
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
          data: t('common.content.volume-type'),
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
