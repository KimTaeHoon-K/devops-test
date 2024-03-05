<template>
  <a-card title="최근 로그" class="latest-log-list">
    <ul class="log-list">
      <li class="item" v-for="item in props.latestLogList" :key="item.title">
        <span>
          <img
            :src="require(`@/assets/images/icon/icon-${item.type}.svg`)"
            alt=""
          />
        </span>
        {{ item.title }}
      </li>
    </ul>
  </a-card>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue';
import { LatestLogType } from '@/types/dashboard/DashboardType';
const props = defineProps({
  latestLogList: {
    type: Array as () => LatestLogType[],
    required: true,
  },
});
</script>
<style lang="scss" scoped></style>
