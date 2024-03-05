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
                disabled="true"
              />
            </a-steps>
          </a-space>
        </a-card>
      </a-col>
      <a-col :xl="21" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card>
          <Form
            v-if="current === 0"
            name="projectValidForm"
            :validation-schema="validationSchema.basicInfo"
            ref="createBasicInfoForm"
          >
            <ProjectCreateBasicInfo
              :validate-form="createBasicInfoForm"
              v-model:basic-info="basicInfo"
              v-model:is-check-valid="isCheckValid[0]"
            />
          </Form>
          <Form
            v-if="current === 1"
            name="listenerValidForm"
            :validation-schema="validationSchema.quota"
            ref="createQuotaForm"
          >
            <ProjectCreateQuota
              :validate-form="createQuotaForm"
              v-model:quota-info="quotaInfo"
              v-model:is-check-valid="isCheckValid[1]"
            />
          </Form>
          <ProjectCreateReview
            v-if="current === 2"
            v-model:review-info="reviewInfo"
          />
        </a-card>
      </a-col>
    </a-row>
    <div class="footer-bar">
      <div class="footer-bar-right">
        <a-space :size="SizeConst.sixteen">
          <a-button size="large" @click="goToPageByName(router, 'project')">{{
            t('common.content.action.cancel')
          }}</a-button>
          <a-button v-if="current > 0" size="large" @click="previousStep">{{
            t('common.content.action.previous')
          }}</a-button>
          <a-button
            v-if="current === !2 || current < steps.length - 1"
            type="primary"
            size="large"
            @click="checkValidate"
            >{{ t('common.content.action.next') }}</a-button
          >
          <a-button
            v-if="current === 2"
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
import { goToPageByName } from '@/utils/RouterUtil';
import { openNotification } from '@/utils/CommonUtil';
import ProjectCreateReview from '@/views/management/project/create-components/ProjectCreateReview.vue';
import ProjectCreateBasicInfo from '@/views/management/project/create-components/ProjectCreateBasicInfo.vue';
import ProjectCreateQuota from '@/views/management/project/create-components/ProjectCreateQuota.vue';
import {
  ProjectBasicInfoType,
  ProjectCreateType,
  ProjectReviewInfoType,
  QuotaInfoType,
} from '@/types/identity/project/ProjectCreateType';
import { createProject } from '@/axios/identity-service/ProjectApi';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { SizeConst } from '@/types/common/constant/SizeConst';

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
    subTitle: 'message.create.step-info.basic-info.sub-title.project',
    status: '',
  },
  {
    title: 'message.create.step-info.project.quota-setting.title',
    subTitle: 'message.create.step-info.project.quota-setting.sub-title',
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
let createQuotaForm: any = useForm();

const projectCreateForm = ref<ProjectCreateType>({} as ProjectCreateType);

const basicInfo = ref<ProjectBasicInfoType>({} as ProjectBasicInfoType);
const quotaInfo = ref<QuotaInfoType>({} as QuotaInfoType);
const reviewInfo = ref<ProjectReviewInfoType>({} as ProjectReviewInfoType);
const isCheckValid = ref<boolean[]>([false, false]);

// basicInfo 값 변경 감지
watch(basicInfo, () => {
  projectCreateForm.value.name = basicInfo.value.name;
  projectCreateForm.value.description = basicInfo.value.description;
  projectCreateForm.value.enabled = basicInfo.value.enabled;

  reviewInfo.value.basicInfo = basicInfo.value;
});

// quotaInfo 값 변경 감지
watch(quotaInfo, () => {
  // projectCreateForm.value.name = basicInfo.value.name;
  // projectCreateForm.value.description = basicInfo.value.description;
  // projectCreateForm.value.enabled = basicInfo.value.enabled;
  //
  reviewInfo.value.quotaInfo = quotaInfo.value;
});

const validationSchema = {
  basicInfo: {
    // 작성 순서로 유효성 체크 우선 순위 결정 됨.
    name: {
      conInputRequired: t('common.column.resource-name', {
        data: t('common.content.project'),
      }),
    },
    description: { conInputMaxText: 40 },
  },
  quota: {
    instance: { conInputOnlyNaturalNumber: String },
    vCpus: { conInputOnlyNaturalNumber: String },
    memory: { conInputOnlyNaturalNumber: String },
    ram: { conInputOnlyNaturalNumber: String },
    serverGroup: { conInputIpv4Cidr: String },
  },
};

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
    validate(createQuotaForm);
  }
};

const validate = (createForm: any) => {
  createForm.validate().then((res: any) => {
    if (res.valid) {
      nextStep();
    }
  });
};

const providerStore = ProviderStore();
const createResource = () => {
  projectCreateForm.value.domainId = 'default';
  createProject(providerStore.getSelectedProviderId, projectCreateForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.project'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.project'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByName(router, 'project');
    });
};
</script>

<style lang="scss" scoped></style>
