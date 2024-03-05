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

  <!-- 수정 모달 -->
  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'로드밸런서 수정'"
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
        <a-tab-pane key="overview" :tab="t('common.content.detail-overview')">
          <LoadBalancerDetailOverviewTab
            :detail-info-data="data"
            :is-loading="isLoading"
          />
        </a-tab-pane>
        <a-tab-pane
          key="load-balancer-listener"
          :tab="t('common.content.listener')"
        >
          <LoadBalancerDetailListenerListTab
            :load-balancer-id="data.id"
            :project-id="data.projectId"
          />
        </a-tab-pane>
        <a-tab-pane key="load-balancer-pool" :tab="t('common.content.pool')">
          <LoadBalancerDetailPoolListTab
            :load-balancer-id="data.id"
            :project-id="data.projectId"
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
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import {
  deleteLoadBalancer,
  getLoadBalancerDetail,
  updateLoadBalancer,
} from '@/axios/network-service/LoadBalancerApi';
import { LoadBalancerType } from '@/types/network/load-balancer/LoadBalancerListType';
import { LoadBalancerDeleteType } from '@/types/network/load-balancer/LoadBalancerDeleteType';
import LoadBalancerDetailOverviewTab from '@/views/network/load-balancer/detail-components/LoadBalancerDetailOverviewTab.vue';
import LoadBalancerDetailListenerListTab from '@/views/network/load-balancer/detail-components/LoadBalancerDetailListenerListTab.vue';
import LoadBalancerDetailPoolListTab from '@/views/network/load-balancer/detail-components/LoadBalancerDetailPoolListTab.vue';
import { LoadBalancerUpdateType } from '@/types/network/load-balancer/LoadBalancerUpdateType';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import { ProviderStore } from '@/stores/provider/ProviderStore';

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const providerStore = ProviderStore();
watch(providerStore, (providerStore) => {
  // 프로젝트 별 조회인 경우.
  goToPageByName(router, 'load-balancer');
});

const refresh = () => {
  isLoading.value = true;
  data.value = {} as LoadBalancerType;
  activeKey.value = 'overview';
  getResource(loadBalancerId);
};

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});

const activeKey = ref<string>('overview');

const isLoading = ref<boolean>(true);

const loadBalancerId = route.params.id as string;

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
    title: 'common.column.admin-status',
    dataIndex: 'adminStateUp',
    dataType: 'boolean',
    convertFunc: (bool: boolean) => {
      return bool ? 'Up' : 'Down';
    },
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

const data = ref<LoadBalancerType>({} as LoadBalancerType);

const getResource = (id: string) => {
  getLoadBalancerDetail(id)
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

const openConfirmModal = (action: string, loadBalancer: LoadBalancerType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '로드밸런서',
    undefined,
    loadBalancer?.id,
    loadBalancer?.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [loadBalancer.id];
  showConfirmModal.value = true;
};

const loadBalancerDeleteForm = ref<LoadBalancerDeleteType>({
  loadbalancerIds: [] as string[],
});
// 자원 삭제 : 로드밸런서 삭제
const deleteResource = (idList: string[]) => {
  loadBalancerDeleteForm.value.loadbalancerIds = idList;
  deleteLoadBalancer(loadBalancerDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.load-balancer'),
        }),
        'color: #0068ff'
      );
      goToPageByName(router, 'load-balancer');
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.load-balancer'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<LoadBalancerType>();

const loadBalancerUpdateForm = ref<LoadBalancerUpdateType>({
  loadbalancer: {} as LoadBalancerType,
});

// 수정 모달
const openUpdateFormModal = (loadbalancer: LoadBalancerType) => {
  updateModalData.value = loadbalancer;
  loadBalancerUpdateForm.value.loadbalancer = loadbalancer;
  showUpdateModal.value = true;
};

// 자원 수정 : 로드밸런서 수정
const updateResource = (updateForm: BasicUpdateFormType<LoadBalancerType>) => {
  loadBalancerUpdateForm.value.loadbalancer.name = updateForm.name;
  loadBalancerUpdateForm.value.loadbalancer.description =
    updateForm.description;
  updateLoadBalancer(
    loadBalancerUpdateForm.value.loadbalancer.id,
    loadBalancerUpdateForm.value
  )
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.load-balancer'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.load-balancer'),
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
  if (prevPath.includes('/listener')) {
    activeKey.value = 'load-balancer-listener';
  } else if (prevPath.includes('/pool')) {
    activeKey.value = 'load-balancer-pool';
  } else {
    activeKey.value = 'overview';
  }
  getResource(loadBalancerId);
});
</script>

<style lang="scss" scoped></style>
