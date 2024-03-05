<template>
  <BasicOverviewInfo
    v-if="props.detailInfoData"
    :is-loading="props.isLoading"
    :title="t('common.content.basic-information')"
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
import {
  coreConverter,
  gibConverter,
  mibToGibConverter,
} from '@/utils/Converter';
import { FlavorType } from '@/types/compute/flavor/FlavorListType';

const props = defineProps({
  detailInfoData: {
    type: Object as () => FlavorType,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const detailInfoBasicInfoColumns: InfoColumnType[] = [
  {
    title: 'vCPUs',
    dataIndex: 'vcpus',
    dataType: 'number',
    convertFunc: coreConverter,
  },
  {
    title: 'common.column.memory',
    dataIndex: 'ram',
    dataType: 'number',
    convertFunc: mibToGibConverter,
  },
  // {
  //   title: 'common.column.root-disk',
  //   dataIndex: 'rootDisk',
  //   dataType: 'number',
  //   convertFunc: gibConverter,
  // },
  {
    title: 'common.column.is-public',
    dataIndex: 'osFlavorAccessIsPublic',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
];
</script>

<style lang="scss" scoped></style>
