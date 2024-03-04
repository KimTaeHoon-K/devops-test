<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra v-if="activeKey === '1'">
      <a-button size="middle" type="default">
        {{ t('common.content.action.create') }}
      </a-button>
      <a-button size="middle" type="default" :disabled="btnStatus">
        {{ t('common.content.action.delete') }}
      </a-button>
    </template>
  </a-page-header>

  <!-- 모달 -->
  <!--  <ConfirmModal-->
  <!--      v-model="showConfirmModal"-->
  <!--      :show-modal="showConfirmModal"-->
  <!--      :title="'이미지 삭제'"-->
  <!--      :ok-text="'삭제'"-->
  <!--      :ok-button-props="{ danger: true }"-->
  <!--      :cancel-text="'취소'"-->
  <!--      :modal-content="'이미지를 삭제하시겠습니까?'"-->
  <!--      @confirmMethod="deleteResource"-->
  <!--  />-->
  <div class="contents table-wrapper">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" :tab="t('menu.management.host-aggregates')">
        <HostAggregatesTab @update:btnValue="btnStatus = $event" />
      </a-tab-pane>
      <a-tab-pane key="2" :tab="t('menu.management.availability-zone')">
        <AvailabilityZoneTab />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Breadcrumb from '@/components/Breadcrumb.vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { deleteComputeHypervisor } from '@/axios/compute-service/HypervisorApi';
import HostAggregatesTab from '@/views/management/host-aggregates/HostAggregatesTab.vue';
import AvailabilityZoneTab from '@/views/management/host-aggregates/AvailabilityZoneTab.vue';
import { openNotification } from '@/utils/CommonUtil';

const showConfirmModal = ref<boolean>(false);

const router = useRouter();
const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const btnStatus = ref<boolean>(true);

const props = defineProps({
  handleBtnStatus: Boolean,
});

const activeKey = ref('1');

// 자원 삭제
const deleteResource = (id?: string) => {
  showConfirmModal.value = false;
  const idList = [];
  if (id) {
    idList.push(id);
  } else {
    // idList.push(...rowSelection.selectedRowKeys);
  }

  deleteComputeHypervisor(idList)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.hypervisor'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.hypervisor'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};
</script>

<style lang="scss" scoped></style>
