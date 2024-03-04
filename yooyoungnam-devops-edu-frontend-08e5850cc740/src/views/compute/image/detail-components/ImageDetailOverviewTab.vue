<template>
  <BasicOverviewInfo
    v-if="props.detailInfoData"
    :is-loading="props.isLoading"
    :title="t('common.content.basic-information')"
    :basic-info-columns="detailInfoBasicInfoColumns"
    :basic-info-data="props.detailInfoData"
  >
    <!-- slot name 과 같은 이름으로 # 에 설정 해주면 해당 내용 slot 에 전달 -->
    <template #os>
      <span class="txt">
        {{
          detailInfoData?.os
            ? detailInfoData?.os
            : detailInfoData?.osDistro
            ? osDistroToOs(detailInfoData?.osDistro)
            : 'Others'
        }}
      </span>
    </template>
  </BasicOverviewInfo>
  <BasicOverviewInfo
    v-if="props.detailInfoData"
    :is-loading="props.isLoading"
    :title="t('common.content.security-group-information')"
    :basic-info-columns="detailInfoSecurityGroupInfoColumns"
    :basic-info-data="props.detailInfoData"
  />
  <BasicOverviewInfo
    v-if="props.detailInfoData"
    :is-loading="props.isLoading"
    :title="t('common.content.custom-information')"
    :basic-info-columns="detailInfoCustomInfoColumns"
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
  bytesToGibConverter,
  gbToGibConverter,
  mbToGibConverter,
} from '@/utils/Converter';
import { ImageType } from '@/types/compute/image/ImageListType';

const props = defineProps({
  detailInfoData: {
    type: Object as () => ImageType,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
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
    title: 'common.column.shared-project',
    dataIndex: 'members',
    dataType: 'string',
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
    title: 'OS',
    dataIndex: 'os',
    dataType: 'others',
  },
  {
    title: 'OS Version',
    dataIndex: 'osVersion',
    dataType: 'string',
  },
  {
    title: 'common.column.container-format',
    dataIndex: 'containerFormat',
    dataType: 'string',
  },
];

const detailInfoSecurityGroupInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.owner',
    dataIndex: 'owner',
    dataType: 'string',
  },
  {
    title: 'common.column.detail-info-name.file',
    dataIndex: 'file',
    dataType: 'string',
    isCopyable: true,
  },
  {
    title: 'common.column.visibility',
    dataIndex: 'visibility',
    dataType: 'string',
  },
  {
    title: 'common.column.security',
    dataIndex: 'protected',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
  {
    title: 'common.column.duplicate-check',
    dataIndex: 'checksum',
    dataType: 'string',
    isCopyable: true,
  },
];

const detailInfoCustomInfoColumns: InfoColumnType[] = [
  {
    title: 'virtual_size',
    dataIndex: 'virtualSize',
    dataType: 'number',
    convertFunc: bytesToGibConverter,
  },
  {
    title: 'os_hidden',
    dataIndex: 'osHidden',
    dataType: 'boolean',
  },
  {
    title: 'os_hash_algo',
    dataIndex: 'osHashAlgo',
    dataType: 'string',
  },
  {
    title: 'os_hash_value',
    dataIndex: 'osHashValue',
    dataType: 'string',
  },
  {
    title: 'common.column.tag',
    dataIndex: 'tags',
    dataType: 'string',
  },
  {
    title: 'self',
    dataIndex: 'self',
    dataType: 'string',
  },
  {
    title: 'common.column.file-name',
    dataIndex: 'file',
    dataType: 'string',
    isCopyable: true,
  },
  {
    title: 'common.column.schema',
    dataIndex: 'schema',
    dataType: 'string',
  },
];

const osDistroToOs = (osDistro: string) => {
  if (osDistro === 'centos') {
    return 'CentOS';
  } else if (osDistro === 'coreos') {
    return 'CoreOS';
  } else if (osDistro === 'freebsd') {
    return 'FreeBSD';
  } else {
    return osDistro.replace(/^[a-z]/, (char) => char.toUpperCase());
  }
};

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});
</script>

<style lang="scss" scoped></style>
