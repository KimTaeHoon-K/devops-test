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

  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'인스턴스 스냅샷 수정'"
    :origin-data="updateModalData"
    :description-update="false"
    @updateMethod="updateResource"
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
          <InstanceSnapshotDetailOverviewTab
            :detail-info-data="data"
            :is-loading="isLoading"
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
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import InstanceSnapshotDetailOverviewTab from '@/views/compute/instance-snapshot/detail-components/InstanceSnapshotDetailOverviewTab.vue';
import {
  deleteInstanceSnapshot,
  getInstanceSnapshotDetail,
  updateInstanceSnapshot,
} from '@/axios/compute-service/InstanceSnapshotApi';
import { InstanceSnapshotType } from '@/types/compute/instance-snapshot/InstanceSnapshotListType';
import { InstanceSnapshotDeleteType } from '@/types/compute/instance-snapshot/InstanceSnapshotDeleteType';
import { InstanceSnapshotUpdateType } from '@/types/compute/instance-snapshot/InstanceSnapshotUpdateType';
import { ProviderStore } from '@/stores/provider/ProviderStore';

const providerStore = ProviderStore();

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const instanceSnapshotId = route.params.id as string;

// 새로고침
const refresh = () => {
  data.value = {} as InstanceSnapshotType;
  isLoading.value = true;
  activeKey.value = 'overview';
  getResource(instanceSnapshotId);
};

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
    dataIndex: 'ownerProjectName',
    dataType: 'string',
  },
  {
    title: 'common.column.project-id',
    dataIndex: 'ownerId',
    dataType: 'string',
    isCopyable: true,
  },
  {
    title: 'common.column.status',
    dataIndex: 'status',
    dataType: 'string',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
    dataType: 'date',
    dataFormat: 'YYYY-MM-DD HH:mm:ss',
  },
];

const data = ref<InstanceSnapshotType>({} as InstanceSnapshotType);

const isLoading = ref<boolean>(true);
const getResource = (instanceSnapshotId: string) => {
  getInstanceSnapshotDetail(instanceSnapshotId)
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

const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<InstanceSnapshotType>();

const openUpdateFormModal = (instanceSnapshot: InstanceSnapshotType) => {
  updateModalData.value = instanceSnapshot;
  instanceSnapshotUpdateForm.value.snapshot = instanceSnapshot;
  showUpdateModal.value = true;
};

const instanceSnapshotUpdateForm = ref<InstanceSnapshotUpdateType>({
  snapshot: {} as InstanceSnapshotType,
});
const updateResource = (
  updateForm: BasicUpdateFormType<InstanceSnapshotType>
) => {
  instanceSnapshotUpdateForm.value.snapshot.name = updateForm.name;
  instanceSnapshotUpdateForm.value.snapshot.description =
    updateForm.description;
  updateInstanceSnapshot(
    instanceSnapshotUpdateForm.value.snapshot.id,
    instanceSnapshotUpdateForm.value
  )
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.flavor'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.flavor'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});

const canDelete = ref<boolean>(true);
const openConfirmModal = (
  action: string,
  instanceSnapshot: InstanceSnapshotType
) => {
  if (action === 'delete') {
    if (
      (instanceSnapshot && instanceSnapshot.protected) ||
      (!instanceSnapshot && !canDelete.value)
    ) {
      confirmModalData.value.modalContent =
        '해당 인스턴스 스냅샷 보호된 인스턴스 스냅샷입니다. 보호 해제 뒤 다시 시도해 주세요.';
      confirmModalData.value.okButtonProps = { hidden: true };
      confirmModalData.value.cancelText = '확인';
      showConfirmModal.value = true;
      return;
    } else {
      confirmModalData.value.confirmMethod = deleteResource;
    }
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '인스턴스 스냅샷',
    undefined,
    instanceSnapshot?.id,
    instanceSnapshot?.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [instanceSnapshot.id];
  showConfirmModal.value = true;
};

const instanceSnapshotDeleteForm = ref<InstanceSnapshotDeleteType>({
  snapshotIds: [] as string[],
});
// 자원 삭제 : 인스턴스 스냅샷 삭제
const deleteResource = (idList: string[]) => {
  instanceSnapshotDeleteForm.value.snapshotIds = idList;
  deleteInstanceSnapshot(instanceSnapshotDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.instance-snapshot'),
        }),
        'color: #0068ff'
      );
      goToPageByName(router, 'instance snapshot');
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.instance-snapshot'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

onMounted(() => {
  getResource(instanceSnapshotId);
});
</script>

<style lang="scss" scoped></style>
