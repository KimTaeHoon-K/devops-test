<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header
    class="page-header"
    :title="t(route.meta?.title)"
    @back="goToPageByNumber(router, -1)"
  >
    <!-- header button items -->
    <template #extra>
      <a-button size="middle" type="default">
        <router-link to="">수정</router-link>
      </a-button>
      <a-button
        size="middle"
        type="default"
        @click="openConfirmModal('delete', data)"
      >
        {{ t('common.content.action.delete') }}
      </a-button>
    </template>
  </a-page-header>

  <!-- 모달 -->
  <ConfirmModal
    v-model:confirm-modal-data="confirmModalData"
    v-model="showConfirmModal"
    :show-modal="showConfirmModal"
    :title="confirmModalData.title"
    :ok-text="confirmModalData.okText"
    :ok-button-props="confirmModalData.okButtonProps"
    :cancel-text="confirmModalData.cancelText"
    :modal-content="confirmModalData.modalContent"
    :confirm-data="confirmModalData.confirmData"
    @confirmMethod="confirmModalData.confirmMethod"
  />

  <div class="contents">
    <BasicInfo
      :title="t('common.content.basic-information')"
      :basic-info-columns="basicInfoColumns"
      :basic-info-data="data"
      :is-loading="isLoading"
    />
    <div class="detail-info">
      <a-tabs v-model:activeKey="activeKey" :destroy-inactive-tab-pane="true">
        <a-tab-pane key="overview" :tab="t('common.content.detail-overview')">
          <ImageDetailOverviewTab
            :detail-info-data="data"
            :is-loading="isLoading"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, onMounted, ref } from 'vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { deleteImage, getImageDetail } from '@/axios/compute-service/ImageApi';
import { InfoColumnType } from '@/types/common/InfoColumnType';
import { goToPageByName, goToPageByNumber } from '@/utils/RouterUtil';
import BasicInfo from '@/components/details/BasicInfo.vue';
import { ImageType } from '@/types/compute/image/ImageListType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { ImageDeleteType } from '@/types/compute/image/ImageDeleteType';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import ImageDetailOverviewTab from '@/views/compute/image/detail-components/ImageDetailOverviewTab.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const props = defineProps({
  imageId: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
});

const activeKey = ref<string>('overview');

const basicInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.name',
    dataIndex: 'name',
    dataType: 'string',
  },
  {
    title: 'common.column.id',
    dataIndex: 'id',
    dataType: 'string',
    isCopyable: true,
  },
  {
    title: 'common.column.detail-info-name.project',
    dataIndex: 'projectName',
    dataType: 'string',
  },
  {
    title: 'common.column.project-id',
    dataIndex: 'owner',
    dataType: 'string',
    isCopyable: true,
  },
  {
    title: 'common.column.status',
    dataIndex: 'status',
    dataType: 'string',
  },
  {
    title: 'common.column.description',
    dataIndex: 'description',
    dataType: 'string',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
    dataType: 'date',
    dataFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  {
    title: 'common.column.updated-at',
    dataIndex: 'updatedAt',
    dataType: 'date',
    dataFormat: 'YYYY-MM-DD HH:mm:ss',
  },
];

const data = ref<ImageType>({} as ImageType);

const isLoading = ref<boolean>(true);
const getResource = (imageId: string) => {
  getImageDetail(imageId)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});

const openConfirmModal = (action: string, image: ImageType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '이미지',
    undefined,
    image.id,
    image.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [image.id];
  showConfirmModal.value = true;
};

const imageDeleteForm = ref<ImageDeleteType>({
  imageIds: [] as string[],
});
// 자원 삭제 : 이미지 삭제
const deleteResource = (idList: string[]) => {
  imageDeleteForm.value.imageIds = idList;
  deleteImage(imageDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.image'),
        }),
        'color: #0068ff'
      );
      goToPageByName(router, 'image');
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.image'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

onMounted(() => {
  getResource(props.imageId);
});
</script>

<style lang="scss" scoped></style>
