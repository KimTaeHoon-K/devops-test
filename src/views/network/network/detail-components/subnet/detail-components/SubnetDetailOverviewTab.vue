<template>
  <BasicOverviewInfo
    v-if="props.detailInfoData"
    :is-loading="props.isLoading"
    :title="t('common.content.network-information')"
    :basic-info-columns="detailInfoNetworkInfoColumns"
    :basic-info-data="props.detailInfoData"
  >
    <template #networkName v-if="props.detailInfoData?.networkIpAvailability">
      <span class="txt">
        {{ props.detailInfoData?.networkIpAvailability.networkName }}
      </span>
    </template>
  </BasicOverviewInfo>
  <BasicOverviewInfo
    v-if="props.detailInfoData"
    :is-loading="props.isLoading"
    :title="t('common.content.basic-information')"
    :basic-info-columns="detailInfoBasicInfoColumns"
    :basic-info-data="props.detailInfoData"
  >
    <template #allocationPools>
      <span
        v-if="props.detailInfoData?.allocationPools?.length === 0"
        class="txt"
      >
        -
      </span>
      <span
        class="txt"
        v-for="(pool, idx) in props.detailInfoData?.allocationPools"
        v-bind:key="idx"
      >
        {{ pool.start }} ~ {{ pool.end }}
      </span>
    </template>
    <template #dnsNameservers>
      <span
        v-if="props.detailInfoData?.dnsNameservers?.length === 0"
        class="txt"
      >
        -
      </span>
      <span
        class="txt"
        v-for="(dns, idx) in props.detailInfoData?.dnsNameservers"
        v-bind:key="idx"
      >
        {{ dns }}
      </span>
    </template>
  </BasicOverviewInfo>
  <BasicOverviewInfo
    v-if="props.detailInfoData?.networkIpAvailability"
    :is-loading="props.isLoading"
    :title="t('common.content.ip-information')"
    :basic-info-columns="detailInfoIpInfoColumns"
    :basic-info-data="props.detailInfoData?.networkIpAvailability"
  />
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { InfoColumnType } from '@/types/common/InfoColumnType';
import { SubnetType } from '@/types/network/network/subnet/SubnetListType';
import BasicOverviewInfo from '@/components/details/BasicOverviewInfo.vue';

const props = defineProps({
  detailInfoData: {
    type: Object as () => SubnetType,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const detailInfoNetworkInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.network',
    dataIndex: 'networkName',
    dataType: 'others',
  },
  {
    title: 'common.column.network-id',
    dataIndex: 'networkId',
    dataType: 'string',
    isCopyable: true,
  },
  {
    title: 'common.column.vnic-type',
    dataIndex: 'vnicType',
    dataType: 'string',
  },
];

const detailInfoBasicInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.gateway-ip',
    dataIndex: 'gatewayIp',
    dataType: 'string',
  },
  {
    title: 'common.column.allocation-pool',
    dataIndex: 'allocationPools',
    dataType: 'others',
  },
  {
    title: 'common.column.enabled-dhcp',
    dataIndex: 'enableDhcp',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
  {
    title: 'common.column.host-route',
    dataIndex: 'hostRoutes',
    dataType: 'string',
  },
  {
    title: 'common.column.dns-nameserver',
    dataIndex: 'dnsNameservers',
    dataType: 'others',
  },
];

const detailInfoIpInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.total-ip',
    dataIndex: 'totalIps',
    dataType: 'number',
  },
  {
    title: 'common.column.used-ip',
    dataIndex: 'usedIps',
    dataType: 'number',
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
