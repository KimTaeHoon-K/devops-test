<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra>
      <a-button
        size="middle"
        type="default"
        @click="goToPageByName(router, 'volume create')"
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

  <!-- 폼 모달 -->
  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'볼륨 수정'"
    :origin-data="updateModalData"
    @updateMethod="updateResource"
  >
    <a-form-item :label="'부팅 가능'">
      <a-switch v-model:checked="updateModalData.bootable" />
    </a-form-item>
  </BasicUpdateFormModal>

  <!-- 볼륨 스냅샷 생성 모달 -->
  <BasicCreateFormModal
    v-if="showCreateSnapshotModal"
    v-model="showCreateSnapshotModal"
    :show-modal="showCreateSnapshotModal"
    :title="
      t('common.content.action.resource-create', {
        data: t('common.content.volume-snapshot'),
      })
    "
    :name-input="true"
    :description-input="true"
    v-model:name="snapshotCreateData.name"
    v-model:description="snapshotCreateData.description"
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
          t(column.title, { data: t('common.content.volume') })
        }}</template>
        <template v-else>
          {{ t(column.title) }}
        </template>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <a
            @click="
              goToPageByName(router, 'volume detail', {
                id: record.id,
              })
            "
            >{{ text ? text : '(No name)' }}</a
          >
        </template>
        <template v-if="column.dataIndex === 'size'">
          {{ gibConverter(text) }}
        </template>
        <template v-if="column.dataIndex === 'attachments'">
          <span>
            {{
              text?.length > 0
                ? text[0].device +
                  ' on ' +
                  (text[0].serverName ? text[0].serverName : '삭제된 인스턴스')
                : '-'
            }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'bootable'">
          <span>
            {{ text ? 'Yes' : 'No' }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'multiattach'">
          <span>
            {{ text ? 'Yes' : 'No' }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'status'">
          <span>
            <a-tag :key="text" :color="getStatusColor(text)">
              {{ text?.toUpperCase() }}
            </a-tag>
          </span>
        </template>
        <template v-if="column.dataIndex === 'createdAt'">
          {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'optionButton'">
          <a-dropdown placement="bottomRight">
            <template #overlay>
              <a-menu>
                <a-menu-item @click="openUpdateFormModal(record)"
                  >{{ t('common.content.action.edit') }}
                </a-menu-item>
                <a-menu-item
                  @click="openCreateSnapshotModal(record)"
                  :disabled="record.status === 'in-use'"
                  >{{
                    t('common.content.action.resource-create', {
                      data: t('common.content.volume-snapshot'),
                    })
                  }}
                </a-menu-item>
                <!--                <a-menu-item-->
                <!--                  >{{ t('common.content.action.volume-migration') }}-->
                <!--                </a-menu-item>-->
                <!--                <a-menu-item-->
                <!--                  @click="openConfirmModal('status-change', record)"-->
                <!--                  >{{ t('common.content.action.status-change') }}-->
                <!--                </a-menu-item>-->
                <a-menu-item @click="openConfirmModal('delete', record)"
                  >{{ t('common.content.action.delete') }}
                </a-menu-item>
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
import { dateConverter, gibConverter } from '@/utils/Converter';
import { goToPageByName } from '@/utils/RouterUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { VolumeType } from '@/types/storage/volume/VolumeListType';
import {
  deleteVolume,
  getVolumeList,
  updateVolume,
} from '@/axios/storage-service/VolumeApi';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import { VolumeUpdateType } from '@/types/storage/volume/VolumeUpdateType';
import { VolumeDeleteType } from '@/types/storage/volume/VolumeDeleteType';
import { VolumeSnapshotCreateType } from '@/types/storage/volume-snapshot/VolumeSnapshotCreateType';
import BasicCreateFormModal from '@/components/modal/BasicCreateFormModal.vue';
import { createVolumeSnapshot } from '@/axios/storage-service/VolumeSnapshotApi';

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

// 페이지 변경
const changePagination = (pageNumber: number, pageSize: number) => {
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  getResourceList(pageNumber, pageSize);
};

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});

const selectedData = ref<{ rows: VolumeType[]; keys: string[] }>({
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

const columns: TableColumnType<VolumeType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.capacity',
    dataIndex: 'size',
    // sorter: true,
  },
  {
    title: 'common.column.type',
    dataIndex: 'volumeType',
  },
  {
    title: 'common.column.location',
    dataIndex: 'attachments',
  },
  {
    title: 'common.column.booting',
    dataIndex: 'bootable',
  },
  {
    title: 'common.column.shared',
    dataIndex: 'multiattach',
  },
  {
    title: 'common.column.status',
    dataIndex: 'status',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
    // sorter: true,
  },
  {
    title: '',
    dataIndex: 'optionButton',
    align: 'center',
  },
];
const data = ref<VolumeType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 볼륨 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getVolumeList(pageNumber, pageSize)
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

const getStatusColor = (status: string) => {
  if (status?.toUpperCase() === 'IN-USE') {
    return 'geekblue';
  } else if (status?.toUpperCase() === 'ERROR') {
    return 'volcano';
  }
  return 'lightgray';
};

const openConfirmModal = (action: string, volume?: VolumeType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  } else if (action === 'status-change') {
    confirmModalData.value.confirmMethod = changeResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '볼륨',
    selectedData,
    volume?.id,
    volume?.name,
    'name',
    action,
    t
  );
  if (volume && volume.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(volume.id);
    selectedData.value.rows.push(volume);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

const volumeDeleteForm = ref<VolumeDeleteType>({
  volumeIds: [] as string[],
});
// 자원 삭제 : 볼륨 삭제
const deleteResource = (idList: string[]) => {
  volumeDeleteForm.value.volumeIds = idList;
  deleteVolume(volumeDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.volume'),
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
          data: t('common.content.volume'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 볼륨 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<VolumeType>({} as VolumeType);
const volumeUpdateForm = ref<VolumeUpdateType>({
  volume: {} as VolumeType,
});
const openUpdateFormModal = (volume: VolumeType) => {
  updateModalData.value = Object.assign({}, volume);
  volumeUpdateForm.value.volume.id = volume.id;
  showUpdateModal.value = true;
};
const updateResource = (updateForm: BasicUpdateFormType<VolumeType>) => {
  volumeUpdateForm.value.volume.name = updateForm.name;
  volumeUpdateForm.value.volume.description = updateForm.description;
  volumeUpdateForm.value.volume.bootable = updateModalData.value.bootable;

  updateVolume(volumeUpdateForm.value.volume.id, volumeUpdateForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.volume'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.volume'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

// 볼륨 스냅샷 생성
const showCreateSnapshotModal = ref<boolean>(false);
const snapshotCreateData = ref<VolumeSnapshotCreateType>({
  name: '',
  description: '',
  volumeId: '',
});
const openCreateSnapshotModal = (volume: VolumeType) => {
  snapshotCreateData.value.volumeId = volume.id;
  showCreateSnapshotModal.value = true;
};
const createResource = () => {
  createVolumeSnapshot(snapshotCreateData.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
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
        `${t('message.notification.error.create', {
          data: t('common.content.volume-snapshot'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

const changeResource = (idList?: string | string[]) => {
  console.log('change-status');
};

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: VolumeType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

onMounted(() => {
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
});
</script>

<style lang="scss" scoped></style>
