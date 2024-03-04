<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header class="page-header" :title="t(route.meta?.title)" />
  <Form
    @submit="createResource"
    @invalid-submit="checkValid"
    :validation-schema="validationSchema"
    ref="createForm"
  >
    <div class="contents">
      <a-card>
        <a-form class="form" name="basic" layout="vertical">
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <a-form-item :label="t('common.column.name')">
                <a-input :value="data?.name" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <Field
                name="owner"
                v-model="routerForm.projectId"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.owner-project')"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                  style="width: 100%"
                >
                  <a-input :value="data?.projectName" disabled />
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row">
            <div class="ant-form-item-label">
              <label class="ant-form-item-required">네트워크</label>
            </div>
          </a-row>
          <div class="head-title-wrapper normal-word">
            <p class="text" v-if="!selectedNetwork">
              {{ '선택 네트워크' }}
            </p>
            <p class="text" v-else>
              <a-tag>{{ selectedNetwork.name }}</a-tag>
            </p>
          </div>
          <a-space
            class="space-block"
            direction="vertical"
            :size="SizeConst.eight"
          >
            <NetworkTable
              v-model:network="selectedNetwork"
              :project-id="data?.projectId"
              :validate-form="createForm"
            />
          </a-space>
          <a-row class="form-row">
            <div class="ant-form-item-label">
              <label class="ant-form-item-required">서브넷</label>
            </div>
          </a-row>
          <div class="head-title-wrapper normal-word">
            <p class="text" v-if="!selectedNetwork">
              {{ '네트워크를 선택해 주세요.' }}
            </p>
            <p class="text" v-else-if="!selectedSubnet">
              {{ '선택 서브넷' }}
            </p>
            <p class="text" v-else>
              <a-tag>{{ selectedSubnet.name }}</a-tag>
            </p>
          </div>
          <a-space
            class="space-block"
            direction="vertical"
            :size="SizeConst.eight"
          >
            <SubnetTable
              v-model:subnet="selectedSubnet"
              :network-id="selectedNetwork?.id"
              :validate-form="createForm"
            />
          </a-space>
        </a-form>
      </a-card>
    </div>
    <div class="footer-bar">
      <div class="footer-bar-right">
        <a-space :size="SizeConst.sixteen">
          <a-button size="large" @click="router.go(-1)">{{
            t('common.content.action.cancel')
          }}</a-button>
          <a-button type="primary" size="large" html-type="submit">{{
            t('common.content.action.confirm')
          }}</a-button>
        </a-space>
      </div>
    </div>
  </Form>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Field, Form, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { goToPageByName } from '@/utils/RouterUtil';
import { openNotification } from '@/utils/CommonUtil';
import { RouterCreateType } from '@/types/network/router/RouterCreateType';
import {
  addRouterInterface,
  getRouterDetail,
} from '@/axios/network-service/RouterApi';
import { NetworkType } from '@/types/network/network/NetworkListType';
import NetworkTable from '@/views/network/router/management-coponents/NetworkTable.vue';
import { SubnetType } from '@/types/network/network/subnet/SubnetListType';
import SubnetTable from '@/views/network/router/management-coponents/SubnetTable.vue';
import { RouterType } from '@/types/network/router/RouterListType';
import { SizeConst } from '@/types/common/constant/SizeConst';

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const routerId = route.params.id as string;

const data = ref<RouterType>();
const getRouterResource = () => {
  getRouterDetail(routerId)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

const selectedNetwork = ref<NetworkType>();
const selectedSubnet = ref<SubnetType>();
const routerForm = ref<RouterCreateType>({
  name: '',
  description: '',
  projectId: '',
  routerExternal: false,
  externalGatewayInfo: undefined,
  availabilityZoneHints: [],
});

let createForm: any = useForm();
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  networkId: { conSelectRequired: '네트워크' },
  subnetId: { conSelectRequired: '서브넷' },
});

const checkValid = () => {
  // invalid submit
};

// 자원 생성 : 라우터 서브넷 추가
const createResource = () => {
  if (!selectedSubnet.value) {
    createForm.validateField('subnetId').then();
    return;
  }
  addRouterInterface(routerId, selectedSubnet.value.id)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.management', {
          data: t('common.content.router'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.management', {
          data: t('common.content.router'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      // TODO
      goToPageByName(router, 'router detail');
    });
};

onMounted(async () => {
  await router.isReady();
  getRouterResource();
});
</script>
<style lang="scss" scoped></style>
