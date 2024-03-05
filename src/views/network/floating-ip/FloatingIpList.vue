<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra>
      <a-button
        size="middle"
        type="default"
        @click="goToPageByName(router, 'floating-ip create')"
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
  <DescriptionUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'유동 IP 수정'"
    :origin-data="updateModalData"
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
        <template v-if="column.dataIndex === 'projectName'">{{
          t(column.title, { data: t('common.content.project') })
        }}</template>
        <template v-else>
          {{ t(column.title) }}
        </template>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'floatingIpAddress'">
          <a
            @click="
              goToPageByName(router, 'floating ip detail', {
                id: record.id,
              })
            "
            >{{ text ? text : '(No IP)' }}</a
          >
        </template>
        <template v-if="column.dataIndex === 'status'">
          <span>
            <a-tag :key="text" :color="tagColor(text?.toUpperCase())">
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
                <a-menu-item
                  v-if="!record.portId"
                  @click="
                    goToPageByName(router, 'floating-ip associate', {
                      id: record.id,
                    })
                  "
                  >{{ t('common.content.action.resource-associate') }}
                </a-menu-item>
                <a-menu-item
                  v-if="record.portId"
                  @click="openConfirmModal('disassociate', record)"
                  >{{ t('common.content.action.resource-disassociate') }}
                </a-menu-item>
                <a-menu-item @click="openUpdateFormModal(record)"
                  >{{ t('common.content.action.edit') }}
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
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import { EllipsisOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { dateConverter } from '@/utils/Converter';
import { goToPageByName } from '@/utils/RouterUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import {
  deleteFloatingIp,
  disassociateFloatingIp,
  getFloatingIpList,
  updateFloatingIp,
} from '@/axios/network-service/FloatingApi';
import { FloatingIpType } from '@/types/network/floating-ip/FloatingIpListType';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { FloatingIpDeleteType } from '@/types/network/floating-ip/FloatingIpDeleteType';
import { DescriptionUpdateFormType } from '@/types/common/BasicUpdateFormType';
import DescriptionUpdateFormModal from '@/components/modal/DescriptionUpdateFormModal.vue';
import { FloatingIpUpdateType } from '@/types/network/floating-ip/FloatingIpUpdateType';

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
const selectedData = ref<{ rows: FloatingIpType[]; keys: string[] }>({
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

const columns: TableColumnType<FloatingIpType>[] = [
  {
    title: 'common.column.floating-ip',
    dataIndex: 'floatingIpAddress',
    // sorter: true,
  },
  {
    title: 'common.column.resource-name',
    dataIndex: 'projectName',
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
const data = ref<FloatingIpType[]>();

// 상태 태그 컬러 설정
const tagColor = (text: string) => {
  if (text === 'ACTIVE') {
    return 'geekblue';
  } else if (text === 'ERROR') {
    return 'volcano';
  } else {
    return 'lightgray';
  }
};

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 유동 IP 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getFloatingIpList(pageNumber, pageSize)
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

const openConfirmModal = (action: string, floatingIp?: FloatingIpType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  } else if (action === 'disassociate') {
    confirmModalData.value.confirmMethod = disassociateResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '유동 IP',
    selectedData,
    floatingIp?.id,
    floatingIp?.floatingIpAddress,
    'floatingIpAddress',
    action,
    t
  );
  if (floatingIp && floatingIp.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(floatingIp.id);
    selectedData.value.rows.push(floatingIp);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

// 자원 삭제 : 유동 IP 삭제
const floatingIpDeleteForm = ref<FloatingIpDeleteType>({
  floatingIpIds: [] as string[],
});
const deleteResource = (idList: string[]) => {
  floatingIpDeleteForm.value.floatingIpIds = idList;
  deleteFloatingIp(floatingIpDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.floating-ip'),
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
          data: t('common.content.floating-ip'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 자원 수정 : 유동 IP 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<FloatingIpType>({} as FloatingIpType);
const floatingIpUpdateForm = ref<FloatingIpUpdateType>({
  floatingIp: {} as FloatingIpType,
});
const openUpdateFormModal = (floatingIp: FloatingIpType) => {
  updateModalData.value = Object.assign({}, floatingIp);
  floatingIpUpdateForm.value.floatingIp.id = floatingIp.id;
  showUpdateModal.value = true;
};
const updateResource = (
  updateForm: DescriptionUpdateFormType<FloatingIpType>
) => {
  floatingIpUpdateForm.value.floatingIp.description = updateForm.description;
  updateFloatingIp(
    floatingIpUpdateForm.value.floatingIp.id,
    floatingIpUpdateForm.value
  )
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.floating-ip'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.floating-ip'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

// 자원 수정 : 유동 IP 연동 해제
const disassociateResource = (idList: string[]) => {
  disassociateFloatingIp(idList[0])
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.disassociate', {
          data: t('common.content.floating-ip'),
        }),
        'color: #0068ff'
      );
      refresh();
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.disassociate', {
          data: t('common.content.floating-ip'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: FloatingIpType[]) => {
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
