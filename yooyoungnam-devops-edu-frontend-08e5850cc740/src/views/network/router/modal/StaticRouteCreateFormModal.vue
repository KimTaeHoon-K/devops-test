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
          :model="routeForm.destination"
          layout="vertical"
        >
          <Field
            name="destination"
            v-model="routeForm.destination"
            v-slot="{ destinationValue, handleChange, errorMessage }"
          >
            <a-form-item
              :label="t('common.column.destination-cidr')"
              :rules="[{ required: true }]"
              :help="errorMessage"
              :has-feedback="!!errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
            >
              <a-input
                :value="destinationValue"
                @update:value="handleChange"
                @blur="handleChange"
                @input="destinationValue = $event.target.value"
                :placeholder="
                  t('message.placeholder.input-1', {
                    data: t('common.column.destination-cidr'),
                  })
                "
              />
            </a-form-item>
          </Field>
          <Field
            name="nexthop"
            v-model="routeForm.nexthop"
            v-slot="{ handleChange, errorMessage }"
          >
            <a-form-item
              :label="'Next Hop'"
              :rules="[{ required: true }]"
              :help="errorMessage"
              :has-feedback="!!errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
            >
              <a-input
                :value="routeForm.nexthop"
                @update:value="handleChange"
                @blur="handleChange"
                :placeholder="
                  t('message.placeholder.input-1', {
                    data: 'Next Hop',
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
import { openNotification } from '@/utils/CommonUtil';
import { RouterType } from '@/types/network/router/RouterListType';
import { createRouterStaticRoute } from '@/axios/network-service/RouterApi';
import { HostRouteType } from '@/types/network/common/NetworkCommonType';

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
  routerId: {
    type: String,
    required: true,
  },
});

const validationSchema = {
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  destination: { conInputRequired: '대상 CIDR', conInputIpv4Cidr: String },
  nexthop: { conInputRequired: 'Next Hop', conInputIpv4: String },
};
let createForm: any = useForm();

const routeForm = ref<HostRouteType>({
  destination: '',
  nexthop: '',
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
  let routerUpdateForm = { router: {} as RouterType };
  routerUpdateForm.router.id = props.routerId;
  routerUpdateForm.router.routes = [routeForm.value];
  createRouterStaticRoute(props.routerId, routerUpdateForm)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.static-route'),
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
          data: t('common.content.static-route'),
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
