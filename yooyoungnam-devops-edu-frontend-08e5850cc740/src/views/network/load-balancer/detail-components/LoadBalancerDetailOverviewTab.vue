<template>
  <BasicOverviewInfo
    v-if="props.detailInfoData"
    :is-loading="props.isLoading"
    :title="t('common.content.network-information')"
    :basic-info-columns="detailInfoBasicInfoColumns"
    :basic-info-data="props.detailInfoData"
  />
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
    title: 'common.column.detail-info-name.network',
    dataIndex: 'vipNetworkName',
    dataType: 'string',
  },
  {
    title: 'common.column.detail-info-name.subnet',
    dataIndex: 'vipSubnetName',
    dataType: 'string',
  },
  {
    title: 'common.column.allocation-ip',
    dataIndex: 'vipAddress',
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
