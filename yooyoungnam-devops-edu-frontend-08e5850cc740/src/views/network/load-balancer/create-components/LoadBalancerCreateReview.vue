<template>
  <div class="head-title-wrapper">
    <h3 class="heading-sub-title">
      {{ t('message.create.step-info.review.title') }}
    </h3>
    <p class="description">
      {{
        t('message.create.step-info.review.description', {
          data: t('common.content.load-balancer'),
        })
      }}
    </p>
  </div>

  <BasicInfo
    :title="t('common.content.load-balancer')"
    :basic-info-data="props.reviewInfo"
    :basic-info-columns="loadBalancerInfoColumns"
  >
    <template #allocationPools>
      <span
        class="txt"
        v-for="(pool, idx) in props.reviewInfo?.allocationPools"
        v-bind:key="idx"
      >
        {{ `${pool.start} ~ ${pool.end}` }}
        {{ idx < props.reviewInfo?.allocationPools.length - 1 ? ', ' : '' }}
      </span>
    </template>
  </BasicInfo>

  <BasicInfo
    :title="t('common.content.listener')"
    :basic-info-data="props.reviewInfo"
    :basic-info-columns="listenerInfoColumns"
  />

  <BasicInfo
    :title="t('common.content.pool')"
    :basic-info-data="props.reviewInfo"
    :basic-info-columns="poolInfoColumns"
  />

  <!-- 풀 멤버의 경우 다중 선택 값 -->
  <div class="basic-info">
    <a-collapse
      v-model:activeKey="detailOptionActiveKey"
      expandIconPosition="right"
    >
      <a-collapse-panel key="1" :header="t('common.content.pool-member')">
        <a-card :bordered="false">
          <ul class="list-area">
            <template
              v-for="(poolMem, i) in props.reviewInfo.poolMembers"
              v-bind:key="i"
            >
              <li
                class="item"
                v-for="(col, idx) in poolMemberInfoColumns"
                v-bind:key="idx"
              >
                <strong class="title">{{ t(col.title) }}</strong>
                <div class="information">
                  <span
                    v-if="col.dataType === 'string' && col.convertFunc"
                    class="txt"
                    >{{
                      col.convertFunc(poolMem[col.dataIndex], poolMem)
                    }}</span
                  >
                  <span
                    v-else-if="
                      col.dataType === 'string' || col.dataType === 'number'
                    "
                    class="txt"
                    >{{
                      poolMem[col.dataIndex] ? poolMem[col.dataIndex] : '-'
                    }}</span
                  >
                </div>
              </li>
            </template>
          </ul>
        </a-card>
      </a-collapse-panel>
    </a-collapse>
  </div>

  <BasicInfo
    :title="t('common.content.health-check')"
    :basic-info-data="props.reviewInfo"
    :basic-info-columns="healthCheckInfoColumns"
  />
</template>

<script lang="ts" setup>
import { defineProps, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { LoadBalancerReviewInfoType } from '@/types/network/load-balancer/LoadBalancerCreateType';
import { InfoColumnType } from '@/types/common/InfoColumnType';
import BasicInfo from '@/components/details/BasicInfo.vue';

const props = defineProps({
  reviewInfo: {
    type: Object as () => LoadBalancerReviewInfoType,
    required: true,
  },
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const detailOptionActiveKey = ref(1);

const loadBalancerInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.load-balancer',
    dataIndex: 'loadBalancerName',
    dataType: 'string',
  },
  {
    title: 'common.column.description',
    dataIndex: 'loadBalancerDescription',
    dataType: 'string',
  },
  {
    title: 'common.column.detail-info-name.project',
    dataIndex: 'projectName',
    dataType: 'string',
  },
  {
    title: 'common.column.project-id',
    dataIndex: 'projectId',
    dataType: 'string',
  },
  {
    title: 'common.column.subnet',
    dataIndex: 'subnetName',
    dataType: 'string',
  },
  {
    title: 'common.column.allocation-pool',
    dataIndex: 'allocationPools',
    dataType: 'others',
  },
  // {
  //   title: 'common.column.ip-address',
  //   dataIndex: 'address',
  //   dataType: 'others',
  // },
];

const listenerInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.listener',
    dataIndex: 'listenerName',
    dataType: 'string',
  },
  {
    title: 'common.column.listener-protocol',
    dataIndex: 'listenerProtocol',
    dataType: 'string',
  },
  {
    title: 'common.column.protocol-port',
    dataIndex: 'protocolPort',
    dataType: 'number',
  },
  {
    title: 'common.column.connection-limit',
    dataIndex: 'connectionLimit',
    dataType: 'number',
  },
];

const poolInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.pool',
    dataIndex: 'poolName',
    dataType: 'string',
  },
  {
    title: 'common.column.algorithm',
    dataIndex: 'algorithm',
    dataType: 'string',
  },
  {
    title: 'common.column.session-persistence',
    dataIndex: 'sessionPersistence',
    dataType: 'string',
  },
];

const poolMemberInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.port',
    dataIndex: 'portName',
    dataType: 'string',
    convertFunc: (name: string) => {
      return name ? name : '(No Name)';
    },
  },
  {
    title: 'common.column.fixed-ip',
    dataIndex: 'fixedIp',
    dataType: 'string',
  },
  {
    title: 'common.column.port',
    dataIndex: 'port',
    dataType: 'number',
  },
  {
    title: 'common.column.weight',
    dataIndex: 'weight',
    dataType: 'number',
  },
];

const healthCheckInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.health-check',
    dataIndex: 'healthCheckName',
    dataType: 'string',
  },
  {
    title: 'common.column.health-check-type',
    dataIndex: 'healthCheckType',
    dataType: 'string',
  },
  {
    title: 'Max Retries',
    dataIndex: 'maxRetries',
    dataType: 'number',
  },
  {
    title: 'Max Retries Down',
    dataIndex: 'maxRetriesDown',
    dataType: 'number',
  },
  {
    title: 'common.column.delay',
    dataIndex: 'delay',
    dataType: 'number',
  },
  {
    title: 'common.column.timeout',
    dataIndex: 'timeout',
    dataType: 'number',
  },
];
</script>

<style lang="scss" scoped></style>
