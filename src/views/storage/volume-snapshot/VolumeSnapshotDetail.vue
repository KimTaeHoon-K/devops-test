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
    :title="'볼륨 스냅샷 수정'"
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
          <VolumeSnapshotDetailOverviewTab
            :detail-info-data="data"
            :is-loading="isLoading"
          />
        </a-tab-pane>
        <a-tab-pane
          key="volume-snapshot"
          :tab="t('common.content.created-volume')"
        >
          <VolumeSnapshotDetailVolumeListTab
            :volume-snapshot-id="volumeSnapshotId"
          />
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
import { getStatusToUpperCase, gibConverter } from '@/utils/Converter';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import {
  deleteVolumeSnapshot,
  getVolumeSnapshotDetail,
  updateVolumeSnapshot,
} from '@/axios/storage-service/VolumeSnapshotApi';
import { VolumeSnapshotType } from '@/types/storage/volume-snapshot/VolumeSnapshotListType';
import { VolumeSnapshotDeleteType } from '@/types/storage/volume-snapshot/VolumeSnapshotDeleteType';
import { VolumeSnapshotUpdateType } from '@/types/storage/volume-snapshot/VolumeSnapshotUpdateType';
import VolumeSnapshotDetailVolumeListTab from '@/views/storage/volume-snapshot/detail-components/VolumeSnapshotDetailVolumeListTab.vue';
import VolumeSnapshotDetailOverviewTab from '@/views/storage/volume-snapshot/detail-components/VolumeSnapshotDetailOverviewTab.vue';

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

const volumeSnapshotId = route.params.id as string;

// 새로고침
const refresh = () => {
  data.value = {} as VolumeSnapshotType;
  isLoading.value = true;
  activeKey.value = 'overview';
  getResource(volumeSnapshotId);
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
];

const data = ref<VolumeSnapshotType>({} as VolumeSnapshotType);

const getResource = (id: string) => {
  getVolumeSnapshotDetail(id)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data.snapshot;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const openConfirmModal = (
  action: string,
  volumeSnapshot: VolumeSnapshotType
) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '볼륨 스냅샷',
    undefined,
    volumeSnapshot?.id,
    volumeSnapshot?.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [volumeSnapshot.id];
  showConfirmModal.value = true;
};

const volumeDeleteForm = ref<VolumeSnapshotDeleteType>({
  snapshotIds: [] as string[],
});
// 자원 삭제 : 볼륨 스냅샷 삭제
const deleteResource = (idList: string[]) => {
  volumeDeleteForm.value.snapshotIds = idList;
  deleteVolumeSnapshot(volumeDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.volume-snapshot'),
        }),
        'color: #0068ff'
      );
      goToPageByName(router, 'volume snapshot');
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.volume-snapshot'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 볼륨 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<VolumeSnapshotType>({} as VolumeSnapshotType);
const volumeUpdateForm = ref<VolumeSnapshotUpdateType>({
  volumeSnapshot: {} as VolumeSnapshotType,
});
const openUpdateFormModal = (volumeSnapshot: VolumeSnapshotType) => {
  updateModalData.value = volumeSnapshot;
  volumeUpdateForm.value.volumeSnapshot = volumeSnapshot;
  showUpdateModal.value = true;
};
const updateResource = (
  updateForm: BasicUpdateFormType<VolumeSnapshotType>
) => {
  volumeUpdateForm.value.volumeSnapshot.name = updateForm.name;
  volumeUpdateForm.value.volumeSnapshot.description = updateForm.description;

  updateVolumeSnapshot(
    volumeUpdateForm.value.volumeSnapshot.id,
    volumeUpdateForm.value
  )
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.volume-snapshot'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.volume-snapshot'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

onMounted(() => {
  getResource(volumeSnapshotId);
});
</script>

<style lang="scss" scoped></style>
