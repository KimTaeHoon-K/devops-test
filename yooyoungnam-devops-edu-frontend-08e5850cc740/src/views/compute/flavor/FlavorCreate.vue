<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header
    class="page-header"
    :title="t(route.meta?.title)"
  ></a-page-header>
  <Form
    @submit="createResource"
    :validation-schema="validationSchema"
    ref="createForm"
  >
    <div class="contents">
      <a-card>
        <a-form class="form" name="basic" :model="flavorForm" layout="vertical">
          <div class="head-title-wrapper">
            <h3 class="heading-sub-title">
              {{ t('message.create.step-info.basic-info.title') }}
            </h3>
          </div>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="name"
                v-model="flavorForm.name"
                v-slot="{ handleChange, errorMessage }"
              >
                <!-- :rules="[{ required: true }]" : label 필수 표시 위해 추가 -->
                <a-form-item
                  :label="t('common.column.name')"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    v-model:value="flavorForm.name"
                    @blur="handleChange"
                    @input="handleChange"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: t('common.column.name'),
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field
                name="description"
                v-model="flavorForm.description"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.description')"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    v-model:value="flavorForm.description"
                    @blur="handleChange"
                    @input="handleChange"
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
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="vcpus"
                v-model="numberValues.vcpus"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  label="vCPU (Core)"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="numberValues.vcpus"
                    @blur="handleBlur('vcpus', 'number')"
                    @input="handleChange"
                    :min="0"
                    :default-value="0"
                    :placeholder="
                      t('message.placeholder.input-2', {
                        data: 'vCPU',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field
                name="gibRam"
                v-model="numberValues.gibRam"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  label="Ram Size (GiB)"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="numberValues.gibRam"
                    @blur="handleBlur('gibRam', 'number')"
                    @input="handleChange"
                    :min="0"
                    :default-value="0"
                    :placeholder="
                      t('message.placeholder.input-2', {
                        data: 'Ram Size',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <Field
              name="disk"
              v-model="numberValues.disk"
              v-slot="{ handleChange, errorMessage }"
            >
              <a-col :span="24">
                <a-form-item
                  :label="`${t('common.column.root-disk')} (GiB)`"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="numberValues.disk"
                    @blur="handleBlur('disk', 'number')"
                    @input="handleChange"
                    :min="0"
                    :default-value="0"
                    :placeholder="
                      t('message.placeholder.input-2', {
                        data: t('common.column.root-disk'),
                      })
                    "
                  />
                </a-form-item>
              </a-col>
            </Field>
          </a-row>
        </a-form>
      </a-card>
    </div>
    <div class="footer-bar">
      <div class="footer-bar-right">
        <a-space :size="SizeConst.sixteen">
          <a-button size="large" @click="goToPageByName(router, 'flavor')">{{
            t('common.content.action.cancel')
          }}</a-button>
          <a-button type="primary" size="large" html-type="submit">{{
            t('common.content.action.create')
          }}</a-button>
        </a-space>
      </div>
    </div>
  </Form>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Form, Field, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { FlavorCreateType } from '@/types/compute/flavor/FlavorCreateType';
import { goToPageByName } from '@/utils/RouterUtil';
import '@/utils/ValidationRules';
import { openNotification } from '@/utils/CommonUtil';
import { createFlavor } from '@/axios/compute-service/FlavorApi';
import { SizeConst } from '@/types/common/constant/SizeConst';

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

// 유효성 검증을 위한 number values
const numberValues = ref<any>({
  vcpus: 0 as number | string,
  gibRam: 0 as number | string,
  disk: 0 as number | string,
});

const flavorForm = ref<FlavorCreateType>({
  name: '',
  description: '',
  vcpus: 0,
  ram: 0,
  disk: 0,
});

const validationSchema = {
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  description: { conInputMaxText: 40 },
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  vcpus: {
    conInputRequired: 'vCPU',
    conInputNotBlank: String,
    conInputOnlyNaturalNumber: String,
    conInputGreaterThan: 0,
  },
  gibRam: {
    conInputRequired: 'Ram Size',
    conInputNotBlank: String,
    conInputOnlyNaturalNumber: String,
    conInputGreaterThan: 0,
  },
  disk: {
    conInputRequired: 'Root Disk',
    conInputNotBlank: String,
    conInputOnlyNaturalNumber: String,
  },
};
let createForm: any = useForm();

const handleBlur = (field: string, inputType?: string) => {
  if (inputType === 'number') {
    createForm.validateField(field).then((res: any) => {
      if (!res.valid) {
        let parseIntValue = parseInt(numberValues.value[field].toString());
        numberValues.value[field] = isNaN(parseIntValue) ? 0 : parseIntValue;
      }
    });
  }
};

const createResource = () => {
  // openstack api docs : The amount of RAM a flavor has, in MiB.
  // GiB to MiB
  flavorForm.value.ram = numberValues.value.gibRam * 1024;
  flavorForm.value.vcpus = numberValues.value.vcpus;
  flavorForm.value.disk = numberValues.value.disk;
  createFlavor(flavorForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.flavor'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.flavor'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByName(router, 'flavor');
    });
};
</script>
<style lang="scss" scoped></style>
