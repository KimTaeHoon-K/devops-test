<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header class="page-header" :title="t(route.meta?.title)" />
  <Form
    @submit="updateResource"
    @invalid-submit="checkValid"
    :validation-schema="validationSchema"
    ref="updateForm"
  >
    <div class="contents">
      <a-card>
        <a-form class="form" name="basic" layout="vertical">
          <a-row class="form-row" :gutter="12">
            <a-col :span="24">
              <a-form-item
                :label="
                  t('common.column.resource-name', {
                    data: t('common.content.volume-type'),
                  })
                "
              >
                <a-input :value="data?.name" disabled />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="form-row">
            <div class="ant-form-item-label">
              <label for="basic_project">QoS Specs</label>
            </div>
          </a-row>
          <div class="head-title-wrapper normal-word">
            <p class="text">
              {{ selectedQosSpecs ? selectedQosSpecs?.name : '선택 QoS Specs' }}
            </p>
          </div>
          <a-space
            class="space-block"
            direction="vertical"
            :size="SizeConst.eight"
          >
            <QosSpecsTable
              v-if="data?.id"
              v-model:qos-specs="selectedQosSpecs"
              :qos-specs-id="data?.qosSpecsId"
              :validate-form="updateForm"
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
  associateQosSpecs,
  disassociateQosSpecs,
  getVolumeTypeDetail,
} from '@/axios/storage-service/VolumeTypeApi';
import { VolumeTypeType } from '@/types/storage/volume-type/VolumeTypeListType';
import QosSpecsTable from '@/views/storage/volume-type/components/QosSpecsTable.vue';
import { QosSpecsType } from '@/types/storage/volume-type/QosSpecsListType';
import { SizeConst } from '@/types/common/constant/SizeConst';

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const volumeTypeId = route.params?.id as string;

// 자원 목록 조회 : 볼륨 타입 조회
const data = ref<VolumeTypeType>({} as VolumeTypeType);
const getVolumeTypeResource = (volumeTypeId: string) => {
  getVolumeTypeDetail(volumeTypeId)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

const selectedQosSpecs = ref<QosSpecsType>({} as QosSpecsType);

let updateForm: any = useForm();
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  qosSpecs: {},
});

watch(data, () => {
  if (data.value.id) {
    validationSchema.value.qosSpecs = {
      conMultipleSelectRequired: 'QoS Specs',
    };
  }
});

const updateResource = () => {
  if (data.value.qosSpecsId) {
    // 기존 qos specs 해제
    disassociateQosSpecs(data.value.qosSpecsId, volumeTypeId)
      .then((res) => {
        associateResource();
      })
      .catch((err) => {
        console.error(err);
        openNotification(
          false,
          'QoS Specs 연결에 실패하였습니다.\n' + err.code + err.message,
          'color: #ff4d4f'
        );
      })
      .finally(() => {
        goToPageByName(router, 'volume type');
      });
  } else {
    associateResource();
  }
};

const associateResource = () => {
  associateQosSpecs(selectedQosSpecs.value.id, volumeTypeId)
    .then((res) => {
      openNotification(true, 'QoS Specs가 연결되었습니다.', 'color: #0068ff');
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        'QoS Specs 연결에 실패하였습니다.\n' + err.code + err.message,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByName(router, 'volume type');
    });
};

onMounted(async () => {
  await router.isReady();
  if (volumeTypeId) {
    getVolumeTypeResource(volumeTypeId);
  }
});
</script>
<style lang="scss" scoped></style>
