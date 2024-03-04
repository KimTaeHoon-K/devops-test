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
    @cancelMethod="cancelModal"
  />

  <!-- 볼륨 타입 생성 모달 -->
  <VolumeTypeCreateFormModal
    v-if="showCreateModel"
    v-model="showCreateModel"
    v-model:is-succeed="isSucceed"
    :show-modal="showCreateModel"
    :title="'볼륨 타입 생성'"
    @cancelMethod="cancelModal"
  />

  <!-- 볼륨 타입 수정 모달 -->
  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'볼륨 타입 수정'"
    :origin-data="updateModalData"
    @updateMethod="updateResource"
    @cancelMethod="cancelModal"
  />

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
        t(column.title, { data: t('common.content.volume-type') })
      }}</template>
      <template v-else>
        {{ t(column.title) }}
      </template>
    </template>
    <template #bodyCell="{ column, text, record }">
      <template v-if="column.dataIndex === 'name'">
        <a
          @click="
            goToPageByName(router, 'volume type detail', {
              id: record.id,
            })
          "
          >{{ text ? text : '(No name)' }}</a
        >
      </template>
      <template v-if="column.dataIndex === 'description'">
        <span>
          {{ text ? text : '-' }}
        </span>
      </template>
      <template v-if="column.dataIndex === 'publicIs'">
        <span>
          {{ text ? 'Yes' : 'No' }}
        </span>
      </template>
      <template v-if="column.dataIndex === 'optionButton'">
        <a-dropdown placement="bottomRight">
          <template #overlay>
            <a-menu>
              <a-menu-item @click="openUpdateFormModal(record)"
                >{{ t('common.content.action.edit') }}
              </a-menu-item>
              <a-menu-item
                @click="
                  goToPageByName(router, 'qos specs mgmt', {
                    id: record.id,
                  })
                "
                >QoS Specs 관리
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
    :show-total="(total, range) => `${range[0]}-${range[1]} of ${total} items`"
    :default-current="1"
    :default-page-size="10"
    :show-size-changer="true"
    @change="changePagination"
  />
</template>

<script lang="ts" setup>
import {
  computed,
  defineEmits,
  defineProps,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import { EllipsisOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { goToPageByName } from '@/utils/RouterUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import {
  deleteVolumeType,
  getVolumeTypeList,
  updateVolumeType,
} from '@/axios/storage-service/VolumeTypeApi';
import { VolumeTypeType } from '@/types/storage/volume-type/VolumeTypeListType';
import { VolumeTypeDeleteType } from '@/types/storage/volume-type/VolumeTypeDeleteType';
import { FlavorType } from '@/types/compute/flavor/FlavorListType';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import { VolumeTypeUpdateType } from '@/types/storage/volume-type/VolumeTypeUpdateType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import VolumeTypeCreateFormModal from '@/views/storage/volume-type/modal/VolumeTypeCreateFormModal.vue';

const props = defineProps({
  showConfirmModalProp: {
    type: Boolean,
    default: false,
  },
  showCreateModalProp: {
    type: Boolean,
    default: false,
  },
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

const cancelModal = (action: string) => {
  if (action === 'confirm') {
    emit('update:showConfirmModalProp', false);
  } else if (action === 'create') {
    emit('update:showCreateModalProp', false);
  } else if (action === 'update') {
    emit('update:showUpdateModalProp', false);
  }
};

const selectedData = ref<{ rows: VolumeTypeType[]; keys: string[] }>({
  rows: [],
  keys: [],
});

const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const isLoading = ref<boolean>(true);

const columns: TableColumnType<VolumeTypeType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.description',
    dataIndex: 'description',
  },
  {
    title: 'common.column.is-public',
    dataIndex: 'publicIs',
  },
  {
    title: '',
    dataIndex: 'optionButton',
    align: 'center',
  },
];
const data = ref<VolumeTypeType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 볼륨 타입 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getVolumeTypeList(pageNumber, pageSize)
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

// 볼륨 타입 생성
const showCreateModel = ref<boolean>(false);
const isSucceed = ref<boolean>(false);
const openCreateModal = () => {
  showCreateModel.value = true;
};

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});
const openConfirmModal = (action: string, volumeType?: VolumeTypeType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '볼륨 타입',
    selectedData,
    volumeType?.id,
    volumeType?.name,
    'name',
    action,
    t
  );
  if (volumeType && volumeType.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(volumeType.id);
    selectedData.value.rows.push(volumeType);
  }
  emit('update:selectedDataCount', selectedData.value.rows.length);
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

// 자원 삭제 : 볼륨 타입 삭제
const volumeTypeDeleteForm = ref<VolumeTypeDeleteType>(
  {} as VolumeTypeDeleteType
);
const deleteResource = (idList: string[]) => {
  volumeTypeDeleteForm.value.volumeTypeIds = idList;
  deleteVolumeType(volumeTypeDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.volume-type'),
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
          data: t('common.content.volume-type'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      emit('update:showConfirmModalProp');
    });
};

// 볼륨 타입 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<VolumeTypeType>();
const volumeTypeUpdateForm = ref<VolumeTypeUpdateType>({
  volumeType: {} as VolumeTypeType,
});
const openUpdateFormModal = (volumeType: VolumeTypeType) => {
  updateModalData.value = volumeType;
  volumeTypeUpdateForm.value.volumeType = volumeType;
  showUpdateModal.value = true;
};
const updateResource = (updateForm: BasicUpdateFormType<FlavorType>) => {
  volumeTypeUpdateForm.value.volumeType.name = updateForm.name;
  volumeTypeUpdateForm.value.volumeType.description = updateForm.description;

  updateVolumeType(
    volumeTypeUpdateForm.value.volumeType.id,
    volumeTypeUpdateForm.value
  )
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.volume-type'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.volume-type'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

const emit = defineEmits({});

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: VolumeTypeType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      emit('update:selectedDataCount', selectedRows.length);
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

watch([props, isSucceed], () => {
  if (props.showConfirmModalProp) {
    openConfirmModal('delete');
  }
  if (props.showCreateModalProp) {
    openCreateModal();
  }
  if (isSucceed.value) {
    isSucceed.value = false;
    emit('update:showCreateModalProp');
    refresh();
  }
});

onMounted(() => {
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
});
onUnmounted(() => {
  emit('update:selectedDataCount', 0);
});
</script>

<style lang="scss" scoped></style>
