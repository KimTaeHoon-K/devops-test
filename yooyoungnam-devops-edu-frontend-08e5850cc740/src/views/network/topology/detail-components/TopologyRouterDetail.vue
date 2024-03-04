<template>
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

  <!-- 정적 경로 추가 모달 -->
  <StaticRouteCreateFormModal
    :router-id="props.nodeDetailData.id"
    v-if="showCreateModel"
    v-model="showCreateModel"
    v-model:is-succeed="isSucceed"
    :show-modal="showCreateModel"
    :title="'정적 경로 추가'"
  />

  <div>
    <a-form layout="vertical" :class="{ open: isChildClicked }">
      <a-row :gutter="12" class="topology-detail">
        <button @click="handleClose">
          <close-outlined />
        </button>
        <a-col :span="6">
          <span>{{ props.nodeDetailData?.name }}</span>
        </a-col>
        <a-col :span="6">
          <a-button
            size="middle"
            type="default"
            @click="openUpdateFormModal(props.nodeDetailData)"
            >{{ t('common.content.action.edit') }}</a-button
          >
          <a-button
            size="middle"
            type="default"
            @click="openConfirmModal('delete', props.nodeDetailData)"
            >{{ t('common.content.action.delete') }}</a-button
          >
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <a-tag
            :color="getStatusColor(props.nodeDetailData?.meta?.originalStatus)"
          >
            <template
              #icon
              v-if="
                props.nodeDetailData?.meta?.originalStatus.toUpperCase() !==
                'ACTIVE'
              "
            >
              <exclamation-circle-outlined /> </template
            >{{ props.nodeDetailData?.meta?.originalStatus }}
          </a-tag>
        </a-col>
        <a-col>
          <div class="information">
            <span class="txt">{{ props.nodeDetailData?.id }}</span>
            <CopyButton :textToCopy="props.nodeDetailData?.id" />
          </div>
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <a-descriptions bordered :column="1">
            <a-descriptions-item :label="'연동 외부 네트워크'">
              {{
                props.nodeDetailData?.meta?.externalGatewayInfo
                  ? props.nodeDetailData?.meta?.externalGatewayInfo.networkName
                  : '-'
              }}
            </a-descriptions-item>
            <a-descriptions-item :label="'외부 게이트웨이'">
              {{
                props.nodeDetailData?.meta?.externalGatewayInfo ? 'Yes' : 'No'
              }}
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="1" tab="연동 자원">
              <a-card title="연동자원">
                <template #extra>
                  <a-button size="middle" type="default">
                    서브넷 생성
                  </a-button>
                  <a-button size="middle" type="default"> 포트 생성 </a-button>
                </template>
                <a-table
                  :columns="connResourceColumns"
                  :data-source="connResourceData"
                  :row-key="'id'"
                  :pagination="false"
                  bordered
                >
                </a-table>
              </a-card>
            </a-tab-pane>
            <a-tab-pane key="2" tab="정적 경로" force-render>
              <a-card title="정적 경로">
                <template #extra>
                  <a-button
                    size="middle"
                    type="default"
                    @click="openCreateModal"
                    >{{ t('common.content.action.create') }}</a-button
                  >
                </template>
                <a-table
                  :columns="hostRouteColumns"
                  :data-source="hostRouteData"
                  :row-key="'id'"
                  :pagination="false"
                  :loading="isHostRouteLoading"
                  bordered
                >
                  <template #headerCell="{ column }">{{
                    t(column.title)
                  }}</template>
                </a-table>
              </a-card>
            </a-tab-pane>
          </a-tabs>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import CopyButton from '@/components/CopyButton.vue';
import {
  CloseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue';
import { TopologyNodeType } from '@/types/network/topology/TopologyNodeType';
import { TableColumnType } from 'ant-design-vue';
import { HostRouteType } from '@/types/network/common/NetworkCommonType';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { RouterDeleteType } from '@/types/network/router/RouterDeleteType';
import { deleteRouter, updateRouter } from '@/axios/network-service/RouterApi';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import { RouterType } from '@/types/network/router/RouterListType';
import { RouterUpdateType } from '@/types/network/router/RouterUpdateType';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import StaticRouteCreateFormModal from '@/views/network/router/modal/StaticRouteCreateFormModal.vue';

const props = defineProps({
  isChildClicked: {
    type: Boolean,
    default: false,
  },
  nodeDetailData: {
    type: Object as () => TopologyNodeType,
    required: true,
  },
});

const prevNodeDetailDataId = ref<string>();
watch(props, () => {
  if (props.nodeDetailData.id !== prevNodeDetailDataId.value) {
    prevNodeDetailDataId.value = props.nodeDetailData.id;
    isHostRouteLoading.value = true;
    hostRouteData.value = [];
    getHostRouteResourceList();
  }
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const activeKey = ref('1');

const emits = defineEmits({});
const handleClose = () => {
  emits('update:isChildClicked', false);
};

const connResourceColumns: TableColumnType<HostRouteType>[] = [
  {
    title: 'common.column.destination-cidr',
    dataIndex: 'destination',
  },
  {
    title: 'Next Hop',
    dataIndex: 'nexthop',
  },
];
const connResourceData = ref<HostRouteType[]>();

const hostRouteColumns: TableColumnType<HostRouteType>[] = [
  {
    title: 'common.column.destination-cidr',
    dataIndex: 'destination',
  },
  {
    title: 'Next Hop',
    dataIndex: 'nexthop',
  },
];
const hostRouteData = ref<HostRouteType[]>([]);
const isHostRouteLoading = ref<boolean>(true);
const getHostRouteResourceList = () => {
  propsDataToTableData();
};
const propsDataToTableData = () => {
  // 임의 ID 값 부여
  props.nodeDetailData?.meta?.routes?.map(
    (route: HostRouteType, index: number) => {
      hostRouteData.value.push({
        id: index.toString(),
        ...route,
      });
    }
  );
  isHostRouteLoading.value = false;
};

const getStatusColor = (status: string) => {
  if (status?.toUpperCase() === 'ACTIVE') {
    return 'geekblue';
  } else if (status?.toUpperCase() === 'ERROR') {
    return 'volcano';
  }
  return 'lightgray';
};

const showCreateModel = ref<boolean>(false);
const isSucceed = ref<boolean>(false);
const openCreateModal = () => {
  showCreateModel.value = true;
};

watch(isSucceed, () => {
  if (isSucceed.value) {
    isSucceed.value = false;
    emits('update:isRefresh', true);
  }
});

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});

const openConfirmModal = (action: string, router: TopologyNodeType) => {
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
      emits('update:isRefresh', true);
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
const updateModalData = ref<TopologyNodeType>({} as TopologyNodeType);
const routerUpdateForm = ref<RouterUpdateType>({
  router: {} as RouterType,
});
const openUpdateFormModal = (router: TopologyNodeType) => {
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
      emits('update:isRefresh', true);
    });
};

onMounted(() => {
  getHostRouteResourceList();
});
</script>
<style lang="scss" scoped></style>
