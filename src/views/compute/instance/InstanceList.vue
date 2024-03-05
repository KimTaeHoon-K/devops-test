<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra>
      <a-button
        size="middle"
        type="default"
        @click="goToPageByName(router, 'instance create')"
      >
        {{ t('common.content.action.create') }}
      </a-button>
      <a-button
        size="middle"
        type="default"
        @click="openConfirmModal('delete')"
        :disabled="selectedData.rows.length === 0"
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

  <!-- 인스턴스 스냅샷 생성 모달 -->
  <BasicCreateFormModal
    v-if="showCreateSnapshotModal"
    v-model="showCreateSnapshotModal"
    :show-modal="showCreateSnapshotModal"
    :title="
      t('common.content.action.resource-create', {
        data: t('common.content.instance-snapshot'),
      })
    "
    :name-input="true"
    v-model:name="snapshotCreateData.snapshot.name"
    @createMethod="createResource"
  />

  <div class="contents table-wrapper">
    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      :row-key="'id'"
      :pagination="false"
      :loading="isLoading"
      bordered
    >
      <template #title>
        <div class="table-title-wrap">
          <div class="table-title-left">
            <!--<exclamation-circle-outlined />-->
            <!--<span class="text">{{ t('message.table.can-reset-columns') }}</span>-->
          </div>
          <div class="table-title-right">
            <a-tooltip :title="t('common.content.action.refresh')">
              <reload-outlined @click="refresh()" />
            </a-tooltip>
          </div>
        </div>
      </template>
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'name'">{{
          t(column.title, { data: t('common.content.instance') })
        }}</template>
        <template v-else>
          {{ t(column.title) }}
        </template>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <a
            @click="
              goToPageByName(router, 'instance detail', {
                id: record.id,
              })
            "
            >{{ text ? text : '(No name)' }}</a
          >
        </template>
        <!--        <template v-else-if="column.dataIndex === 'hostId'">-->
        <!--          <span>-->
        <!--            {{ text }}-->
        <!--          </span>-->
        <!--        </template>-->
        <!--        <template v-else-if="column.dataIndex === 'image'">-->
        <!--          {{ text ? text : '-' }}-->
        <!--        </template>-->
        <template v-if="column.dataIndex === 'network'">
          <div v-for="net in text.addresses" v-bind:key="net.networkName">
            <div v-if="net.ipsType === 'fixed'">
              {{ net.addr }}
            </div>
          </div>
          <div v-if="!text.addresses || text.addresses.length === 0">-</div>
        </template>
        <template v-else-if="column.dataIndex === 'flavor'">
          {{ text.originalName ? text.originalName : '-' }}
        </template>
        <!--        <template v-else-if="column.dataIndex === 'locked'">-->
        <!--          {{ text }}-->
        <!--        </template>-->
        <template v-else-if="column.dataIndex === 'osExtStsTaskState'">
          <span>
            <a-tag :color="getTagColor(text, record.status)">
              <span>{{
                getTagText(record.osExtStsTaskState, record.status)
              }}</span>
            </a-tag>
          </span>
        </template>
        <template v-if="column.dataIndex === 'created'">
          {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'optionButton'">
          <a-dropdown placement="bottomRight">
            <template #overlay>
              <a-menu>
                <a-menu-item
                  :disabled="
                    record.osExtStsVmState === 'error' ||
                    record.osExtStsVmState === 'building' ||
                    record.osExtStsVmState === 'deleted' ||
                    record.osExtStsTaskState === 'deleting'
                  "
                  @click="openUpdateFormModal(record)"
                  >{{ t('common.content.action.edit') }}</a-menu-item
                >
                <a-menu-item
                  :disabled="
                    record.osExtStsVmState === 'active' ||
                    record.osExtStsVmState === 'error' ||
                    record.osExtStsVmState === 'building' ||
                    record.osExtStsVmState === 'deleted' ||
                    record.osExtStsTaskState === 'deleting'
                  "
                  @click="openConfirmModal('start', record)"
                  >{{ t('common.content.action.start') }}</a-menu-item
                >
                <a-menu-item
                  :disabled="
                    record.osExtStsVmState === 'stopped' ||
                    record.osExtStsVmState === 'error' ||
                    record.osExtStsTaskState === 'reboot_started' ||
                    record.osExtStsTaskState === 'deleting' ||
                    record.osExtStsVmState === 'building' ||
                    record.osExtStsVmState === 'deleted'
                  "
                  @click="openConfirmModal('stop', record)"
                  >{{ t('common.content.action.stop') }}</a-menu-item
                >
                <a-menu-item
                  :disabled="
                    record.osExtStsVmState === 'stopped' ||
                    record.osExtStsVmState === 'error' ||
                    record.osExtStsTaskState === 'reboot_started' ||
                    record.osExtStsTaskState === 'deleting' ||
                    record.osExtStsVmState === 'building' ||
                    record.osExtStsVmState === 'deleted'
                  "
                  @click="openConfirmModal('hard-reboot', record)"
                  >{{ t('common.content.action.hard-reboot') }}</a-menu-item
                >
                <a-menu-item
                  :disabled="
                    record.osExtStsVmState === 'stopped' ||
                    record.osExtStsVmState === 'error' ||
                    record.osExtStsTaskState === 'reboot_started' ||
                    record.osExtStsTaskState === 'deleting' ||
                    record.osExtStsVmState === 'building' ||
                    record.osExtStsVmState === 'deleted'
                  "
                  @click="openConfirmModal('soft-reboot', record)"
                  >{{ t('common.content.action.soft-reboot') }}</a-menu-item
                >
                <a-menu-item
                  :disabled="
                    record.osExtStsVmState === 'error' ||
                    record.osExtStsTaskState === 'deleting' ||
                    record.osExtStsVmState === 'building' ||
                    record.osExtStsVmState === 'deleted'
                  "
                  @click="openCreateSnapshotModal(record)"
                  >{{
                    t('common.content.action.resource-create', {
                      data: t('common.content.instance-snapshot'),
                    })
                  }}</a-menu-item
                >
                <a-menu-item
                  :disabled="
                    record.osExtStsTaskState === 'deleting' ||
                    record.osExtStsVmState === 'building' ||
                    record.osExtStsVmState === 'deleted'
                  "
                  @click="openConfirmModal('delete', record)"
                  >{{ t('common.content.action.delete') }}</a-menu-item
                >
              </a-menu>
            </template>
            <ellipsis-outlined />
          </a-dropdown>
        </template>
      </template>
    </a-table>
    <a-pagination
      class="pagination-wrapper"
      v-model:current="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :total="pagination.totalCount"
      :show-total="
        (total, range) => `${range[0]}-${range[1]} of ${total} items`
      "
      :default-current="1"
      :default-page-size="10"
      :show-size-changer="true"
      @change="changePagination"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import { EllipsisOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { dateConverter } from '@/utils/Converter';
import {
  deleteInstance,
  getInstanceList,
  hardRebootInstance,
  softRebootInstance,
  startInstance,
  stopInstance,
  updateInstance,
} from '@/axios/compute-service/InstanceApi';
import { goToPageByName } from '@/utils/RouterUtil';
import { InstanceType } from '@/types/compute/instance/InstanceListType';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import BasicCreateFormModal from '@/components/modal/BasicCreateFormModal.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { InstanceDeleteType } from '@/types/compute/instance/InstanceDeleteType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { InstanceUpdateType } from '@/types/compute/instance/InstanceUpdateType';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import { InstanceSnapshotCreateType } from '@/types/compute/instance-snapshot/InstanceSnapshotCreateType';
import { createInstanceSnapshot } from '@/axios/compute-service/InstanceSnapshotApi';

const providerStore = ProviderStore();
watch(providerStore, (providerStore) => {
  // 프로젝트 별 조회인 경우.
  refresh();
});

const pagination = ref<PaginationType>({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPage: 0,
});

const intervalId = ref<number>();

// 페이지 변경
const changePagination = (pageNumber: number, pageSize: number) => {
  isLoading.value = true;
  // stopInterval();
  selectedData.value = { keys: [], rows: [] };
  getResourceList(pageNumber, pageSize);
  // startInterval(pageNumber, pageSize);
};

const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<InstanceType>();

const showCreateSnapshotModal = ref<boolean>(false);

const instanceUpdateForm = ref<InstanceUpdateType>({
  server: {} as InstanceType,
  projectId: '',
});

const snapshotCreateData = ref<InstanceSnapshotCreateType>({
  snapshot: {
    name: '',
  },
  serverId: '',
});

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});
const selectedData = ref<{ rows: InstanceType[]; keys: string[] }>({
  rows: [],
  keys: [],
});

