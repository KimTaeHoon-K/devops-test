<template>
  <a-card title="서비스 현황" class="service-list">
    <ul>
      <li
        class="item"
        v-for="serviceStatus in serviceStatusList"
        :key="serviceStatus"
      >
        <a-card
          :title="serviceNameToTitle(serviceStatus.serviceName)"
          :bordered="false"
        >
          <a-row :gutter="16" justify="space-between">
            <a-col class="box up" :span="11">
              <div class="area">
                <span class="number">{{ serviceStatus.up }}</span>
                <span class="title">Up</span>
              </div>
            </a-col>
            <a-col class="box down" :span="13">
              <div class="area">
                <span class="number">{{ serviceStatus.down }}</span>
                <span class="title">Down</span>
              </div>
            </a-col>
          </a-row>
        </a-card>
      </li>
    </ul>
  </a-card>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue';
import { ServiceStatusType } from '@/types/dashboard/DashboardType';
const props = defineProps({
  serviceStatusList: {
    type: Array as () => ServiceStatusType[],
    required: true,
  },
});

const serviceNameToTitle = (str: string) => {
  return str
    .replace(/[A-Z]/, (char) => '-'.concat(char))
    .replace(/^[a-z]/, (char) => char.toUpperCase())
    .concat(' Service');
};
</script>
<style lang="scss" scoped></style>
