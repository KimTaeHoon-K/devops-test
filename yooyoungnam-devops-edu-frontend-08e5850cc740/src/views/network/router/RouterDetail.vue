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
    :title="'라우터 수정'"
    :origin-data="updateModalData"
    :description-update="false"
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
          <RouterDetailOverviewTab
            :detail-info-data="data?.externalGatewayInfo"
            :is-loading="isLoading"
          />
        </a-tab-pane>
        <a-tab-pane key="router-ip-range" :tab="t('common.content.ip-range')">
          <RouterDetailIpRangeListTab
            :router-id="data.id"
            :project-id="data.projectId"
          />
        </a-tab-pane>
        <a-tab-pane key="static-route" :tab="t('common.content.static-route')">
          <RouterDetailStaticRouteListTab
            :is-loading="routeLoading"
            :router-id="data.id"
            :project-id="data.projectId"
            :routes-data="data?.routes"
            v-model:is-succeed="isSucceed"
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
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import {
  deleteRouter,
  getRouterDetail,
  updateRouter,
} from '@/axios/network-service/RouterApi';
import { RouterType } from '@/types/network/router/RouterListType';
import { RouterDeleteType } from '@/types/network/router/RouterDeleteType';
import { RouterUpdateType } from '@/types/network/router/RouterUpdateType';
import RouterDetailOverviewTab from '@/views/network/router/detail-components/RouterDetailOverviewTab.vue';
import RouterDetailStaticRouteListTab from '@/views/network/router/detail-components/RouterDetailStaticRouteListTab.vue';
import RouterDetailIpRangeListTab from '@/views/network/router/detail-components/RouterDetailIpRangeListTab.vue';

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
const routeLoading = ref<boolean>(true);

const routerId = route.params.id as string;

const isSucceed = ref<boolean>(false);

watch(isSucceed, () => {
  if (isSucceed.value) {
    isSucceed.value = false;
    refresh('static-route');
  }
});

// 새로고침
const refresh = (trigger?: string) => {
  data.value = {} as RouterType;
  if (!(trigger && trigger === 'static-route')) {
    isLoading.value = true;
    activeKey.value = 'overview';
  } else {
    routeLoading.value = true;
  }
  getResource(routerId);
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
    title: 'common.column.status',
    dataIndex: 'status',
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

const data = ref<RouterType>({} as RouterType);

const getResource = (id: string) => {
  getRouterDetail(id)
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
      routeLoading.value = false;
    });
};

const openConfirmModal = (action: string, router: RouterType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '라우터',
    undefined,
    router?.id,
    router?.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [router.id];
  showConfirmModal.value = true;
};

const routerDeleteForm = ref<RouterDeleteType>({
  routerIds: [] as string[],
});
// 자원 삭제 : 라우터 삭제
const deleteResource = (idList: string[]) => {
  routerDeleteForm.value.routerIds = idList;
  deleteRouter(routerDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.router'),
        }),
        'color: #0068ff'
      );
      goToPageByName(router, 'router');
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.router'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 라우터 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<RouterType>({} as RouterType);
const routerUpdateForm = ref<RouterUpdateType>({
  router: {} as RouterType,
});
const openUpdateFormModal = (router: RouterType) => {
  updateModalData.value = Object.assign({}, router);
  routerUpdateForm.value.router.id = router.id;
  showUpdateModal.value = true;
};
const updateResource = (updateForm: BasicUpdateFormType<RouterType>) => {
  routerUpdateForm.value.router.name = updateForm.name;

  updateRouter(routerUpdateForm.value.router.id, routerUpdateForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.router'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.router'),
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
  if (prevPath.includes('/ip-range-add')) {
    activeKey.value = 'router-ip-range';
  }
  getResource(routerId);
});
</script>

<style lang="scss" scoped></style>