const router = useRouter();
const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const isLoading = ref<boolean>(true);

const columns: TableColumnType<InstanceType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.fixed-ip',
    dataIndex: 'network',
  },
  {
    title: 'common.column.flavor',
    dataIndex: 'flavor',
  },
  {
    title: 'common.column.status',
    dataIndex: 'osExtStsTaskState',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'created',
    // sorter: true,
  },
  {
    title: '',
    dataIndex: 'optionButton',
    align: 'center',
  },
];
const data = ref<InstanceType[]>();

// 상태 태그 컬러 설정
const getTagColor = (osExtStsTaskState: string, status: string) => {
  switch (status) {
    case 'BUILD':
      if (osExtStsTaskState === 'deleting') {
        return 'volcano';
      } else if (osExtStsTaskState === 'spawning') {
        return 'warning';
      } else {
        return 'warning';
      }
    case 'ACTIVE':
      if (osExtStsTaskState === 'powering-off') {
        return 'lightgray';
      } else if (osExtStsTaskState === 'suspending') {
        return 'warning';
      } else {
        return 'geekblue';
      }
    case 'SHUTOFF':
      if (osExtStsTaskState === 'powering-on') {
        return 'warning';
      } else if (osExtStsTaskState === 'deleting') {
        return 'volcano';
      } else {
        return 'lightgray';
      }
    case 'REBOOT':
      return 'warning';
    case 'HARD_REBOOT':
      return 'warning';
    case 'SUSPENDED':
      return 'warning';
    case 'PAUSED':
      return 'lightgray';
    case 'ERROR':
      return 'volcano';
  }
};
const getTagText = (osExtStsTaskState: string, status: string) => {
  switch (status) {
    case 'BUILD':
      if (osExtStsTaskState === 'deleting') {
        return 'DELETING';
      } else if (osExtStsTaskState === 'spawning') {
        return 'BUILDING';
      } else {
        return 'CREATING';
      }
    case 'ACTIVE':
      if (osExtStsTaskState === 'powering-off') {
        return 'POWERING-OFF';
      } else if (osExtStsTaskState === 'suspending') {
        return 'SUSPENDING';
      } else {
        return 'RUNNING';
      }
    case 'SHUTOFF':
      if (osExtStsTaskState === 'powering-on') {
        return 'RESTARTING';
      } else if (osExtStsTaskState === 'deleting') {
        return 'DELETING';
      } else {
        return 'SHUT DOWN';
      }
    case 'REBOOT':
      return 'REBOOTING';
    case 'HARD_REBOOT':
      return 'REBOOTING';
    case 'SUSPENDED':
      return 'SUSPENDED';
    case 'PAUSED':
      return 'PAUSED';
    case 'ERROR':
      return 'ERROR';
  }
};

