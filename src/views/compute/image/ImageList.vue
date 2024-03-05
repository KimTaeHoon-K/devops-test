<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra>
      <a-button
        size="middle"
        type="default"
        @click="goToPageByName(router, 'image create')"
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
    v-model:confirm-modal-data="confirmModalData"
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
          t(column.title, { data: t('common.content.image') })
        }}</template>
        <template v-else-if="column.dataIndex === 'projectName'">{{
          t(column.title, { data: t('common.content.project') })
        }}</template>
        <template v-else>
          {{ t(column.title) }}
        </template>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <a
            @click="
              goToPageByName(router, 'image detail', {
                imageId: record.id,
              })
            "
            >{{ text ? text : '(No name)' }}</a
          >
        </template>
        <template v-if="column.dataIndex === 'isProtected'">
          <span v-if="text">
            <lock-outlined :style="{ color: '#DE350B' }" />
          </span>
          <span v-else-if="!text">
            <unlock-outlined :style="{ color: '#1890ff' }" />
          </span>
        </template>
        <template v-if="column.dataIndex === 'size'">
          {{ bytesToGibConverter(text) }}
        </template>
        <template v-if="column.dataIndex === 'status'">
          <span>
            <a-tag
              :key="text"
              :color="text === 'active' ? 'geekblue' : 'lightgray'"
            >
              {{ text.toUpperCase() }}
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
                <a-menu-item
                  @click="
                    goToPageByName(router, 'image edit', { id: record.id })
                  "
                  >{{ t('common.content.action.edit') }}
                </a-menu-item>
                <a-menu-item @click="metadataManagement(record.id)"
                  >{{ t('common.content.action.metadata-management') }}
                </a-menu-item>
                <a-menu-item
                  :disabled="record.protected"
                  @click="openConfirmModal('delete', record)"
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
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import {
  EllipsisOutlined,
  LockOutlined,
  ReloadOutlined,
  UnlockOutlined,
} from '@ant-design/icons-vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { bytesToGibConverter, dateConverter } from '@/utils/Converter';
import { deleteImage, getImageList } from '@/axios/compute-service/ImageApi';
import { goToPageByName } from '@/utils/RouterUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { ImageType } from '@/types/compute/image/ImageListType';
import { PaginationType } from '@/types/common/PaginationType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { ImageDeleteType } from '@/types/compute/image/ImageDeleteType';

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
const selectedData = ref<{ rows: ImageType[]; keys: string[] }>({
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

const columns: TableColumnType<ImageType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.resource-name',
    dataIndex: 'projectName',
  },
  {
    title: 'common.column.visibility',
    dataIndex: 'visibility',
  },
  {
    title: 'common.column.disk-format',
    dataIndex: 'diskFormat',
  },
  {
    title: 'common.column.is-protected',
    dataIndex: 'isProtected',
  },
  {
    title: 'common.column.size',
    dataIndex: 'size',
    // sorter: true,
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
const data = ref<ImageType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 이미지 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getImageList(pageNumber, pageSize)
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

const metadataManagement = (id: string) => {
  console.log(id);
};

const openConfirmModal = (action: string, image?: ImageType) => {
  if (action === 'delete') {
    // 보호된 이미지는 체크박스/삭제 비활성화
    // if ((image && image.protected) || (!image && !canDelete.value)) {
    //   confirmModalData.value.modalContent =
    //     '해당 이미지는 보호된 이미지입니다. 보호 해제 뒤 다시 시도해 주세요.';
    //   confirmModalData.value.okButtonProps = { hidden: true };
    //   confirmModalData.value.cancelText = '확인';
    //   showConfirmModal.value = true;
    //   return;
    // } else {
    //   confirmModalData.value.confirmMethod = deleteResource;
    // }
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '이미지',
    selectedData,
    image?.id,
    image?.name,
    'name',
    action,
    t
  );
  if (image && image.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(image.id);
    selectedData.value.rows.push(image);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

const imageDeleteForm = ref<ImageDeleteType>({
  imageIds: [] as string[],
});
// 자원 삭제 : 이미지 삭제
const deleteResource = (idList: string[]) => {
  imageDeleteForm.value.imageIds = idList;
  deleteImage(imageDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.image'),
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
          data: t('common.content.image'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// const canDelete = ref<boolean>(true);
const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: ImageType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      // canDelete.value = selectedRows.filter((row) => row.protected).length <= 0;
    },
    selectedRowKeys: selectedData.value.keys,
    getCheckboxProps: (record: ImageType) => ({
      disabled: record.protected,
    }),
  };
});

onMounted(() => {
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
});
</script>
