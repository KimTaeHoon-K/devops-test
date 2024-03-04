<template>
  <BasicOverviewInfo
    v-if="props.detailInfoData"
    :is-loading="props.isLoading"
    :title="t('common.content.basic-information')"
    :basic-info-columns="detailInfoBasicInfoColumns"
    :basic-info-data="props.detailInfoData"
  />
  <BasicOverviewInfo
    v-if="props.detailInfoData"
    :is-loading="props.isLoading"
    :title="t('common.content.connection-info')"
    :basic-info-columns="detailInfoConnInfoColumns"
    :basic-info-data="props.detailInfoData"
  >
    <template #instanceName>
      <span class="txt" v-if="!props.detailInfoData?.instanceName"> - </span>
      <span class="txt" v-else>
        {{
          props.detailInfoData.instanceName !== '-'
            ? props.detailInfoData.instanceName
            : '삭제된 인스턴스'
        }}
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
import {
  bytesToGibConverter,
  gbToGibConverter,
  mbToGibConverter,
} from '@/utils/Converter';
import { InstanceSnapshotType } from '@/types/compute/instance-snapshot/InstanceSnapshotListType';

const props = defineProps({
  detailInfoData: {
    type: Object as () => InstanceSnapshotType,
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
    title: 'common.column.capacity',
    dataIndex: 'size',
    dataType: 'number',
    convertFunc: bytesToGibConverter,
  },
  {
    title: 'common.column.min-system-disk',
    dataIndex: 'minDisk',
    dataType: 'number',
    convertFunc: gbToGibConverter,
  },
  {
    title: 'common.column.min-memory',
    dataIndex: 'minRam',
    dataType: 'number',
    convertFunc: mbToGibConverter,
  },
  {
    title: 'common.column.disk-format',
    dataIndex: 'diskFormat',
    dataType: 'string',
  },
  {
    title: 'common.column.container-format',
    dataIndex: 'containerFormat',
    dataType: 'string',
  },
  {
    title: 'common.column.visibility',
    dataIndex: 'visibility',
    dataType: 'string',
  },
  {
    title: 'common.column.is-protected',
    dataIndex: 'isProtected',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
  {
    title: 'Checksum',
    dataIndex: 'checksum',
    dataType: 'string',
    isCopyable: true,
  },
];

const detailInfoConnInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.origin-instance',
    dataIndex: 'instanceName',
    dataType: 'others',
  },
];
</script>

<style lang="scss" scoped></style>
