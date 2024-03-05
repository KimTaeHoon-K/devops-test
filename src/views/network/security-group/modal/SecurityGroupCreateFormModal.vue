<template>
  <div class="modal">
    <a-modal
      :visible="props.showModal"
      :title="props.title"
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
          :model="securityGroupForm.name"
          layout="vertical"
        >
          <Field
            name="name"
            v-model="securityGroupForm.name"
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
            name="description"
            v-model="securityGroupForm.description"
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
          <Field
            name="owner"
            v-model="securityGroupForm.projectId"
            v-slot="{ errorMessage }"
          >
            <a-form-item
              :label="'할당 프로젝트'"
              :rules="[{ required: true }]"
              :help="errorMessage"
              :has-feedback="!!errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
              style="width: 100%"
            >
              <a-select
                :value="securityGroupForm.projectId"
                style="width: 100%"
                :placeholder="
                  t('message.placeholder.select-2', {
                    data: t('common.content.project'),
                  })
                "
                @update:value="handleProjectChange"
                :loading="isProjectLoading"
                :disabled="projectOptionsDisabled"
              >
                <a-select-option
                  v-for="project in projectOptions"
                  v-bind:key="project"
                  :value="project.id"
                >
                  {{ project.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </Field>
        </a-form>
      </Form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { defineEmits, defineProps, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Field, Form, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { getProjectList } from '@/axios/identity-service/ProjectApi';
import { ProjectType } from '@/types/identity/project/ProjectListType';
import { SecurityGroupCreateType } from '@/types/network/security-group/SecurityGroupCreateType';
import { ProviderStore } from '@/stores/provider/ProviderStore';

const providerStore = ProviderStore();

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
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  description: { conInputMaxText: 40 },
  owner: { conSelectRequired: '할당 프로젝트' },
};
let createForm: any = useForm();

const securityGroupForm = ref<SecurityGroupCreateType>({
  name: '',
  description: '',
  projectId: undefined,
});

const isProjectLoading = ref<boolean>(true);
const projectOptionsDisabled = ref<boolean>();
const projectOptions = ref<ProjectType[]>([]);
const getResourceList = () => {
  getProjectList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        projectOptions.value = res.data.data;
        if (
          providerStore.isSelected &&
          !providerStore.getSelectedProjectId.includes('all')
        ) {
          securityGroupForm.value.projectId =
            providerStore.getSelectedProjectId;
          projectOptionsDisabled.value = true;
          setValidateFieldError('owner', undefined);
        }
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isProjectLoading.value = false;
    });
};

const setValidateFieldError = (field: string, error: string | undefined) => {
  createForm.validateField(field).then((res: any) => {
    if (!res.valid) {
      createForm.setFieldError(field, error);
    }
  });
};

const handleProjectChange = (e: any) => {
  securityGroupForm.value.projectId = e;
  createForm.validateField('owner').then();
};

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
  emit('update:modelValue', false);
  // 이부분에 prop에 넘겨준 이벤트 이름으로 설정
  emit('update:name', securityGroupForm.value.name);
  emit('update:description', securityGroupForm.value.description);
  emit('update:projectId', securityGroupForm.value.projectId);
  emit('createMethod');
};

const handleFormModalCancel = () => {
  emit('update:modelValue', false);
};

onMounted(() => {
  getResourceList();
});
</script>
<style lang="scss" scoped></style>
