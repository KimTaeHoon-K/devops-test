<template>
  <BasicOverviewInfo
    :title="t('common.content.flavor')"
    :basic-info-columns="detailInfoFlavorColumns"
    :basic-info-data="props.detailInfoData.flavor"
    :is-loading="props.isLoading"
  />
  <BasicOverviewInfo
    :title="t('common.content.instance-source')"
    v-if="props.detailInfoData.image"
    :basic-info-columns="detailInfoImageColumns"
    :basic-info-data="props.detailInfoData.image"
    :is-loading="props.isLoading"
  />
  <BasicOverviewInfo
    v-if="props.detailInfoData.storage[0]?.systemDisks[0]"
    :title="t('common.content.instance-source')"
    :basic-info-data="props.detailInfoData.storage[0]?.systemDisks[0]"
    :basic-info-columns="detailInfoVolumeColumns"
    :is-loading="props.isLoading"
  />
  <BasicOverviewInfo
    :title="t('common.content.network')"
    :basic-info-data="props.detailInfoData?.network"
    :basic-info-columns="detailInfoNetworkColumns"
    :is-loading="props.isLoading"
  >
    <template #networksName>
      <span
        class="txt"
        v-for="network in props.detailInfoData?.network?.addresses"
        v-bind:key="network"
      >
        {{ network.networkName }}
        <br />
      </span>
    </template>
    <template #subnetsAddr>
      <span
        class="txt"
        v-for="network in props.detailInfoData?.network?.addresses"
        v-bind:key="network"
      >
        {{ network.addr }}
        <br />
      </span>
    </template>
  </BasicOverviewInfo>
  <BasicOverviewInfo
    :title="t('common.content.security')"
    :basic-info-columns="detailInfoSecurityColumns"
    :basic-info-data="props.detailInfoData"
    :is-loading="props.isLoading"
  >
    <template #securityGroups>
      <span
        class="txt"
        v-for="securityGroup in props.detailInfoData?.securityGroups"
        v-bind:key="securityGroup"
      >
        {{ securityGroup.name }}
        <br />
      </span>
    </template>
  </BasicOverviewInfo>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import {
  bytesToGibConverter,
  gibConverter,
  mibToGibConverter,
} from '@/utils/Converter';
import BasicOverviewInfo from '@/components/details/BasicOverviewInfo.vue';
import { InfoColumnType } from '@/types/common/InfoColumnType';

const props = defineProps({
  detailInfoData: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  detailInfoImageData: {
    type: Object,
  },
  detailInfoVolumeData: {
    type: Object,
  },
});

const detailInfoFlavorColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.flavor',
    dataIndex: 'originalName',
    dataType: 'string',
  },
  {
    title: 'vCPU',
    dataIndex: 'vcpus',
    dataType: 'number',
  },
  {
    title: 'common.column.memory',
    dataIndex: 'ram',
    dataType: 'number',
    convertFunc: mibToGibConverter,
  },
  {
    title: 'common.column.root-disk',
    dataIndex: 'disk',
    dataType: 'number',
    convertFunc: gibConverter,
  },
];

const detailInfoImageColumns: InfoColumnType[] = [
  {
    title: 'common.column.instance-source-type',
    dataIndex: 'type',
    dataType: 'string',
  },
  {
    title: 'common.column.detail-info-name.instance-source',
    dataIndex: 'name',
    dataType: 'string',
  },
  {
    title: 'Size',
    dataIndex: 'size',
    dataType: 'number',
    convertFunc: bytesToGibConverter,
  },
  {
    title: 'common.column.disk-format',
    dataIndex: 'diskFormat',
    dataType: 'string',
  },
];

const detailInfoVolumeColumns: InfoColumnType[] = [
  {
    title: 'common.column.instance-source-type',
    dataIndex: 'instanceSourceType',
    dataType: 'string',
  },
  {
    title: 'common.column.detail-info-name.instance-source',
    dataIndex: 'name',
    dataType: 'string',
  },
  {
    title: 'Size',
    dataIndex: 'size',
    dataType: 'number',
    convertFunc: gibConverter,
  },
];

const detailInfoNetworkColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.network',
    dataIndex: 'networksName',
    dataType: 'others',
  },
  {
    title: 'common.column.subnet-ip',
    dataIndex: 'subnetsAddr',
    dataType: 'others',
  },
];

const detailInfoSecurityColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.security-group',
    dataIndex: 'securityGroups',
    dataType: 'others',
  },
  {
    title: 'common.column.detail-info-name.key-pair',
    dataIndex: 'keyName',
    dataType: 'string',
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
