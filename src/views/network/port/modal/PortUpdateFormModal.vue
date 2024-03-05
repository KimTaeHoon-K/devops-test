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
      width="700px"
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
              :label="t('common.column.name')"
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
              />
            </a-form-item>
          </Field>
          <Field
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
          <a-row class="form-row" :gutter="12">
            <a-col :span="24">
              <Field
                name="macAddress"
                v-model="updateFormData.macAddress"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'Mac Address 입력'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    v-model:value="updateFormData.macAddress"
                    :default-value="originData.macAddress"
                    @update:value="handleChange"
                    @blur="handleChange"
                    :placeholder="
                      t('message.placeholder.input-2', {
                        data: 'Mac Address',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <a-form-item :label="'포트 타입'" :rules="[{ required: true }]">
                <a-radio-group v-model:value="portTypeRadio">
                  <a-radio :value="'normal'">일반</a-radio>
                  <a-radio :value="'custom'">사용자 지정</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="portTypeRadio === 'custom'">
              <Field
                name="portType"
                v-model="portType"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="'포트 타입 선택'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-select
                    v-model:value="portType"
                    show-search
                    placeholder="포트 타입을 선택해 주세요."
                    style="width: 100%"
                    :options="portTypeOptions"
                  ></a-select>
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
        </a-form>
      </Form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Form, Field, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { SelectProps } from 'ant-design-vue';
import { PortType } from '@/types/network/port/PortType';
import { PortUpdateFormType } from '@/types/network/port/PortUpdateType';

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
    type: Object as () => PortType,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
});

const portTypeRadio = ref<string>('normal');
const portType = ref<string | undefined>(undefined);

const portTypeOptions = ref<SelectProps['options']>([
  {
    value: 'macvtap',
    label: 'macvtap',
  },
  {
    value: 'direct',
    label: 'direct',
  },
  {
    value: 'baremetal',
    label: 'baremetal',
  },
  {
    value: 'direct-physical',
    label: 'direct-physical',
  },
  {
    value: 'virtio-forwarder',
    label: 'virtio-forwarder',
  },
  {
    value: 'smart-nic',
    label: 'smart-nic',
  },
]);

const updateFormData = ref<PortUpdateFormType>({
  id: props.originData.id,
  name: props.originData.name,
  description: props.originData.description,
  macAddress: props.originData.macAddress,
  bindingVnicType: props.originData.bindingVnicType,
});

let updateForm: any = useForm();
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  description: { conInputMaxText: 40 },
  macAddress: {
    conInputRequired: 'Mac Address',
    conInputMacAddress: String,
  },
  portType: {},
});

watch([portTypeRadio], () => {
  if (portTypeRadio.value === 'normal') {
    portType.value = portTypeRadio.value;
    validationSchema.value.portType = {};
  } else {
    if (props.originData.bindingVnicType !== 'normal') {
      portType.value = props.originData.bindingVnicType;
    } else {
      portType.value = undefined;
    }
    validationSchema.value.portType = { conSelectRequired: '포트 타입' };
  }
});

const emit = defineEmits({});

// TODO: 이미 30자 이상의 설명이 입력 되어 있던 데이터를 그대로 수정 하려고 했을 때 error message 노출.
const handleFormModalSubmit = () => {
  if (portTypeRadio.value === 'normal') {
    updateFormData.value.bindingVnicType = portTypeRadio.value;
  } else if (portType.value) {
    updateFormData.value.bindingVnicType = portType.value;
  }
  // updateForm.setValues({
  //   name: updateFormData.value.name,
  //   description: updateFormData.value.description,
  //   macAddress: updateFormData.value.macAddress,
  //   bindingVnicType: updateFormData.value.bindingVnicType,
  // });
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
  emit('cancelMethod', 'create');
};

onMounted(() => {
  if (props.originData) {
    updateFormData.value = {
      id: props.originData.id,
      name: props.originData.name,
      description: props.originData.description,
      macAddress: props.originData.macAddress,
      bindingVnicType: props.originData.bindingVnicType,
    };
    if (props.originData.bindingVnicType !== 'normal') {
      portTypeRadio.value = 'custom';
      portType.value = props.originData.bindingVnicType;
    }
  }
});
</script>
<style lang="scss" scoped></style>
