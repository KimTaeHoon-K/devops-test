<template>
  <BasicOverviewInfo
    v-if="props.detailInfoData"
    :is-loading="props.isLoading"
    :title="t('common.content.basic-information')"
    :basic-info-columns="detailInfoBasicInfoColumns"
    :basic-info-data="props.detailInfoData"
  >
    <!-- slot name 과 같은 이름으로 # 에 설정 해주면 해당 내용 slot 에 전달 -->
    <template #availabilityZones>
      <span
        v-if="props.detailInfoData?.availabilityZones?.length === 0"
        class="txt"
      >
        -
      </span>
      <span
        v-for="(avz, idx) in props.detailInfoData?.availabilityZones"
        v-bind:key="idx"
        class="txt"
      >
        {{ avz }}
        {{
          idx < props.detailInfoData?.availabilityZones.length - 1 ? ', ' : ''
        }}
      </span>
    </template>
    <template #availabilityZoneHints>
      <span
        v-if="props.detailInfoData?.availabilityZoneHints?.length === 0"
        class="txt"
      >
        -
      </span>
      <span
        v-for="(avzh, idx) in props.detailInfoData?.availabilityZoneHints"
        v-bind:key="idx"
        class="txt"
      >
        {{ avzh }}
        {{
          idx < props.detailInfoData?.availabilityZoneHints.length - 1
            ? ', '
            : ''
        }}
      </span>
    </template>
    <template #totalIps>
      <span class="txt">
        {{ props.detailInfoData?.networkIpAvailability?.totalIps }}
      </span>
    </template>
    <template #usedIps>
      <span class="txt">
        {{ props.detailInfoData?.networkIpAvailability?.usedIps }}
      </span>
    </template>
  </BasicOverviewInfo>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { InfoColumnType } from '@/types/common/InfoColumnType';
import BasicOverviewInfo from '@/components/details/BasicOverviewInfo.vue';

const props = defineProps({
  detailInfoData: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const detailInfoBasicInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.availability-zone',
    dataIndex: 'availabilityZones',
    dataType: 'others',
  },
  {
    title: 'Availability Zone Hint',
    dataIndex: 'availabilityZoneHints',
    dataType: 'others',
  },
  {
    title: 'MTU',
    dataIndex: 'mtu',
    dataType: 'number',
  },
  {
    title: 'common.column.router-external',
    dataIndex: 'routerExternal',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
  {
    title: 'common.column.provider-network-type',
    dataIndex: 'providerNetworkType',
    dataType: 'string',
  },
  {
    title: 'common.column.provider-physical-network',
    dataIndex: 'providerPhysicalNetwork',
    dataType: 'string',
  },
  // {
  //   title: 'common.column.segmentation-id',
  //   dataIndex: 'providerSegmentationId',
  //   dataType: 'number',
  // },
  {
    title: 'common.column.port-security',
    dataIndex: 'portSecurityEnabled',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
  {
    title: 'common.column.total-ip',
    dataIndex: 'totalIps',
    dataType: 'others',
  },
  {
    title: 'common.column.used-ip',
    dataIndex: 'usedIps',
    dataType: 'others',
  },
];

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});
</script>

<style lang="scss" scoped></style>
