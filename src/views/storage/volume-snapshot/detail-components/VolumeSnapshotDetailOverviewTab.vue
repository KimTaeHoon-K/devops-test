<template>
  <BasicOverviewInfo
    v-if="props.detailInfoData"
    :is-loading="props.isLoading"
    :title="t('common.content.snapshot-source')"
    :basic-info-columns="detailInfoSnapshotSourceColumns"
    :basic-info-data="props.detailInfoData"
  />
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import BasicOverviewInfo from '@/components/details/BasicOverviewInfo.vue';
import { InfoColumnType } from '@/types/common/InfoColumnType';
import { VolumeSnapshotType } from '@/types/storage/volume-snapshot/VolumeSnapshotListType';

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

const detailInfoSnapshotSourceColumns: InfoColumnType[] = [
  {
    title: 'common.column.volume',
    dataIndex: 'volumeName',
    dataType: 'string',
    convertFunc: (str: string, basicInfoData: VolumeSnapshotType) => {
      if (str && str.length > 0) {
        return str;
      } else {
        return '(No name) / ' + basicInfoData.id;
      }
    },
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
