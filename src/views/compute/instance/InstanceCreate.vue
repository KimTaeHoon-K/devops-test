<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header class="page-header" :title="t(route.meta?.title)">
  </a-page-header>

  <div class="contents">
    <a-row :gutter="10" class="step-vertical-wrapper">
      <a-col :xl="3" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card>
          <a-space
            class="space-block"
            direction="vertical"
            :size="SizeConst.twelve"
          >
            <!--            <div class="step-title">-->
            <!--              <info-circle-outlined class="icon" />-->
            <!--              {{ t('message.create.step-guide') }}-->
            <!--            </div>-->
            <a-steps :current="current" direction="vertical">
              <a-step
                v-for="(step, index) in steps"
                :key="index"
                :title="t(step.title)"
                :description="t(step.subTitle)"
                :status="step.status"
                :disabled="true"
              />
            </a-steps>
          </a-space>
        </a-card>
      </a-col>
      <a-col :xl="21" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card>
          <Form
            v-if="current === 0"
            name="basicValidForm"
            :validation-schema="validationSchema.basicInfo"
            ref="createBasicInfoForm"
          >
            <InstanceCreateBasicInfo
              :validate-form="createBasicInfoForm"
              v-model:instance-basic-info="instanceBasicInfo"
              v-model:is-check-valid="isCheckValid[0]"
            />
          </Form>
          <Form
            v-if="current === 1"
            name="sourceValidForm"
            :validation-schema="validationSchema.source"
            ref="createSourceForm"
          >
            <InstanceCreateInstanceSource
              :validate-form="createSourceForm"
              v-model:image-info="imageInfo"
              v-model:is-check-valid="isCheckValid[1]"
            />
          </Form>
          <Form
            v-if="current === 2"
            name="flavorValidForm"
            :validation-schema="validationSchema.flavor"
            ref="createFlavorForm"
          >
            <InstanceCreateFlavor
              :validate-form="createFlavorForm"
              v-model:flavor-info="flavorInfo"
              :instance-source-size="imageInfo.imageSize"
              v-model:is-check-valid="isCheckValid[2]"
            />
          </Form>
          <!--          <Form-->
          <!--            v-if="current === 3"-->
          <!--            name="storageValidForm"-->
          <!--            :validation-schema="validationSchema.storage"-->
          <!--            ref="createStorageForm"-->
          <!--          >-->
          <!--            <InstanceCreateStorage-->
          <!--              :validate-form="createStorageForm"-->
          <!--              v-model:project-id="projectId"-->
          <!--            />-->
          <!--          </Form>-->
          <Form
            v-if="current === 3"
            name="networkValidForm"
            :validation-schema="validationSchema.network"
            ref="createNetworkForm"
          >
            <InstanceCreateNetwork
              :validate-form="createNetworkForm"
              v-model:network-info="networkInfo"
              v-model:project-id="instanceCreateForm.projectId"
              v-model:is-check-valid="isCheckValid[3]"
            />
          </Form>
          <Form
            v-if="current === 4"
            name="securityValidForm"
            :validation-schema="validationSchema.security"
            ref="createSecurityForm"
          >
            <InstanceCreateSecurity
              :validate-form="createSecurityForm"
              v-model:security-info="securityInfo"
              v-model:project-id="instanceCreateForm.projectId"
              v-model:is-check-valid="isCheckValid[4]"
            />
          </Form>
          <InstanceCreateReview
            v-if="current === 5"
            v-model:review-info="reviewInfo"
          />
        </a-card>
      </a-col>
    </a-row>
    <div class="footer-bar">
      <div class="footer-bar-right">
        <a-space :size="SizeConst.sixteen">
          <a-button size="large" @click="goToPageByName(router, 'instance')">{{
            t('common.content.action.cancel')
          }}</a-button>
          <a-button v-if="current > 0" size="large" @click="previousStep">{{
            t('common.content.action.previous')
          }}</a-button>
          <a-button
            v-if="current === !5 || current < steps.length - 1"
            type="primary"
            size="large"
            @click="checkValidate"
            >{{ t('common.content.action.next') }}</a-button
          >
          <a-button
            v-if="current === 5"
            size="large"
            type="primary"
            @click="createResource"
            >{{ t('common.content.action.create') }}
          </a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { Form, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import InstanceCreateBasicInfo from '@/views/compute/instance/create-components/InstanceCreateBasicInfo.vue';
import InstanceCreateInstanceSource from '@/views/compute/instance/create-components/InstanceCreateInstanceSource.vue';
import InstanceCreateFlavor from '@/views/compute/instance/create-components/InstanceCreateFlavor.vue';
import InstanceCreateNetwork from '@/views/compute/instance/create-components/InstanceCreateNetwork.vue';
import InstanceCreateSecurity from '@/views/compute/instance/create-components/InstanceCreateSecurity.vue';
import InstanceCreateReview from '@/views/compute/instance/create-components/InstanceCreateReview.vue';
import { createInstance } from '@/axios/compute-service/InstanceApi';
import {
  InstanceCreateType,
  InstanceReviewInfoType,
} from '@/types/compute/instance/InstanceCreateType';
import { goToPageByName } from '@/utils/RouterUtil';
import { openNotification } from '@/utils/CommonUtil';
import { bytesToGibConverterWithoutUnit } from '@/utils/Converter';
import { SizeConst } from '@/types/common/constant/SizeConst';
// import InstanceCreateStorage from '@/views/compute/instance/create-components/InstanceCreateStorage.vue';

const router = useRouter();
const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const steps = ref([
  {
    title: 'message.create.step-info.basic-info.title',
    subTitle: 'message.create.step-info.basic-info.sub-title.instance',
    status: '',
  },
  {
    title: 'message.create.step-info.instance.instance-source.title',
    subTitle: 'message.create.step-info.instance.instance-source.sub-title',
    status: '',
  },
  {
    title: 'message.create.step-info.instance.flavor.title',
    subTitle: 'message.create.step-info.instance.flavor.sub-title',
    status: '',
  },
  // {
  //   title: 'message.create.step-info.instance.storage.title',
  //   subTitle: 'message.create.step-info.instance.storage.sub-title',
  //   status: '',
  // },
  {
    title: 'message.create.step-info.instance.network.title',
    subTitle: 'message.create.step-info.instance.network.sub-title',
    status: '',
  },
  {
    title: 'message.create.step-info.instance.security.title',
    subTitle: 'message.create.step-info.instance.security.sub-title',
    status: '',
  },
  {
    title: 'message.create.step-info.review.title',
    subTitle: 'message.create.step-info.review.sub-title',
    status: '',
  },
]);

const current = ref<number>(0);
const previousStep = () => {
  current.value -= 1;
};
const nextStep = () => {
  current.value += 1;
};

let createBasicInfoForm: any = useForm();
let createSourceForm: any = useForm();
let createFlavorForm: any = useForm();
// let createStorageForm: any = useForm();
let createNetworkForm: any = useForm();
let createSecurityForm: any = useForm();

const instanceCreateForm = ref<InstanceCreateType>({
  server: {
    name: '',
    description: '',
    imageRef: '',
    flavorRef: '',
    keyName: '',
    availabilityZone: '',
    networks: [
      {
        uuid: '',
      },
    ],
    osDcfDiskConfig: 'MANUAL',
    securityGroups: [],
    blockDeviceMappingV2: [
      {
        volumeSize: 0,
        deleteOnTermination: false,
        destinationType: 'volume',
        sourceType: 'image',
        uuid: '',
        bootIndex: 0,
      },
    ],
  },
  projectId: '',
});

const instanceBasicInfo = ref({
  instanceName: '',
  instanceDescription: '',
  projectId: '',
  projectName: '',
  availabilityZone: undefined,
});

const imageInfo = ref({
  imageId: '',
  imageName: '',
  imageSize: 0,
  imageVisibility: '',
  volumeSize: 0,
  volumeDeleteOnTermination: false,
});

const flavorInfo = ref({
  flavorId: '',
  flavorName: '',
  flavorRootDisk: 0,
  flavorVCPU: '',
});

// const storageInfo = ref({
//   networkId: '',
//   networkName: '',
//   subnetCount: 0,
//   routerExternal: '',
// });

const networkInfo = ref({
  networkId: '',
  networkName: '',
  subnetCount: 0,
  routerExternal: false,
});

const securityInfo = ref({
  securityGroupNames: [],
  keypairName: '',
});

const reviewInfo = ref<InstanceReviewInfoType>({} as InstanceReviewInfoType);
const isCheckValid = ref<boolean[]>([false, false, false, false, false]);

// instanceBasicInfo 값 변경 감지
watch(instanceBasicInfo, () => {
  instanceCreateForm.value.server.name = instanceBasicInfo.value.instanceName;
  instanceCreateForm.value.server.description =
    instanceBasicInfo.value.instanceDescription;
  instanceCreateForm.value.projectId = instanceBasicInfo.value.projectId;
  instanceCreateForm.value.server.availabilityZone =
    instanceBasicInfo.value.availabilityZone;

  reviewInfo.value.instanceName = instanceBasicInfo.value.instanceName;
  reviewInfo.value.instanceDescription =
    instanceBasicInfo.value.instanceDescription;
  reviewInfo.value.projectName = instanceBasicInfo.value.projectName;
  reviewInfo.value.projectId = instanceBasicInfo.value.projectId;
});

// imageInfo 값 변경 감지
watch(imageInfo, () => {
  instanceCreateForm.value.server.imageRef = imageInfo.value.imageId;
  instanceCreateForm.value.server.blockDeviceMappingV2[0].volumeSize =
    imageInfo.value.volumeSize;
  instanceCreateForm.value.server.blockDeviceMappingV2[0].deleteOnTermination =
    imageInfo.value.volumeDeleteOnTermination;
  instanceCreateForm.value.server.blockDeviceMappingV2[0].uuid =
    imageInfo.value.imageId;

  validationSchema.value.flavor.flavorSize = {
    conSelectGreaterThanOrEqualTo: {
      thanValue: bytesToGibConverterWithoutUnit(imageInfo.value.imageSize),
      thanLabel: '루트 디스크',
    },
  };

  reviewInfo.value.imageName = imageInfo.value.imageName;
  reviewInfo.value.imageSize = imageInfo.value.imageSize;
  reviewInfo.value.imageVisibility = imageInfo.value.imageVisibility;
  reviewInfo.value.volumeSize = imageInfo.value.volumeSize;
  reviewInfo.value.deleteOnTermination =
    imageInfo.value.volumeDeleteOnTermination;
});

// flavorInfo 값 변경 감지
watch(flavorInfo, () => {
  instanceCreateForm.value.server.flavorRef = flavorInfo.value.flavorId;

  reviewInfo.value.flavorName = flavorInfo.value.flavorName;
  reviewInfo.value.flavorRootDisk = flavorInfo.value.flavorRootDisk;
  reviewInfo.value.flavorVCPU = flavorInfo.value.flavorVCPU;
});

// storageInfo 값 변경 감지
// watch(storageInfo, () => {
//   instanceCreateForm.value.server.networks[0].uuid =
//     networkInfo.value.networkId;
//
//   reviewInfo.value.networkName = networkInfo.value.networkName;
//   reviewInfo.value.subnetCount = networkInfo.value.subnetCount;
//   reviewInfo.value.routerExternal = networkInfo.value.routerExternal;
// });

// networkInfo 값 변경 감지
watch(networkInfo, () => {
  instanceCreateForm.value.server.networks[0].uuid =
    networkInfo.value.networkId;

  reviewInfo.value.networkName = networkInfo.value.networkName;
  reviewInfo.value.subnetCount = networkInfo.value.subnetCount;
  reviewInfo.value.routerExternal = networkInfo.value.routerExternal;
});

// securityInfo 값 변경 감지
watch(securityInfo, () => {
  instanceCreateForm.value.server.keyName = securityInfo.value.keypairName;
  securityGroupMapping(securityInfo.value.securityGroupNames);

  reviewInfo.value.securityGroupNames = securityInfo.value.securityGroupNames;
  reviewInfo.value.keypairName = securityInfo.value.keypairName;
});

const validationSchema = ref<any>({
  basicInfo: {
    // 작성 순서로 유효성 체크 우선 순위 결정 됨.
    instanceName: {
      conInputRequired: t('common.column.resource-name', {
        data: t('common.content.instance'),
      }),
      conInputEngLowerCase: String,
    },
    description: { conInputMaxText: 40 },
    availabilityZone: {
      conSelectRequired: t('common.content.availability-zone'),
    },
    project: { conMultipleSelectRequired: t('common.content.project') },
  },
  source: {
    image: { conMultipleSelectRequired: t('common.content.image') },
    volume: {
      conInputRequired: t('common.content.volume'),
      conInputOnlyNaturalNumber: String,
      conInputGreaterThan: 0,
    },
  },
  flavor: {
    flavor: {
      conMultipleSelectRequired: t('common.content.flavor'),
    },
    flavorSize: {
      conSelectGreaterThan: {
        thanValue: imageInfo.value.imageSize,
        thanLabel: '루트 디스크',
      },
    },
  },
  // storage: {
  //   storage: {},
  // },
  network: {
    network: { conMultipleSelectRequired: t('common.content.network') },
  },
  security: {
    securityGroup: {
      conMultipleSelectRequired: t('common.content.security-group'),
    },
  },
});

// step validation 표시
// watch(current, () => {
//   if (!isValidBasicInfo.value) {
//     steps[0].status = 'error';
//   } else {
//     steps[0].status = '';
//   }
// });

const checkValidate = () => {
  if (current.value === 0) {
    validate(createBasicInfoForm);
  } else if (current.value === 1) {
    validate(createSourceForm);
  } else if (current.value === 2) {
    validate(createFlavorForm);
    // } else if (current.value === 3) {
    //   validate(createStorageForm);
  } else if (current.value === 3) {
    validate(createNetworkForm);
  } else if (current.value === 4) {
    validate(createSecurityForm);
  }
};

const validate = (createForm: any) => {
  createForm.validate().then((res: any) => {
    if (res.valid) {
      nextStep();
    }
  });
};

const securityGroupMapping = (selectedSecurityGroups: string[]) => {
  instanceCreateForm.value.server.securityGroups = selectedSecurityGroups.map(
    (item) => {
      return {
        name: item,
      };
    }
  );
};

const createResource = () => {
  createInstance(instanceCreateForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.instance'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.instance'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByName(router, 'instance');
    });
};
</script>

<style lang="scss" scoped></style>
