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
    :title="'네트워크 수정'"
    :origin-data="updateModalData"
    @updateMethod="updateResource"
  >
    <a-row class="form-row" :gutter="12">
      <a-col :span="8">
        <a-form-item :label="'공유'">
          <a-switch v-model:checked="updateModalData.shared" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item :label="'외부 라우팅'">
          <a-switch v-model:checked="updateModalData.routerExternal" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item :label="'포트 보안'">
          <a-switch v-model:checked="updateModalData.portSecurityEnabled" />
        </a-form-item>
      </a-col>
    </a-row>
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
          <NetworkDetailOverviewTab
            :detail-info-data="data"
            :is-loading="isLoading"
          />
        </a-tab-pane>
        <a-tab-pane key="network-subnet" :tab="t('common.content.subnet')">
          <NetworkDetailSubnetListTab
            :network-id="data.id"
            :project-id="data.projectId"
          />
        </a-tab-pane>
        <a-tab-pane key="network-port" :tab="t('common.content.port')">
          <NetworkDetailPortListTab
            :network-id="data.id"
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
import { goToPageByName, goToPageByNumber } from '@/utils/RouterUtil';
import BasicInfo from '@/components/details/BasicInfo.vue';
import { getStatusToUpperCase } from '@/utils/Converter';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import NetworkDetailOverviewTab from '@/views/network/network/detail-components/NetworkDetailOverviewTab.vue';
import NetworkDetailSubnetListTab from '@/views/network/network/detail-components/NetworkDetailSubnetListTab.vue';
import { NetworkType } from '@/types/network/network/NetworkListType';
import { NetworkUpdateType } from '@/types/network/network/NetworkUpdateType';
import {
  deleteNetwork,
  getNetworkDetail,
  updateNetwork,
} from '@/axios/network-service/NetworkApi';
import NetworkDetailPortListTab from '@/views/network/network/detail-components/NetworkDetailPortListTab.vue';
import { NetworkDeleteType } from '@/types/network/network/NetworkDeleteType';

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

// 새로고침
const refresh = () => {
  data.value = {} as NetworkType;
  isLoading.value = true;
  activeKey.value = 'overview';
  getResource(networkId);
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
    title: 'common.column.shared',
    dataIndex: 'shared',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Yes' : 'No';
    },
  },
  {
    title: 'DHCP Agents',
    dataIndex: 'dhcpAgents',
    dataType: 'number',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
    dataType: 'date',
    dataFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  {
    title: 'common.column.status',
    dataIndex: 'status',
    dataType: 'status',
    convertFunc: getStatusToUpperCase,
  },
  {
    title: 'common.column.admin-status',
    dataIndex: 'adminStateUp',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Up' : 'Down';
    },
  },
];

const data = ref<NetworkType>({} as NetworkType);

const getResource = (id: string) => {
  getNetworkDetail(id)
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

const openConfirmModal = (action: string, network: NetworkType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '네트워크',
    undefined,
    network?.id,
    network?.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [network.id];
  showConfirmModal.value = true;
};

const networkDeleteForm = ref<NetworkDeleteType>({
  networkIds: [] as string[],
});
// 자원 삭제 : 네트워크 삭제
const deleteResource = (idList: string[]) => {
  networkDeleteForm.value.networkIds = idList;
  deleteNetwork(networkDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.network'),
        }),
        'color: #0068ff'
      );
      goToPageByName(router, 'network list');
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.network'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 네트워크 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<NetworkType>({} as NetworkType);
const networkUpdateForm = ref<NetworkUpdateType>({
  network: {} as NetworkType,
});
const openUpdateFormModal = (network: NetworkType) => {
  updateModalData.value = Object.assign({}, network);
  networkUpdateForm.value.network.id = network.id;
  showUpdateModal.value = true;
};
const updateResource = (updateForm: BasicUpdateFormType<NetworkType>) => {
  networkUpdateForm.value.network.name = updateForm.name;
  networkUpdateForm.value.network.description = updateForm.description;
  networkUpdateForm.value.network.shared = updateModalData.value.shared;
  networkUpdateForm.value.network.routerExternal =
    updateModalData.value.routerExternal;
  networkUpdateForm.value.network.portSecurityEnabled =
    updateModalData.value.portSecurityEnabled;

  updateNetwork(networkUpdateForm.value.network.id, networkUpdateForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.network'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.network'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

onMounted(async () => {
  await router.isReady();
  let prevPath = router.options.history.state.back as string;
  if (prevPath.includes('/subnet')) {
    activeKey.value = 'network-subnet';
  } else if (prevPath.includes('/port')) {
    activeKey.value = 'network-port';
  } else {
    activeKey.value = 'overview';
  }
  getResource(networkId);
});
</script>

<style lang="scss" scoped></style>
