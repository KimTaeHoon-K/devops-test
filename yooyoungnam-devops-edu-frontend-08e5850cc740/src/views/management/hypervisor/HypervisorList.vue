<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra>
      <!--      <a-button-->
      <!--          size="middle"-->
      <!--          type="default"-->
      <!--          @click="goToPageByName(router, 'image create')"-->
      <!--      >-->
      <!--        {{ t('common.content.action.create') }}-->
      <!--      </a-button>-->
      <a-button
        size="middle"
        type="default"
        :disabled="btnStatus"
        @click="handleModal"
        v-if="activeKey === '2'"
      >
        {{ t('common.content.action.status-change') }}
      </a-button>
    </template>
  </a-page-header>

  <!-- 모달 -->
  <!-- TODO: 버튼 위치 기획팀과 상의 필요 (특정 탭에만 있는 기능) -->
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
  <div class="contents">
    <div class="table-wrapper">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" :tab="t('menu.management.hypervisor')">
          <HypervisorTab />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="t('menu.management.compute-host')">
          <ComputeHostTab
            @update:btnValue="btnStatus = $event"
            @update:selectedData=""
          />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineEmits, defineProps, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Breadcrumb from '@/components/Breadcrumb.vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { deleteComputeHypervisor } from '@/axios/compute-service/HypervisorApi';
import HypervisorTab from '@/views/management/hypervisor/HypervisorTab.vue';
import ComputeHostTab from '@/views/management/hypervisor/ComputeHostTab.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { openNotification } from '@/utils/CommonUtil';

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
  selectedData: Object,
});

const confirmModalEmits = defineEmits(['update:confirmValue']);

const handleModal = () => {
  confirmModalEmits('update:confirmValue', true);
};

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

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});

// const openConfirmModal = (action: string, id?: string, name?: string) => {
//   if (action === 'changeStatus') {
//     if (!id) {
//       confirmModalData.value.modalContent =
//           '컴퓨트 호스트 ' +
//           selectedData.value.rows.map((row: ComputeHostType) => row.hypervisorHostName) +
//           '을 활성화/비활성화 하시겠습니까?';
//       confirmModalData.value.confirmData = selectedData.value.keys;
//     } else {
//       confirmModalData.value.modalContent =
//           '컴퓨트 호스트 ' + name + '을 활성화/비활성화 하시겠습니까?';
//       confirmModalData.value.confirmData = id;
//     }
//     // confirmModalData.value.confirmMethod = deleteResource;
//   }
//   showConfirmModal.value = true;
// };
</script>

<style lang="scss" scoped></style>
