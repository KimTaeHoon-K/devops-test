<template>
  <a-row :gutter="24" align="middle">
    <a-col :xl="5" :lg="24" :md="24" :sm="24" :xs="24">
      <div class="total-area">
        <p class="title">
          <strong>
            <img
              :src="
                require(`@/assets/images/icon/icon-${infraResourceType}.svg`)
              "
              alt=""
            />
            <span>{{ t(`common.content.${infraResourceType}`) }}</span>
          </strong>
        </p>
        <span class="number"
          ><span>{{ infraResourceCurrentData?.totalCount }}</span>
          <span>
            <span class="text">
              {{ infraResourceType === 'instance' ? ' 대 ' : ' 개 ' }}
            </span>
          </span>
        </span>
      </div>
    </a-col>
    <a-col :xl="19" :lg="24" :md="24" :sm="24" :xs="24">
      <a-row :gutter="12" align="middle" class="infra-resource-list">
        <template v-if="infraResourceCurrentData?.status">
          <a-col
            v-for="statusKey in Object.keys(
              setStatusOrder(infraResourceCurrentData?.status)
            )"
            :key="statusKey"
            :span="6"
            class="item"
          >
            <a-card :span="6" :bordered="false">
              <div class="box">
                <p>
                  <strong
                    class="title"
                    :class="statusCodeToStatusClass(statusKey)"
                    >{{ statusCodeToStatusName(statusKey) }}</strong
                  >
                </p>
                <span class="number">
                  <span>{{ infraResourceCurrentData?.status[statusKey] }}</span>
                  <span>
                    <span class="text">
                      {{ infraResourceType === 'instance' ? ' 대 ' : ' 개 ' }}
                    </span>
                  </span>
                </span>
              </div>
            </a-card>
          </a-col>
        </template>
      </a-row>
    </a-col>
  </a-row>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  InfraResourceType,
  InfraResourceInstanceStatusType,
  InfraResourceNetworkStatusType,
  InfraResourceVolumeStatusType,
} from '@/types/dashboard/DashboardType';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';

const props = defineProps({
  infraResourceType: {
    type: String,
    required: true,
  },
  infraResourceCurrentData: {
    type: Object as () => InfraResourceType<
      | InfraResourceInstanceStatusType
      | InfraResourceNetworkStatusType
      | InfraResourceVolumeStatusType
    >,
    required: true,
  },
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

// 상태 순서
// TODO: 리팩토링..?
const setStatusOrder = (
  status:
    | InfraResourceInstanceStatusType
    | InfraResourceNetworkStatusType
    | InfraResourceVolumeStatusType
) => {
  let statusMap = new Map<string, number>();
  let statusOrder = [] as string[];
  let resourceStatus = {} as any;
  if (props.infraResourceType === 'instance') {
    resourceStatus = status as InfraResourceInstanceStatusType;
    statusOrder = ['error', 'active', 'stopped', 'paused'];
  } else if (props.infraResourceType === 'network') {
    resourceStatus = status as InfraResourceNetworkStatusType;
    statusOrder = ['error', 'active', 'down', 'build'];
  } else if (props.infraResourceType === 'volume') {
    resourceStatus = status as InfraResourceVolumeStatusType;
    statusOrder = ['error', 'available', 'inUse', 'deleting'];
  }
  statusOrder.forEach((order) => {
    statusMap.set(order, resourceStatus[order]);
  });
  return Object.fromEntries(statusMap);
};

const statusCodeToStatusName = (str: string) => {
  return str
    .replace(/[A-Z]/, (char) => '-'.concat(char))
    .replace(/^[a-z]/, (char) => char.toUpperCase());
};
const statusCodeToStatusClass = (str: string) => {
  return str.replace(/[A-Z]/, (char) => '-'.concat(char.toLowerCase()));
};
</script>
<style lang="scss" scoped></style>
