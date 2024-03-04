<template>
  <div class="button-wrapper right">
    <a-space class="space-block" :size="SizeConst.sixteen">
      <a-button size="middle" type="default" @click="openManagementModal">
        {{ t('common.content.connection-management') }}
      </a-button>
      <!--      <a-button-->
      <!--        size="middle"-->
      <!--        type="default"-->
      <!--        :disabled="selectedData.rows.length === 0"-->
      <!--        @click="openConfirmModal('detach')"-->
      <!--      >-->
      <!--        {{ t('common.content.detach') }}-->
      <!--      </a-button>-->
    </a-space>
  </div>

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

  <!-- 볼륨 연결 관리 모달 -->
  <InstanceVolumeManagementModal
    v-if="showManagementModal"
    v-model="showManagementModal"
    :title="'볼륨 관리'"
    :show-modal="showManagementModal"
    :instance-id="props.instanceId"
    :instance-name="props.instanceName"
    :attached-volume-list="data"
    @attachMethod="attachVolumeResource"
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

  <div class="table-wrapper">
    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      :row-key="'id'"
      :pagination="false"
      :loading="isLoading"
      bordered
    >
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
          <a>{{ text ? text : '(No name)' }}</a>
        </template>
        <template v-if="column.dataIndex === 'size'">
          {{ gibConverter(text) }}
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
                <!--                <a-menu-item-->
                <!--                  >{{ t('common.content.action.volume-migration') }}-->
                <!--                </a-menu-item>-->
                <a-menu-item @click="openConfirmModal('detach', record)"
                  >{{ t('common.content.action.detach') }}
                </a-menu-item>
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
import { computed, defineProps, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import { EllipsisOutlined } from '@ant-design/icons-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { dateConverter, gibConverter } from '@/utils/Converter';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { VolumeType } from '@/types/storage/volume/VolumeListType';
import {
  attachVolume,
  detachVolume,
  getVolumeListByInstanceId,
  updateVolume,
} from '@/axios/storage-service/VolumeApi';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import InstanceVolumeManagementModal from '@/views/compute/instance/detail-components/modal/InstanceVolumeManagementModal.vue';
import {
  VolumeDetachConfirmType,
  VolumeDetachType,
} from '@/types/storage/volume/VolumeDetachType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import { VolumeUpdateType } from '@/types/storage/volume/VolumeUpdateType';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import { SizeConst } from '@/types/common/constant/SizeConst';

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

const props = defineProps({
  detailInfoVolumeIds: {
    type: Array,
  },
  instanceId: {
    type: String,
    required: true,
  },
  instanceName: {
    type: String,
    required: true,
  },
});

watch(props, () => {
  if (props.instanceId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
});

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
  },
  {
    title: 'common.column.capacity',
    dataIndex: 'size',
  },
  {
    title: 'common.column.type',
    dataIndex: 'volumeType',
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
  },
  {
    title: '',
    dataIndex: 'optionButton',
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
  getVolumeListByInstanceId(pageNumber, pageSize, props.instanceId)
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
  if (action === 'detach') {
    confirmModalData.value.confirmMethod = detachResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    t('common.content.volume'),
    selectedData,
    volume?.id,
    volume?.name,
    'name',
    action,
    t
  );
  // TODO: 다중 해제
  let attachmentId;
  if (volume && volume.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(volume.id);
    selectedData.value.rows.push(volume);

    attachmentId = volume.attachments.filter((attach) => {
      return attach.serverId === props.instanceId;
    })[0].attachmentId;
  }
  confirmModalData.value.confirmData = {
    volumeId: selectedData.value.keys[0],
    attachmentId: attachmentId,
  };
  showConfirmModal.value = true;
};

// 자원 삭제 : 볼륨 해제
const detachResource = (volumeDetachConfirmType: VolumeDetachConfirmType) => {
  let volumeDetachType = {} as VolumeDetachType;
  volumeDetachType.attachmentId = volumeDetachConfirmType.attachmentId;
  detachVolume(volumeDetachConfirmType.volumeId, volumeDetachType)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.detach', {
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
        `${t('message.notification.error.detach', {
          data: t('common.content.volume'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 자원 관리 : 볼륨 연결
const showManagementModal = ref<boolean>(false);
const openManagementModal = () => {
  showManagementModal.value = true;
};
const attachVolumeResource = (volumeId: string) => {
  attachVolume(volumeId, props.instanceId)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.attach', {
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
        `${t('message.notification.error.attach', {
          data: t('common.content.volume'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 자원 수정 : 볼륨 수정
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
  if (props.instanceId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
});
</script>

<style lang="scss" scoped></style>
