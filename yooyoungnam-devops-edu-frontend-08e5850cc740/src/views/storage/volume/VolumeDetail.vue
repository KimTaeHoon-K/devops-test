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
    :title="'볼륨 수정'"
    :origin-data="updateModalData"
    @updateMethod="updateResource"
  >
    <a-form-item :label="'부팅 가능'">
      <a-switch v-model:checked="updateModalData.bootable" />
    </a-form-item>
  </BasicUpdateFormModal>

  <div class="contents">
    <BasicInfo
      :title="t('common.content.basic-information')"
      :is-loading="isLoading"
      :basic-info-columns="basicInfoColumns"
      :basic-info-data="data"
    />
    <div class="detail-info">
      <a-tabs v-model:activeKey="activeKey" :destroy-inactive-tab-pane="true">
        <a-tab-pane key="overview" :tab="t('common.content.detail-overview')">
          <VolumeDetailOverviewTab
            :detail-info-data="data"
            :is-loading="isLoading"
          />
        </a-tab-pane>
        <a-tab-pane
          key="volume-snapshot"
          :tab="t('common.content.volume-snapshot')"
        >
          <VolumeDetailSnapshotListTab :volume-id="data.id" />
        </a-tab-pane>
        <a-tab-pane key="metadata" :tab="t('common.content.metadata')">
          <VolumeDetailMetadataListTab :volume-id="data.id" />
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
import {
  deleteVolume,
  getVolumeDetail,
  updateVolume,
} from '@/axios/storage-service/VolumeApi';
import { VolumeType } from '@/types/storage/volume/VolumeListType';
import { getStatusToUpperCase, gibConverter } from '@/utils/Converter';
import VolumeDetailSnapshotListTab from '@/views/storage/volume/detail-components/VolumeDetailSnapshotListTab.vue';
import VolumeDetailOverviewTab from '@/views/storage/volume/detail-components/VolumeDetailOverviewTab.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { VolumeDeleteType } from '@/types/storage/volume/VolumeDeleteType';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { VolumeUpdateType } from '@/types/storage/volume/VolumeUpdateType';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import VolumeDetailMetadataListTab from '@/views/storage/volume/detail-components/VolumeDetailMetadataListTab.vue';

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

const activeKey = ref<string>('overview');

const isLoading = ref<boolean>(true);

const volumeId = route.params.id as string;

// 새로고침
const refresh = () => {
  data.value = {} as VolumeType;
  isLoading.value = true;
  activeKey.value = 'overview';
  getResource(volumeId);
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
    title: 'common.column.status',
    dataIndex: 'status',
    dataType: 'status',
    convertFunc: getStatusToUpperCase,
  },
  {
    title: 'common.column.volume-type',
    dataIndex: 'volumeType',
    dataType: 'string',
  },
  {
    title: 'common.column.shared',
    dataIndex: 'multiattach',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
  {
    title: 'common.column.capacity',
    dataIndex: 'size',
    dataType: 'number',
    convertFunc: gibConverter,
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'created',
    dataType: 'date',
    dataFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  {
    title: 'common.column.bootable',
    dataIndex: 'bootable',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
  {
    title: 'common.column.encrypted',
    dataIndex: 'encrypted',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
];

const data = ref<VolumeType>({} as VolumeType);

const getResource = (id: string) => {
  getVolumeDetail(id)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data.volume;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const openConfirmModal = (action: string, volume: VolumeType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '볼륨',
    undefined,
    volume?.id,
    volume?.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [volume.id];
  showConfirmModal.value = true;
};

const volumeDeleteForm = ref<VolumeDeleteType>({
  volumeIds: [] as string[],
});
// 자원 삭제 : 볼륨 삭제
const deleteResource = (idList: string[]) => {
  volumeDeleteForm.value.volumeIds = idList;
  deleteVolume(volumeDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.volume'),
        }),
        'color: #0068ff'
      );
      goToPageByName(router, 'volume');
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.volume'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 볼륨 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<VolumeType>();
const volumeUpdateForm = ref<VolumeUpdateType>({
  volume: {} as VolumeType,
});
const openUpdateFormModal = (volume: VolumeType) => {
  updateModalData.value = volume;
  volumeUpdateForm.value.volume = volume;
  showUpdateModal.value = true;
};
const updateResource = (updateForm: BasicUpdateFormType<VolumeType>) => {
  volumeUpdateForm.value.volume.name = updateForm.name;
  volumeUpdateForm.value.volume.description = updateForm.description;

  updateVolume(volumeUpdateForm.value.volume.id, volumeUpdateForm.value)
    .then((res) => {
      openNotification(
        true,
        '볼륨 수정이 성공적으로 완료되었습니다.',
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        '볼륨 수정이 실패하였습니다.\n' + err.code + err.message,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

onMounted(() => {
  getResource(volumeId);
});
</script>

<style lang="scss" scoped></style>