// 새로고침
const refresh = () => {
  // stopInterval();
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  // startInterval(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 인스턴스 목록 조회 TODO: refactoring
const getResourceList = (pageNumber: number, pageSize: number) => {
  getInstanceList(pageNumber, pageSize)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        pagination.value.totalCount = res.data.totalCount;
        pagination.value.totalPage = res.data.totalPage;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

// interval 함수 정의
// const startInterval = (currentPage: number, pageSize: number) => {
//   getResourceList(currentPage, pageSize);
//   intervalId.value = window.setInterval(() => {
//     getResourceList(currentPage, pageSize);
//   }, 2000);
// };

// interval 종료
// const stopInterval = () => {
//   clearInterval(intervalId.value);
// };

const openConfirmModal = (action: string, instance?: InstanceType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  } else if (action === 'stop') {
    confirmModalData.value.confirmMethod = stopResource;
  } else if (action === 'start') {
    confirmModalData.value.confirmMethod = startResource;
  } else if (action === 'hard-reboot') {
    confirmModalData.value.confirmMethod = hardRebootResource;
  } else if (action === 'soft-reboot') {
    confirmModalData.value.confirmMethod = softRebootResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '인스턴스',
    selectedData,
    instance?.id,
    instance?.name,
    'name',
    action,
    t
  );
  if (instance && instance.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(instance.id);
    selectedData.value.rows.push(instance);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

// 수정 모달
const openUpdateFormModal = (instance: InstanceType) => {
  updateModalData.value = instance;
  instanceUpdateForm.value.server = instance;
  showUpdateModal.value = true;
};

// 인스턴스 스냅샷 생성 모달
const openCreateSnapshotModal = (instance: InstanceType) => {
  snapshotCreateData.value.serverId = instance.id;
  showCreateSnapshotModal.value = true;
};

const instanceDeleteForm = ref<InstanceDeleteType>({
  serverIds: [] as string[],
  projectId: '',
});

// 자원 수정 : 인스턴스 수정
const updateResource = (updateForm: BasicUpdateFormType<InstanceType>) => {
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

// 자원 생성 : 인스턴스 스냅샷 생성
const createResource = () => {
  createInstanceSnapshot(snapshotCreateData.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
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
        `${t('message.notification.error.create', {
          data: t('common.content.instance-snapshot'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 자원 삭제 : 인스턴스 삭제
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
      refresh();
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

// 자원 상태 변경 : 인스턴스 시작
const startResource = (resourceId: string) => {
  startInstance(resourceId)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update-status', {
          data: t('common.content.instance'),
        }),
        'color: #0068ff'
      );
      refresh();
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update-status', {
          data: t('common.content.instance'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 자원 상태 변경 : 인스턴스 중지
const stopResource = (resourceId: string) => {
  stopInstance(resourceId)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update-status', {
          data: t('common.content.instance'),
        }),
        'color: #0068ff'
      );
      refresh();
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update-status', {
          data: t('common.content.instance'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 자원 상태 변경 : 인스턴스 소프트 리부트
const softRebootResource = (resourceId: string) => {
  softRebootInstance(resourceId)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update-status', {
          data: t('common.content.instance'),
        }),
        'color: #0068ff'
      );
      refresh();
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update-status', {
          data: t('common.content.instance'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 자원 상태 변경 : 인스턴스 하드 리부트
const hardRebootResource = (resourceId: string) => {
  hardRebootInstance(resourceId)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update-status', {
          data: t('common.content.instance'),
        }),
        'color: #0068ff'
      );
      refresh();
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update-status', {
          data: t('common.content.instance'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: InstanceType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

onMounted(() => {
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  // startInterval(pagination.value.currentPage, pagination.value.pageSize);
});

// onUnmounted(() => {
//   stopInterval();
// });
</script>

<style lang="scss" scoped></style>
