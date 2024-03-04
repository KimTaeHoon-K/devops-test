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
    :title="'인스턴스 유형 수정'"
    :origin-data="updateModalData"
    :name-disabled="true"
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
          <FlavorDetailOverviewTab
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
import {
  deleteFlavor,
  getFlavorDetail,
  updateFlavor,
} from '@/axios/compute-service/FlavorApi';
import { FlavorType } from '@/types/compute/flavor/FlavorListType';
import { FlavorDeleteType } from '@/types/compute/flavor/FlavorDeleteType';
import FlavorDetailOverviewTab from '@/views/compute/flavor/detail-components/FlavorDetailOverviewTab.vue';
import { FlavorUpdateType } from '@/types/compute/flavor/FlavorUpdateType';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const flavorId = route.params.id as string;

// 새로고침
const refresh = () => {
  data.value = {} as FlavorType;
  isLoading.value = true;
  activeKey.value = 'overview';
  getResource(flavorId);
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
  // {
  //   title: 'common.column.detail-info-name.project',
  //   dataIndex: 'projectName',
  //   dataType: 'string',
  // },
  // {
  //   title: 'common.column.project-id',
  //   dataIndex: 'owner',
  //   dataType: 'string',
  //   isCopyable: true,
  // },
  // {
  //   title: 'common.column.status',
  //   dataIndex: 'status',
  //   dataType: 'string',
  // },
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
];

const data = ref<FlavorType>({} as FlavorType);

const isLoading = ref<boolean>(true);
const getResource = (flavorId: string) => {
  getFlavorDetail(flavorId)
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
const updateModalData = ref<FlavorType>();
const openUpdateFormModal = (flavor: FlavorType) => {
  updateModalData.value = flavor;
  flavorUpdateForm.value.flavor = flavor;
  showUpdateModal.value = true;
};

const flavorUpdateForm = ref<FlavorUpdateType>({
  flavor: {} as FlavorType,
});
const updateResource = (updateForm: BasicUpdateFormType<FlavorType>) => {
  flavorUpdateForm.value.flavor.name = updateForm.name;
  flavorUpdateForm.value.flavor.description = updateForm.description;

  updateFlavor(flavorUpdateForm.value.flavor.id, flavorUpdateForm.value)
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

const openConfirmModal = (action: string, flavor: FlavorType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '인스턴스 유형',
    undefined,
    flavor.id,
    flavor.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [flavor.id];
  showConfirmModal.value = true;
};

const flavorDeleteForm = ref<FlavorDeleteType>({
  flavorIds: [] as string[],
});
// 자원 삭제 : 인스턴스 유형 삭제
const deleteResource = (idList: string[]) => {
  flavorDeleteForm.value.flavorIds = idList;
  deleteFlavor(flavorDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.flavor'),
        }),
        'color: #0068ff'
      );
      goToPageByName(router, 'flavor');
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.flavor'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

onMounted(() => {
  getResource(flavorId);
});
</script>

<style lang="scss" scoped></style>
