<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header class="page-header" :title="t(route.meta?.title)" />
  <Form
    @submit="associateResource"
    @invalid-submit="checkValid"
    :validation-schema="validationSchema"
    ref="createForm"
  >
    <div class="contents">
      <a-card>
        <a-form class="form" name="basic" layout="vertical">
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <a-form-item :label="t('common.column.network')">
                <a-input :value="data?.floatingNetworkName" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :label="t('common.column.floating-ip')">
                <a-input :value="data?.floatingIpAddress" disabled />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="form-row">
            <div class="ant-form-item-label">
              <label class="ant-form-item-required">할당 자원</label>
            </div>
          </a-row>
          <div class="head-title-wrapper normal-word">
            <p class="text" v-if="!selectedInstance && !selectedPort">
              {{ '선택 자원' }}
            </p>
            <p class="text" v-else-if="selectedInstance && !selectedPort">
              <a-tag>{{ selectedInstance.name }}</a-tag>
            </p>
            <p class="text" v-else-if="!selectedInstance && selectedPort">
              <a-tag>{{ selectedPort.name }}</a-tag>
            </p>
          </div>
          <a-form-item>
            <a-space
              class="space-block"
              direction="vertical"
              :size="SizeConst.eight"
            >
              <a-radio-group
                class="radio-group-button"
                v-model:value="resourceChoiceValue"
                name="volumeSourceChoice"
              >
                <a-radio-button value="instance">인스턴스</a-radio-button>
                <a-radio-button value="port" disabled>포트</a-radio-button>
              </a-radio-group>
              <template v-if="resourceChoiceValue === 'instance'">
                <InstanceTable
                  v-model:instance="selectedInstance"
                  :validate-form="createForm"
                />
              </template>
              <!--              <template v-else-if="resourceChoiceValue === 'port'">-->
              <!--                <PortTable v-model:port="selectedPort" />-->
              <!--              </template>-->
            </a-space>
          </a-form-item>
          <a-row class="form-row">
            <div class="ant-form-item-label">
              <label class="ant-form-item-required">고정 IP</label>
            </div>
          </a-row>
          <div class="head-title-wrapper normal-word">
            <p class="text" v-if="!selectedInstance && !selectedPort">
              {{ '할당 자원을 선택해 주세요.' }}
            </p>
            <p class="text" v-else-if="!selectedFixedIp?.fixedIps">
              {{ '선택 고정 IP' }}
            </p>
            <p class="text" v-else>
              <template
                v-for="(fixedIp, idx) in selectedFixedIp.fixedIps"
                v-bind:key="fixedIp"
              >
                <a-tag
                  >{{ fixedIp.ipAddress }}
                  {{ idx + 1 < selectedFixedIp.length ? ', ' : '' }}</a-tag
                >
              </template>
            </p>
          </div>
          <a-form-item>
            <a-space
              class="space-block"
              direction="vertical"
              :size="SizeConst.eight"
            >
              <FixedIpTable
                v-model:fixed-ip="selectedFixedIp"
                :resource-id="
                  selectedInstance
                    ? selectedInstance.id
                    : selectedPort
                    ? selectedPort.id
                    : undefined
                "
                :network-id="data?.floatingNetworkId"
                :validate-form="createForm"
              />
            </a-space>
          </a-form-item>
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
            t('common.content.action.associate')
          }}</a-button>
        </a-space>
      </div>
    </div>
  </Form>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Form, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { goToPageByName } from '@/utils/RouterUtil';
import { openNotification } from '@/utils/CommonUtil';
import {
  associateFloatingIp,
  getFloatingIpDetail,
} from '@/axios/network-service/FloatingApi';
import { FloatingIpType } from '@/types/network/floating-ip/FloatingIpListType';
import { InstanceType } from '@/types/compute/instance/InstanceListType';
import { PortType } from '@/types/network/port/PortType';
import InstanceTable from '@/views/network/floating-ip/components/InstanceTable.vue';
import FixedIpTable from '@/views/network/floating-ip/components/FixedIpTable.vue';
import { FloatingIpAssociateType } from '@/types/network/floating-ip/FloatingIpAssociateType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { SizeConst } from '@/types/common/constant/SizeConst';

const providerStore = ProviderStore();
watch(providerStore, () => {
  goToPageByName(router, 'floating-ip');
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const floatingIpId = route.params.id as string;

const data = ref<FloatingIpType>();
const getFloatingIpResource = () => {
  getFloatingIpDetail(floatingIpId)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

const resourceChoiceValue = ref<string>('instance');
const selectedInstance = ref<InstanceType>();
const selectedPort = ref<PortType>();
const selectedFixedIp = ref<PortType>();

let createForm: any = useForm();
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  instance: { conSelectRequired: '인스턴스' },
  fixedIp: { conSelectRequired: '고정 IP' },
});

const checkValid = () => {
  // invalid submit
};

// 자원 생성 : 유동 IP - 포트 연동
const associateResource = () => {
  let floatingIpAssociateForm = {} as FloatingIpAssociateType;
  if (selectedInstance.value && selectedFixedIp.value) {
    floatingIpAssociateForm.portId = selectedFixedIp.value.id;
  }
  associateFloatingIp(floatingIpId, floatingIpAssociateForm)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.associate', {
          data: t('common.content.floating-ip'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.associate', {
          data: t('common.content.floating-ip'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByName(router, 'floating-ip');
    });
};

onMounted(async () => {
  await router.isReady();
  getFloatingIpResource();
});
</script>
<style lang="scss" scoped></style>
