<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header
    class="page-header"
    :title="t(route.meta?.title)"
    @back="goToPageByName(router, 'network detail', { id: networkId })"
  >
    <!-- header button items -->
    <template #extra>
      <a-button
        size="middle"
        type="default"
        @click="
          goToPageByName(router, 'network subnet update', {
            id: networkId,
            subnetId: data.id,
          })
        "
      >
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
          <SubnetDetailOverviewTab
            :detail-info-data="data"
            :is-loading="isLoading"
          />
        </a-tab-pane>
        <a-tab-pane key="subnet-port" :tab="t('common.content.port')">
          <NetworkDetailPortListTab
            :subnet-id="data.id"
            :network-id="data.networkId"
            :project-id="data.projectId"
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
import { goToPageByName } from '@/utils/RouterUtil';
import BasicInfo from '@/components/details/BasicInfo.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import SubnetDetailOverviewTab from '@/views/network/network/detail-components/subnet/detail-components/SubnetDetailOverviewTab.vue';
import { SubnetType } from '@/types/network/network/subnet/SubnetListType';
import {
  deleteSubnet,
  getSubnetDetail,
} from '@/axios/network-service/SubnetApi';
import { SubnetDeleteType } from '@/types/network/network/subnet/SubnetDeleteType';
import NetworkDetailPortListTab from '@/views/network/network/detail-components/NetworkDetailPortListTab.vue';

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

const networkId = route.params.id as string;
const subnetId = route.params.subnetId as string;

// 새로고침
const refresh = () => {
  data.value = {} as SubnetType;
  isLoading.value = true;
  activeKey.value = 'overview';
  getResource(subnetId);
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
    title: 'common.column.detail-info-name.project',
    dataIndex: 'projectName',
    dataType: 'string',
  },
  {
    title: 'common.column.project-id',
    dataIndex: 'projectId',
    dataType: 'string',
    isCopyable: true,
  },
  {
    title: 'common.column.description',
    dataIndex: 'description',
    dataType: 'string',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'created',
    dataType: 'date',
    dataFormat: 'YYYY-MM-DD HH:mm:ss',
  },
];

const data = ref<SubnetType>({} as SubnetType);

const getResource = (id: string) => {
  getSubnetDetail(id)
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

const openConfirmModal = (action: string, subnet: SubnetType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '서브넷',
    undefined,
    subnet?.id,
    subnet?.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [subnet.id];
  showConfirmModal.value = true;
};

// 자원 삭제 : 서브넷 삭제
const subnetDeleteForm = ref<SubnetDeleteType>({
  subnetIds: [] as string[],
});
const deleteResource = (idList: string[]) => {
  subnetDeleteForm.value.subnetIds = idList;
  deleteSubnet(subnetDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.subnet'),
        }),
        'color: #0068ff'
      );
      goToPageByName(router, 'network detail', { id: networkId });
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.subnet'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

onMounted(() => {
  getResource(subnetId);
});
</script>

<style lang="scss" scoped></style>
