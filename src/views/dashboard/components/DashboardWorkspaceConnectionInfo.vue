<template>
  <a-card class="info-box">
    <a-space class="space-block" direction="vertical" :size="SizeConst.twelve">
      <a-card class="info-title">
        <div>
          <img src="@/assets/images/icon/icon-provider.svg" alt="" />
          <span>{{ workspaceConnectionInfo?.providerName }}</span>
        </div>
      </a-card>
      <a-card class="box" :bordered="false">
        <a-row :gutter="16" justify="space-between">
          <a-col><gold-outlined /> 총 프로젝트 </a-col>
          <a-col
            ><span class="number">{{
              workspaceConnectionInfo?.totalProject
            }}</span
            >개
          </a-col>
        </a-row>
      </a-card>
      <a-card class="box" :bordered="false">
        <a-row :gutter="16" justify="space-between">
          <a-col class="workspace-name">
            <link-outlined />
            <span>워크스페이스 연동</span>
          </a-col>
          <a-col
            ><span class="number">{{
              workspaceConnectionInfo?.connectedCount
            }}</span
            >개
          </a-col>
        </a-row>
      </a-card>
      <a-card class="box" :bordered="false">
        <a-row :gutter="16" justify="space-between">
          <a-col class="workspace-name">
            <span><disconnect-outlined /> 워크스페이스 미연동</span>
          </a-col>
          <a-col
            ><span class="number">{{
              workspaceConnectionInfo?.unconnectedCount
            }}</span
            >개
          </a-col>
        </a-row>
      </a-card>
      <ul
        class="grid-basic project-list"
        v-if="workspaceConnectionInfo?.projectList?.length > 0"
      >
        <li
          class="grid-basic item"
          v-for="project in workspaceConnectionInfo?.projectList"
          :key="project.projectId"
        >
          <span class="title">{{ project.projectName }}</span>
          <span class="sub-title">{{ project.workspaceName }}</span>
        </li>
      </ul>
    </a-space>
  </a-card>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue';
import {
  GoldOutlined,
  LinkOutlined,
  DisconnectOutlined,
} from '@ant-design/icons-vue';
import { WorkspaceConnectionInfoType } from '@/types/dashboard/DashboardType';
import { SizeConst } from '@/types/common/constant/SizeConst';
const props = defineProps({
  workspaceConnectionInfo: {
    type: Object as () => WorkspaceConnectionInfoType,
    required: true,
  },
});
</script>
<style lang="scss" scoped></style>
