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
      <a-button size="middle" type="default" @click="openUpdateFormModal(data)">
        {{ t('common.content.action.edit') }}
      </a-button>
      <a-button
        size="middle"
        type="default"
        @click="openConfirmModal('delete', data)"
        >{{ t('common.content.action.delete') }}</a-button
      >
    </template>
  </a-page-header>

  <!-- 모달 -->
  <ConfirmModal
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

  <!-- 폼 모달 -->
  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'볼륨 타입 수정'"
    :origin-data="updateModalData"
    @updateMethod="updateResource"
  />

  <div class="contents">
    <BasicInfo
      :title="t('common.content.basic-information')"
      :is-loading="isLoading"
      :basic-info-columns="basicInfoColumns"
      :basic-info-data="data"
    />
    <div class="detail-info">
      <a-tabs v-model:activeKey="activeKey" :destroy-inactive-tab-pane="true">
        <a-tab-pane key="metadata" :tab="t('common.content.metadata')">
          <VolumeTypeDetailMetadataListTab :volume-type-id="data.id" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { InfoColumnType } from '@/types/common/InfoColumnType';
import { goToPageByName, goToPageByNumber } from '@/utils/RouterUtil';
import BasicInfo from '@/components/details/BasicInfo.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import VolumeTypeDetailMetadataListTab from '@/views/storage/volume-type/detail-components/VolumeTypeDetailMetadataListTab.vue';
import { VolumeTypeType } from '@/types/storage/volume-type/VolumeTypeListType';
import { VolumeTypeUpdateType } from '@/types/storage/volume-type/VolumeTypeUpdateType';
import {
  deleteVolumeType,
  getVolumeTypeDetail,
  updateVolumeType,
} from '@/axios/storage-service/VolumeTypeApi';
import { VolumeTypeDeleteType } from '@/types/storage/volume-type/VolumeTypeDeleteType';

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});

const activeKey = ref<string>('');

const isLoading = ref<boolean>(true);

const volumeTypeId = route.params.id as string;

// 새로고침
const refresh = () => {
  data.value = {} as VolumeTypeType;
  isLoading.value = true;
  activeKey.value = 'overview';
  getResource(volumeTypeId);
};

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
    title: 'common.column.description',
    dataIndex: 'description',
    dataType: 'string',
  },
  {
    title: 'common.column.public',
    dataIndex: 'publicIs',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
  {
    title: 'common.column.connected-qos-specs-id',
    dataIndex: 'qosSpecsId',
    dataType: 'string',
    isCopyable: true,
  },
];

const data = ref<VolumeTypeType>({} as VolumeTypeType);

const getResource = (id: string) => {
  getVolumeTypeDetail(id)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        activeKey.value = 'metadata';
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const openConfirmModal = (action: string, volumeType: VolumeTypeType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '볼륨 타입',
    undefined,
    volumeType?.id,
    volumeType?.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [volumeType.id];
  showConfirmModal.value = true;
};

const volumeTypeDeleteForm = ref<VolumeTypeDeleteType>({
  volumeTypeIds: [] as string[],
});
// 자원 삭제 : 볼륨 타입 삭제
const deleteResource = (idList: string[]) => {
  volumeTypeDeleteForm.value.volumeTypeIds = idList;
  deleteVolumeType(volumeTypeDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.volume-type'),
        }),
        'color: #0068ff'
      );
      goToPageByName(router, 'volume type');
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.volume-type'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 볼륨 타입 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<VolumeTypeType>();
const volumeTypeUpdateForm = ref<VolumeTypeUpdateType>({
  volumeType: {} as VolumeTypeType,
});
const openUpdateFormModal = (volumeType: VolumeTypeType) => {
  updateModalData.value = volumeType;
  volumeTypeUpdateForm.value.volumeType = volumeType;
  showUpdateModal.value = true;
};
const updateResource = (updateForm: BasicUpdateFormType<VolumeTypeType>) => {
  volumeTypeUpdateForm.value.volumeType.name = updateForm.name;
  volumeTypeUpdateForm.value.volumeType.description = updateForm.description;

  updateVolumeType(
    volumeTypeUpdateForm.value.volumeType.id,
    volumeTypeUpdateForm.value
  )
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.volume-type'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.volume-type'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

onMounted(() => {
  getResource(volumeTypeId);
});
</script>

<style lang="scss" scoped></style>
