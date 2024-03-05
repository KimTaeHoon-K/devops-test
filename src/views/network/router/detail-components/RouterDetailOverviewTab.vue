<template>
  <BasicOverviewInfo
    :is-loading="props.isLoading"
    :title="t('common.content.external-network-information')"
    :basic-info-columns="detailInfoBasicInfoColumns"
    :basic-info-data="routerDetailInfoData"
  >
    <!-- slot name 과 같은 이름으로 # 에 설정 해주면 해당 내용 slot 에 전달 -->
    <template #externalFixedIps>
      <span
        v-if="routerDetailInfoData?.externalFixedIps?.length === 0"
        class="txt"
      >
        -
      </span>
      <span
        v-for="(fixedIp, idx) in routerDetailInfoData?.externalFixedIps"
        v-bind:key="idx"
        class="txt"
      >
        {{ fixedIp.ipAddress }}
        {{
          idx < routerDetailInfoData?.externalFixedIps.length - 1 ? ', ' : ''
        }}
      </span>
    </template>
  </BasicOverviewInfo>
</template>

<script lang="ts" setup>
import { defineProps, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { InfoColumnType } from '@/types/common/InfoColumnType';
import BasicOverviewInfo from '@/components/details/BasicOverviewInfo.vue';
import { ExternalGateWayInfoType } from '@/types/network/common/NetworkCommonType';

const props = defineProps({
  detailInfoData: {
    type: Object as () => ExternalGateWayInfoType,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const routerDetailInfoData = ref<ExternalGateWayInfoType>(
  {} as ExternalGateWayInfoType
);
const detailInfoToRouterDetailInfo = () => {
  if (props.detailInfoData) {
    routerDetailInfoData.value = props.detailInfoData;
  } else {
    routerDetailInfoData.value.enableSnat = false;
    routerDetailInfoData.value.networkId = '';
    routerDetailInfoData.value.externalFixedIps = [];
  }
};

watch(props, () => {
  detailInfoToRouterDetailInfo();
});

const detailInfoBasicInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.detail-info-name.network',
    dataIndex: 'networkName',
    dataType: 'string',
  },
  {
    title: 'common.column.network-id',
    dataIndex: 'networkId',
    dataType: 'string',
    isCopyable: true,
  },
  {
    title: 'common.column.enable-snat',
    dataIndex: 'enableSnat',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
  {
    title: 'common.column.external-fixed-ip',
    dataIndex: 'externalFixedIps',
    dataType: 'others',
  },
];

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

onMounted(() => {
  detailInfoToRouterDetailInfo();
});
</script>

<style lang="scss" scoped></style>
