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
            name="loadBalancerValidForm"
            :validation-schema="validationSchema.loadBalancer"
            ref="createLoadBalancerForm"
          >
            <LoadBalancerCreateLoadBalancer
              :validate-form="createLoadBalancerForm"
              v-model:load-balancer-info="loadBalancerInfo"
              v-model:is-check-valid="isCheckValid[0]"
            />
          </Form>
          <Form
            v-if="current === 1"
            name="listenerValidForm"
            :validation-schema="validationSchema.listener"
            ref="createListenerForm"
          >
            <LoadBalancerCreateListener
              :validate-form="createListenerForm"
              v-model:listener-info="listenerInfo"
              v-model:is-check-valid="isCheckValid[1]"
            />
          </Form>
          <Form
            v-if="current === 2"
            name="poolValidForm"
            :validation-schema="validationSchema.pool"
            ref="createPoolForm"
          >
            <LoadBalancerCreatePool
              :validate-form="createPoolForm"
              v-model:pool-info="poolInfo"
              v-model:is-check-valid="isCheckValid[2]"
              :listener-protocol="listenerInfo.protocol"
            />
          </Form>
          <Form
            v-if="current === 3"
            name="poolMemberValidForm"
            :validation-schema="validationSchema.poolMember"
            ref="createPoolMemberForm"
          >
            <LoadBalancerCreatePoolMember
              :validate-form="createPoolMemberForm"
              v-model:pool-member-info="poolMemberInfo"
              v-model:is-check-valid="isCheckValid[3]"
              :project-id="loadBalancerInfo.projectId"
            />
          </Form>
          <Form
            v-if="current === 4"
            name="healthCheckValidForm"
            :validation-schema="validationSchema.healthCheck"
            ref="createHealthCheckForm"
          >
            <LoadBalancerCreateHealthCheck
              :validate-form="createHealthCheckForm"
              v-model:health-check-info="healthCheckInfo"
              v-model:health-check-timeout="healthCheckTimeout"
              v-model:is-check-valid="isCheckValid[4]"
              :listener-protocol="listenerInfo.protocol"
            />
          </Form>
          <LoadBalancerCreateReview
            v-if="current === 5"
            v-model:review-info="reviewInfo"
          />
        </a-card>
      </a-col>
    </a-row>
    <div class="footer-bar">
      <div class="footer-bar-right">
        <a-space :size="SizeConst.sixteen">
          <a-button
            size="large"
            @click="goToPageByName(router, 'load-balancer')"
            >{{ t('common.content.action.cancel') }}</a-button
          >
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
import { goToPageByName } from '@/utils/RouterUtil';
import { openNotification } from '@/utils/CommonUtil';
import LoadBalancerCreateLoadBalancer from '@/views/network/load-balancer/create-components/LoadBalancerCreateLoadBalancer.vue';
import LoadBalancerCreateListener from '@/views/network/load-balancer/create-components/LoadBalancerCreateListener.vue';
import LoadBalancerCreatePool from '@/views/network/load-balancer/create-components/LoadBalancerCreatePool.vue';
import LoadBalancerCreatePoolMember from '@/views/network/load-balancer/create-components/LoadBalancerCreatePoolMember.vue';
import LoadBalancerCreateHealthCheck from '@/views/network/load-balancer/create-components/LoadBalancerCreateHealthCheck.vue';
import LoadBalancerCreateReview from '@/views/network/load-balancer/create-components/LoadBalancerCreateReview.vue';
import {
  LBHealthCheckCreateType,
  HealthCheckInfoType,
  LBListenerCreateType,
  ListenerInfoType,
  LoadBalancerCreateType,
  LoadBalancerInfoType,
  LoadBalancerReviewInfoType,
  LBPoolCreateType,
  PoolInfoType,
  LBPoolMemberCreateType,
  PoolMemberInfoType,
} from '@/types/network/load-balancer/LoadBalancerCreateType';
import { createLoadBalancer } from '@/axios/network-service/LoadBalancerApi';
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
    title: 'message.create.step-info.load-balancer.load-balancer.title',
    subTitle: 'message.create.step-info.load-balancer.load-balancer.sub-title',
    status: '',
  },
  {
    title: 'message.create.step-info.load-balancer.listener.title',
    subTitle: 'message.create.step-info.load-balancer.listener.sub-title',
    status: '',
  },
  {
    title: 'message.create.step-info.load-balancer.pool.title',
    subTitle: 'message.create.step-info.load-balancer.pool.sub-title',
    status: '',
  },
  {
    title: 'message.create.step-info.load-balancer.pool-member.title',
    subTitle: 'message.create.step-info.load-balancer.pool-member.sub-title',
    status: '',
  },
  {
    title: 'message.create.step-info.load-balancer.health-check.title',
    subTitle: 'message.create.step-info.load-balancer.health-check.sub-title',
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

let createLoadBalancerForm: any = useForm();
let createListenerForm: any = useForm();
let createPoolForm: any = useForm();
let createPoolMemberForm: any = useForm();
let createHealthCheckForm: any = useForm();

const loadBalancerCreateForm = ref<LoadBalancerCreateType>(
  {} as LoadBalancerCreateType
);
const listenerCreateForm = ref<LBListenerCreateType>(
  {} as LBListenerCreateType
);
const poolCreateForm = ref<LBPoolCreateType>({} as LBPoolCreateType);
const poolMemberCreateForm = ref<LBPoolMemberCreateType[]>(
  [] as LBPoolMemberCreateType[]
);
const healthCheckCreateForm = ref<LBHealthCheckCreateType>(
  {} as LBHealthCheckCreateType
);
const loadBalancerInfo = ref<LoadBalancerInfoType>({} as LoadBalancerInfoType);
const listenerInfo = ref<ListenerInfoType>({} as ListenerInfoType);
const poolInfo = ref<PoolInfoType>({} as PoolInfoType);
const poolMemberInfo = ref<PoolMemberInfoType[]>([] as PoolMemberInfoType[]);
const healthCheckInfo = ref<HealthCheckInfoType>({} as HealthCheckInfoType);
const healthCheckTimeout = ref<number>(5);
const reviewInfo = ref<LoadBalancerReviewInfoType>(
  {} as LoadBalancerReviewInfoType
);
const isCheckValid = ref<boolean[]>([false, false, false, false, false]);

// loadBalancerInfo 값 변경 감지
watch(loadBalancerInfo, () => {
  console.log(loadBalancerInfo.value);
  loadBalancerCreateForm.value = {
    name: loadBalancerInfo.value.name,
    description: loadBalancerInfo.value.description,
    projectId: loadBalancerInfo.value.projectId,
    vipNetworkId: loadBalancerInfo.value.networkId,
    vipSubnetId: loadBalancerInfo.value.subnetId,
    vipAddress: loadBalancerInfo.value.address,
    listeners: [listenerCreateForm.value],
  };

  reviewInfo.value.loadBalancerName = loadBalancerInfo.value.name;
  reviewInfo.value.loadBalancerDescription = loadBalancerInfo.value.description;
  reviewInfo.value.projectName = loadBalancerInfo.value.projectName;
  reviewInfo.value.projectId = loadBalancerInfo.value.projectId;
  reviewInfo.value.subnetName = loadBalancerInfo.value.subnetName;
  reviewInfo.value.allocationPools = loadBalancerInfo.value.allocationPools;
});

// listenerInfo 값 변경 감지
watch(listenerInfo, () => {
  console.log(listenerInfo.value);
  listenerCreateForm.value = {
    name: listenerInfo.value.name,
    description: listenerInfo.value.description,
    protocol: listenerInfo.value.protocol,
    adminStateUp: listenerInfo.value.adminStateUp,
    protocolPort: listenerInfo.value.protocolPort,
    connectionLimit: listenerInfo.value.connectionLimit,
    timeoutClientData: listenerInfo.value.timeoutClientData,
    timeoutTcpInspect: listenerInfo.value.timeoutTcpInspect,
    timeoutMemberConnect: listenerInfo.value.timeoutMemberConnect,
    timeoutMemberData: listenerInfo.value.timeoutMemberData,
    allowedCidrs:
      listenerInfo.value.allowedCidrs.length > 0
        ? [listenerInfo.value.allowedCidrs]
        : undefined,
    insertHeaders: listenerInfo.value.insertHeaders,
    defaultPool: poolCreateForm.value,
  };

  reviewInfo.value.listenerName = listenerInfo.value.name;
  reviewInfo.value.listenerProtocol = listenerInfo.value.protocol;
  reviewInfo.value.protocolPort = listenerInfo.value.protocolPort;
  reviewInfo.value.connectionLimit = listenerInfo.value.connectionLimit;
});

// poolInfo 값 변경 감지
watch(poolInfo, () => {
  console.log(poolInfo.value);
  poolCreateForm.value = {
    name: poolInfo.value.name,
    description: poolInfo.value.description,
    protocol: poolInfo.value.protocol,
    lbAlgorithm: poolInfo.value.algorithm,
    sessionPersistence: poolInfo.value.sessionPersistence
      ? {
          type: poolInfo.value.sessionPersistence,
        }
      : undefined,
    tlsEnabled: poolInfo.value.tls,
    adminStateUp: poolInfo.value.adminStateUp,
    members: poolMemberCreateForm.value,
    healthMonitor: healthCheckCreateForm.value,
  };

  reviewInfo.value.poolName = poolInfo.value.name;
  reviewInfo.value.algorithm = poolInfo.value.algorithm;
  reviewInfo.value.sessionPersistence = poolInfo.value.sessionPersistence;
});

// poolMemberInfo 값 변경 감지
watch(poolMemberInfo, () => {
  console.log(poolMemberInfo.value);
  reviewInfo.value.poolMembers = [];
  poolMemberInfo.value.map((poolMem) => {
    poolMemberCreateForm.value.push({
      address: poolMem.fixedIp,
      protocolPort: poolMem.port,
      weight: poolMem.weight,
    });
    reviewInfo.value.poolMembers.push({
      portName: poolMem.name,
      fixedIp: poolMem.fixedIp,
      port: poolMem.port,
      weight: poolMem.weight,
    });
  });
});

// healthCheckInfo 값 변경 감지
watch(healthCheckInfo, () => {
  console.log(healthCheckInfo.value);
  healthCheckCreateForm.value = {
    name: healthCheckInfo.value.name,
    type: healthCheckInfo.value.type,
    maxRetries: healthCheckInfo.value.maxRetries,
    maxRetriesDown: healthCheckInfo.value.maxRetriesDown,
    delay: healthCheckInfo.value.delay,
    timeout: healthCheckInfo.value.timeout,
  };

  reviewInfo.value.healthCheckName = healthCheckInfo.value.name;
  reviewInfo.value.healthCheckType = healthCheckInfo.value.type;
  reviewInfo.value.maxRetries = healthCheckInfo.value.maxRetries;
  reviewInfo.value.maxRetriesDown = healthCheckInfo.value.maxRetriesDown;
  reviewInfo.value.delay = healthCheckInfo.value.delay;
  reviewInfo.value.timeout = healthCheckInfo.value.timeout;
});
watch(healthCheckTimeout, () => {
  validationSchema.value.healthCheck.delay = {
    conInputOnlyNaturalNumber: String,
    conInputGreaterThanOrEqualTo: healthCheckTimeout.value,
  };
});

const validationSchema = ref<any>({
  loadBalancer: {
    // 작성 순서로 유효성 체크 우선 순위 결정 됨.
    name: {
      conInputRequired: t('common.column.name'),
    },
    description: { conInputMaxText: 40 },
    project: { conMultipleSelectRequired: t('common.content.project') },
    // network: { conMultipleSelectRequired: t('common.content.network') },
    ipv4Address: { conInputIpv4: t('common.content.ip-address') },
    ipv6Address: { conInputIpv6: t('common.content.ip-address') },
  },
  listener: {
    name: {
      conInputRequired: t('common.column.name'),
    },
    description: { conInputMaxText: 40 },
    protocolPort: {
      conInputRequired: '리스너 프로토콜 포트',
      conInputOnlyNaturalNumber: String,
    },
    connectionLimit: {
      conInputRequired: '리스너 연결 제한',
      // conInputOnlyNaturalNumber: String,
    },
    timeoutClientData: { conInputOnlyNaturalNumber: String },
    timeoutTcpInspect: { conInputOnlyNaturalNumber: String },
    timeoutMemberConnect: { conInputOnlyNaturalNumber: String },
    timeoutMemberData: { conInputOnlyNaturalNumber: String },
    allowedCidrs: { conInputIpv4Cidr: String },
  },
  pool: {
    name: {
      conInputRequired: t('common.column.name'),
    },
    description: { conInputMaxText: 40 },
  },
  healthCheck: {
    name: {
      conInputRequired: t('common.column.name'),
    },
    maxRetries: {
      conInputRequired: 'Max Retries',
      conInputOnlyNaturalNumber: String,
      conInputGreaterThan: 0,
    },
    maxRetriesDown: {
      conInputRequired: 'Max Retries Down',
      conInputOnlyNaturalNumber: String,
      conInputGreaterThan: 0,
    },
    delay: {
      conInputOnlyNaturalNumber: String,
    },
    timeout: {
      conInputOnlyNaturalNumber: String,
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
    validate(createLoadBalancerForm);
  } else if (current.value === 1) {
    validate(createListenerForm);
  } else if (current.value === 2) {
    validate(createPoolForm);
  } else if (current.value === 3) {
    validate(createPoolMemberForm);
  } else if (current.value === 4) {
    validate(createHealthCheckForm);
  }
};

const validate = (createForm: any) => {
  createForm.validate().then((res: any) => {
    if (res.valid) {
      nextStep();
    }
  });
};

const createResource = () => {
  poolCreateForm.value.members = poolMemberCreateForm.value;
  poolCreateForm.value.healthMonitor = healthCheckCreateForm.value;
  listenerCreateForm.value.defaultPool = poolCreateForm.value;
  loadBalancerCreateForm.value.listeners[0] = listenerCreateForm.value;
  createLoadBalancer(loadBalancerCreateForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.load-balancer'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.load-balancer'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByName(router, 'load-balancer');
    });
};
</script>

<style lang="scss" scoped></style>
