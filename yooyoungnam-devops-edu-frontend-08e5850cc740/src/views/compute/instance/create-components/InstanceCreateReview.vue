<template>
  <div class="head-title-wrapper">
    <h3 class="heading-sub-title">
      {{ t('message.create.step-info.review.title') }}
    </h3>
    <p class="description">
      {{
        t('message.create.step-info.review.description', {
          data: t('common.content.instance'),
        })
      }}
    </p>
  </div>

  <BasicInfo
    :title="t('common.content.basic-information')"
    :basic-info-data="props.reviewInfo"
    :basic-info-columns="basicInfoColumns"
  />

  <BasicInfo
    :title="t('common.content.instance-source')"
    :basic-info-data="props.reviewInfo"
    :basic-info-columns="instanceSourceInfoColumns"
  />

  <BasicInfo
    :title="t('common.content.flavor')"
    :basic-info-data="props.reviewInfo"
    :basic-info-columns="flavorInfoColumns"
  />

  <BasicInfo
    :title="t('common.content.network')"
    :basic-info-data="props.reviewInfo"
    :basic-info-columns="networkInfoColumns"
  />

  <BasicInfo
    :title="t('common.content.security')"
    :basic-info-data="props.reviewInfo"
    :basic-info-columns="securityInfoColumns"
  >
    <template #securityGroup>
      <div class="txt list-pre">
        {{
          nullConverter(changeArrayFormat(props.reviewInfo?.securityGroupNames))
        }}
      </div>
    </template>
  </BasicInfo>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  bytesToGibConverter,
  changeArrayFormat,
  gibConverter,
  nullConverter,
} from '@/utils/Converter';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { InfoColumnType } from '@/types/common/InfoColumnType';
import BasicInfo from '@/components/details/BasicInfo.vue';

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const props = defineProps({
  server: Object,
  reviewInfo: Object,
});

const basicInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.instance',
    dataIndex: 'instanceName',
    dataType: 'string',
  },
  {
    title: 'common.column.description',
    dataIndex: 'instanceDescription',
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
    isCopyable: true,
  },
];

const instanceSourceInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.image',
    dataIndex: 'imageName',
    dataType: 'string',
  },
  {
    title: 'common.column.size',
    dataIndex: 'imageSize',
    dataType: 'number',
    convertFunc: bytesToGibConverter,
  },
  {
    title: 'common.column.visibility',
    dataIndex: 'imageVisibility',
    dataType: 'string',
  },
  {
    title: 'common.column.volume',
    dataIndex: 'volumeSize',
    dataType: 'number',
    convertFunc: gibConverter,
  },
  {
    title: 'common.column.delete-on-termination',
    dataIndex: 'deleteOnTermination',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
];

const flavorInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.flavor',
    dataIndex: 'flavorName',
    dataType: 'string',
  },
  {
    title: 'common.column.vcpu',
    dataIndex: 'flavorVCPU',
    dataType: 'number',
  },
  {
    title: 'common.column.root-disk',
    dataIndex: 'flavorRootDisk',
    dataType: 'number',
    convertFunc: gibConverter,
  },
];

const networkInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.network',
    dataIndex: 'networkName',
    dataType: 'string',
  },
  {
    title: 'common.column.subnet',
    dataIndex: 'subnetCount',
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
];

const securityInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.security-group',
    dataIndex: 'securityGroup',
    dataType: 'others',
  },
  {
    title: 'common.column.detail-info-name.key-pair',
    dataIndex: 'keypairName',
    dataType: 'string',
  },
];
</script>

<style lang="scss" scoped></style>
