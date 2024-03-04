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
      <a-button
        size="middle"
        type="default"
        @click="openUpdateFormModal(data.server)"
      >
        {{ t('common.content.action.edit') }}
      </a-button>
      <!--      <a-button size="middle" type="default"> 메타데이터 관리 </a-button>-->
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

  <!-- 수정 모달 -->
  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'인스턴스 수정'"
    :origin-data="updateModalData"
    @updateMethod="updateResource"
  />

  <div class="contents">
    <BasicInfo
      :title="t('common.content.basic-information')"
      :is-loading="isLoading"
      :basic-info-columns="basicInfoColumns"
      :basic-info-data="data.server"
    />
    <div class="detail-info">
      <a-tabs v-model:activeKey="activeKey" :destroy-inactive-tab-pane="true">
        <a-tab-pane key="overview" :tab="t('common.content.detail-overview')">
          <InstanceDetailOverviewTab
            :detail-info-data="data.server"
            :is-loading="isLoading"
          />
        </a-tab-pane>
        <a-tab-pane key="volume" :tab="t('common.content.volume')">
          <InstanceDetailVolumeListTab
            :detail-info-volume-ids="volumeIds"
            :instance-id="data.server.id"
            :instance-name="data.server.name"
          />
        </a-tab-pane>
        <a-tab-pane key="snapshot" :tab="t('common.content.instance-snapshot')">
          <InstanceDetailSnapshotListTab :instance-id="data.server.id" />
        </a-tab-pane>
        <a-tab-pane key="floatingIP" :tab="t('common.content.floating-ip')">
          <InstanceDetailFloatingIpListTab :instance-id="data.server.id" />
        </a-tab-pane>
        <a-tab-pane key="security" :tab="t('common.content.security-group')">
          <InstanceDetailSecurityGroupTab
            :detail-info-security-groups="data.server.securityGroups"
          />
        </a-tab-pane>
        <a-tab-pane key="log" :tab="t('common.content.action-log')">
          <InstanceDetailActionHistoryListTab :instance-id="data.server.id" />
        </a-tab-pane>
        <a-tab-pane key="monitoring" :tab="t('common.content.monitoring')">
          <InstanceDetailMonitoringTab
            :instance-id="data.server.id"
            :provider-id="providerStore.getSelectedProviderId"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { InfoColumnType } from '@/types/common/InfoColumnType';
import { goToPageByName, goToPageByNumber } from '@/utils/RouterUtil';
import BasicInfo from '@/components/details/BasicInfo.vue';
import {
  InstanceDetailType,
  InstanceServerType,
} from '@/types/compute/instance/InstanceDetailType';
import {
  deleteInstance,
  getInstanceDetail,
  updateInstance,
} from '@/axios/compute-service/InstanceApi';
import InstanceDetailOverviewTab from '@/views/compute/instance/detail-components/InstanceDetailOverviewTab.vue';
import InstanceDetailVolumeListTab from '@/views/compute/instance/detail-components/InstanceDetailVolumeListTab.vue';
import InstanceDetailSnapshotListTab from '@/views/compute/instance/detail-components/InstanceDetailSnapshotListTab.vue';
import InstanceDetailFloatingIpListTab from '@/views/compute/instance/detail-components/InstanceDetailFloatingIpListTab.vue';
import InstanceDetailSecurityGroupTab from '@/views/compute/instance/detail-components/InstanceDetailSecurityGroupTab.vue';
import InstanceDetailActionHistoryListTab from '@/views/compute/instance/detail-components/InstanceDetailActionHistoryListTab.vue';
import InstanceDetailMonitoringTab from '@/views/compute/instance/detail-components/InstanceDetailMonitoringTab.vue';
import { getInstanceStatus } from '@/utils/Converter';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { InstanceDeleteType } from '@/types/compute/instance/InstanceDeleteType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import { InstanceType } from '@/types/compute/instance/InstanceListType';
import {
  InstanceUpdateFormType,
  InstanceUpdateType,
} from '@/types/compute/instance/InstanceUpdateType';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';

const providerStore = ProviderStore();
watch(providerStore, (providerStore) => {
  if (providerStore.isChangedProvider) {
    goToPageByName(router, 'contrabass dashboard');
  } else {
    goToPageByName(router, 'instance');
  }
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

interface SecurityType {
  securityGroupName: string;
  keypairName: string;
}

const activeKey = ref<string>('overview');

const isLoading = ref<boolean>(true);

const instanceId = route.params.id as string;

const instanceSecurityData = ref<SecurityType>();

const volumeIds: string[] = [];

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
    dataIndex: 'tenantId',
    dataType: 'string',
    isCopyable: true,
  },
  {
    title: 'common.column.status',
    dataIndex: 'osExtStsPowerState',
    dataType: 'status',
    convertFunc: getInstanceStatus,
  },
  {
    title: 'common.column.host',
    dataIndex: 'osExtSrvAttrHost',
    dataType: 'string',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'created',
    dataType: 'date',
    dataFormat: 'YYYY-MM-DD HH:mm:ss',
  },
];

