<template>
  <BasicOverviewInfo
    v-if="props.detailInfoData"
    :is-loading="props.isLoading"
    :title="t('common.content.connection-info')"
    :basic-info-columns="detailInfoConnInfoColumns"
    :basic-info-data="props.detailInfoData"
  >
    <template #attachments>
      <span class="txt" v-if="props.detailInfoData?.attachments?.length === 0">
        -
      </span>
      <span class="txt" v-else>
        <template
          v-for="attachment in props.detailInfoData?.attachments"
          v-bind:key="attachment"
        >
          {{
            attachment.device +
            ' on ' +
            (attachment.serverName ? attachment.serverName : '삭제된 인스턴스')
          }}
          <br />
        </template>
      </span>
    </template>
  </BasicOverviewInfo>
  <BasicOverviewInfo
    v-if="props.detailInfoData?.volumeImageMetadata"
    :is-loading="props.isLoading"
    :title="t('common.content.volume-source')"
    :basic-info-columns="detailInfoVolumeSourceImageColumns"
    :basic-info-data="props.detailInfoData?.volumeImageMetadata"
  />
  <BasicOverviewInfo
    v-else
    :is-loading="props.isLoading"
    :title="t('common.content.volume-source')"
    :basic-info-columns="detailInfoVolumeSourceSnapshotColumns"
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
import { VolumeType } from '@/types/storage/volume/VolumeListType';

const props = defineProps({
  detailInfoData: {
    type: Object as () => VolumeType,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const detailInfoConnInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.instance',
    dataIndex: 'attachments',
    dataType: 'others',
  },
];

const detailInfoVolumeSourceImageColumns: InfoColumnType[] = [
  {
    title: 'common.column.image',
    dataIndex: 'imageName',
    dataType: 'string',
  },
];

const detailInfoVolumeSourceSnapshotColumns: InfoColumnType[] = [
  {
    title: 'common.column.volume-snapshot',
    dataIndex: 'snapshotName',
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
