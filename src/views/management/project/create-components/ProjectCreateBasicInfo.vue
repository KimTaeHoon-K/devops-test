<template>
  <a-form class="form" name="basic" layout="vertical">
    <div class="head-title-wrapper">
      <h3 class="heading-sub-title">
        {{ t('message.create.step-info.basic-info.title') }}
      </h3>
      <p class="description">
        {{ t('message.create.step-info.basic-info.description.project') }}
      </p>
    </div>
    <a-row class="form-row" :gutter="12">
      <a-col :span="24">
        <Field
          v-model="emitsProjectBasicInfo.name"
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
              :value="emitsProjectBasicInfo.name"
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
      <a-col :span="24">
        <Field
          name="description"
          v-model="emitsProjectBasicInfo.description"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="t('common.column.description')"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input
              v-model:value="emitsProjectBasicInfo.description"
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
    <!--    <a-row class="form-row" :gutter="12">-->
    <!--      <a-col :span="12">-->
    <!--        <Field name="adminStateUp" v-model="emitsProjectBasicInfo.enabled">-->
    <!--          <a-form-item :label="'활성화'">-->
    <!--            <a-switch v-model:checked="emitsProjectBasicInfo.enabled" />-->
    <!--          </a-form-item>-->
    <!--        </Field>-->
    <!--      </a-col>-->
    <!--    </a-row>-->
  </a-form>
</template>

<script lang="ts" setup>
import { defineEmits, defineProps, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Field } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { ProjectBasicInfoType } from '@/types/identity/project/ProjectCreateType';

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  basicInfo: {
    type: Object as () => ProjectBasicInfoType,
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
    emitsProjectBasicInfo.value = {
      name: props.basicInfo?.name,
      description: props.basicInfo?.description,
      enabled: props.basicInfo?.enabled,
    };
  }
};

const emits = defineEmits(['update:basicInfo', 'update:isCheckValid']);
const emitsProjectBasicInfo = ref<ProjectBasicInfoType>({
  name: '',
  description: '',
  enabled: true,
});

onMounted(() => {
  initData();
});

onUnmounted(() => {
  emits('update:basicInfo', emitsProjectBasicInfo.value);
  emits('update:isCheckValid', true);
});
</script>

<style lang="scss" scoped></style>
