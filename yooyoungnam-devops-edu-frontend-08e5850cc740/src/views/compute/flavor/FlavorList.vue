<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra>
      <a-button
        size="middle"
        type="default"
        @click="goToPageByName(router, 'flavor create')"
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
    v-if="showConfirmModal"
    v-model="showConfirmModal"
    :show-modal="showConfirmModal"
    :title="confirmModalData.title"
    :ok-text="confirmModalData.okText"
    :ok-button-props="confirmModalData.okButtonProps"
    :cancel-text="confirmModalData.cancelText"
    :modal-content="confirmModalData.modalContent"
    :confirm-data="confirmModalData.confirmData"
    @confirmMethod="deleteResource"
  />

  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'인스턴스 유형 수정'"
    :origin-data="updateModalData"
    :name-disabled="true"
    @updateMethod="updateResource"
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
          t(column.title, { data: t('common.content.flavor') })
        }}</template>
        <template v-else>
          {{ t(column.title) }}
        </template>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <a
            @click="
              goToPageByName(router, 'flavor detail', {
                id: record.id,
              })
            "
            >{{ text ? text : '(No name)' }}</a
          >
        </template>
        <template v-if="column.dataIndex === 'vcpu'">
          <span>
            {{ text ? text : '-' }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'ram'">
          {{ mibToGibConverter(text) }}
        </template>
        <template v-if="column.dataIndex === 'osFlvEstDataEphemeral'">
          {{ text !== null ? gibConverter(text) : '-' }}
        </template>
        <template v-if="column.dataIndex === 'rootDisk'">
          {{ text !== null ? gibConverter(text) : '-' }}
        </template>
        <template v-if="column.dataIndex === 'osFlavorAccessIsPublic'">
          {{ text === true ? 'Yes' : 'No' }}
        </template>
        <template v-if="column.dataIndex === 'optionButton'">
          <a-dropdown placement="bottomRight">
            <template #overlay>
              <a-menu>
                <a-menu-item @click="openUpdateFormModal(record)">{{
                  t('common.content.action.edit')
                }}</a-menu-item>
                <!--                <a-menu-item @click="metadataManagement(record.id)"-->
                <!--                  >메타데이터 관리</a-menu-item-->
                <!--                >-->
                <a-menu-item @click="openConfirmModal('delete', record)">{{
                  t('common.content.action.delete')
                }}</a-menu-item>
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
import { EllipsisOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { gibConverter, mibToGibConverter } from '@/utils/Converter';
import { goToPageByName } from '@/utils/RouterUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { FlavorType } from '@/types/compute/flavor/FlavorListType';
import {
  deleteFlavor,
  getFlavorList,
  updateFlavor,
} from '@/axios/compute-service/FlavorApi';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import { FlavorUpdateType } from '@/types/compute/flavor/FlavorUpdateType';
import { FlavorDeleteType } from '@/types/compute/flavor/FlavorDeleteType';

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

const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<FlavorType>();

const selectedData = ref<{ rows: FlavorType[]; keys: string[] }>({
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

const columns: TableColumnType<FlavorType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'vCPU',
    dataIndex: 'vcpu',
    // sorter: true,
  },
  {
    title: 'common.column.memory',
    dataIndex: 'ram',
    // sorter: true,
  },
  {
    title: 'common.column.swap-disk',
    dataIndex: 'osFlvEstDataEphemeral',
    // sorter: true,
  },
  {
    title: 'common.column.root-disk',
    dataIndex: 'rootDisk',
    // sorter: true,
  },
  {
    title: 'common.column.is-public',
    dataIndex: 'osFlavorAccessIsPublic',
    // sorter: true,
  },
  {
    title: '',
    dataIndex: 'optionButton',
    align: 'center',
  },
];
const data = ref<FlavorType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 인스턴스 유형 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getFlavorList(pageNumber, pageSize)
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

const openUpdateFormModal = (flavor: FlavorType) => {
  updateModalData.value = flavor;
  flavorUpdateForm.value.flavor = flavor;
  showUpdateModal.value = true;
};

const flavorUpdateForm = ref<FlavorUpdateType>({
  flavor: {} as FlavorType,
});
const updateResource = (updateForm: BasicUpdateFormType<FlavorType>) => {
  flavorUpdateForm.value.flavor.name = updateForm.name;
  flavorUpdateForm.value.flavor.description = updateForm.description;

  updateFlavor(flavorUpdateForm.value.flavor.id, flavorUpdateForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.flavor'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.flavor'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

const openConfirmModal = (action: string, flavor?: FlavorType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '인스턴스 유형',
    selectedData,
    flavor?.id,
    flavor?.name,
    'name',
    action,
    t
  );
  if (flavor && flavor.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(flavor.id);
    selectedData.value.rows.push(flavor);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

const flavorDeleteForm = ref<FlavorDeleteType>({
  flavorIds: [] as string[],
});
// 자원 삭제 : 인스턴스 유형 삭제
const deleteResource = (idList: string[]) => {
  flavorDeleteForm.value.flavorIds = idList;
  deleteFlavor(flavorDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.flavor'),
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
          data: t('common.content.flavor'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

const metadataManagement = (id: string) => {
  console.log(id);
};

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: FlavorType[]) => {
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