const data = ref<InstanceDetailType>({
  server: {
    id: '',
    name: '',
    status: '',
    hostId: '',
    projectName: '',
    image: {
      name: '',
      type: '',
      size: 0,
      status: '',
      id: '',
      diskFormat: '',
      protected: '',
      createdAt: '',
    },
    storage: [],
    flavor: {
      id: '',
      links: [],
    },
    network: {
      addresses: [],
    },
    created: '',
    updated: '',
    description: '',
    tenantId: '',
    userId: '',
    osDcfDiskConfig: '',
    osExtAzAvailabilityZone: '',
    configDrive: '',
    keyName: '',
    securityGroups: [],
    osExtSrvAttrHost: '',
    osExtSrvAttrInstanceName: '',
    osExtSrvAttrHypervisorHostname: '',
    osExtStsVmState: '',
    osExtStsPowerState: 0,
    osExtendedVolumesVolumesAttached: [],
  },
});

// 새로고침
const refresh = () => {
  data.value = {
    server: {
      id: '',
      name: '',
      status: '',
      hostId: '',
      projectName: '',
      image: {
        name: '',
        type: '',
        size: 0,
        status: '',
        id: '',
        diskFormat: '',
        protected: '',
        createdAt: '',
      },
      storage: [],
      flavor: {
        id: '',
        links: [],
      },
      network: {
        addresses: [],
      },
      created: '',
      updated: '',
      description: '',
      tenantId: '',
      userId: '',
      osDcfDiskConfig: '',
      osExtAzAvailabilityZone: '',
      configDrive: '',
      keyName: '',
      securityGroups: [],
      osExtSrvAttrHost: '',
      osExtSrvAttrInstanceName: '',
      osExtSrvAttrHypervisorHostname: '',
      osExtStsVmState: '',
      osExtStsPowerState: 0,
      osExtendedVolumesVolumesAttached: [],
    },
  };
  isLoading.value = true;
  getResource(instanceId);
};
const getResource = (id: string) => {
  getInstanceDetail(id)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        // 인스턴스 소스 - 이미지 있을 때
        if (data.value.server.image !== null) {
          data.value.server.image.type = t('common.content.image');
        }
        // 인스턴스 소스 - 볼륨 있을 때
        if (
          data.value.server.storage[0].systemDisks &&
          data.value.server.storage[0].systemDisks.length > 0
        ) {
          data.value.server.storage[0].systemDisks[0].instanceSourceType = t(
            'common.content.volume'
          );
        }
        // 볼륨 탭 - 볼륨 있을 때
        if (data.value.server.osExtendedVolumesVolumesAttached.length > 0) {
          let volumes = data.value.server.osExtendedVolumesVolumesAttached;
          for (let volume of volumes) {
            volumeIds.push(volume.id);
          }
        }
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
const updateModalData = ref<InstanceServerType>();

const instanceUpdateForm = ref<InstanceUpdateType>({
  server: {} as InstanceType,
  projectId: '',
});

// 수정 모달
const openUpdateFormModal = (instance: InstanceServerType) => {
  updateModalData.value = instance;
  instanceUpdateForm.value.server = {
    id: instance.id,
    name: instance.name,
    description: instance.description,
  } as InstanceUpdateFormType;
  showUpdateModal.value = true;
};

// 자원 수정 : 인스턴스 수정
const updateResource = (
  updateForm: BasicUpdateFormType<InstanceServerType>
) => {
  instanceUpdateForm.value.server.name = updateForm.name;
  instanceUpdateForm.value.server.description = updateForm.description;
  instanceUpdateForm.value.projectId = updateForm.originData.tenantId;
  updateInstance(instanceUpdateForm.value.server.id, instanceUpdateForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.instance'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.instance'),
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

const openConfirmModal = (action: string, instance: InstanceDetailType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '인스턴스',
    undefined,
    instance.server.id,
    instance.server.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [instance.server.id];
  showConfirmModal.value = true;
};

// 자원 삭제 : 인스턴스 삭제
const instanceDeleteForm = ref<InstanceDeleteType>({
  serverIds: [] as string[],
  projectId: '',
});
const deleteResource = (idList: string[]) => {
  instanceDeleteForm.value.serverIds = idList;
  instanceDeleteForm.value.projectId = providerStore.getSelectedProjectId;
  deleteInstance(instanceDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.instance'),
        }),
        'color: #0068ff'
      );
      goToPageByName(router, 'instance');
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.instance'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

onMounted(() => {
  getResource(instanceId);
});
</script>

<style lang="scss" scoped></style>
