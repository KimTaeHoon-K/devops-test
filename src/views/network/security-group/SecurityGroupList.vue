<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra>
      <a-button
        size="middle"
        type="default"
        @click="openCreateSecurityGroupModal"
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

  <!-- 보안 그룹 생성 모달 -->
  <SecurityGroupCreateFormModal
    v-if="showCreateSecurityGroupModal"
    v-model="showCreateSecurityGroupModal"
    :show-modal="showCreateSecurityGroupModal"
    :title="
      t('common.content.action.resource-create', {
        data: t('common.content.security-group'),
      })
    "
    v-model:name="securityGroupCreateData.name"
    v-model:description="securityGroupCreateData.description"
    v-model:project-id="securityGroupCreateData.projectId"
    @createMethod="createResource"
  />

  <!-- 보안 그룹 수정 모달 -->
  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'보안 그룹 수정'"
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
        <template v-if="column.dataIndex === 'name'">{{
          t(column.title, { data: t('common.content.security-group') })
        }}</template>
        <template v-else-if="column.dataIndex === 'tenantName'">{{
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
              goToPageByName(router, 'security group detail', {
                id: record.id,
              })
            "
            >{{ text ? text : '(No name)' }}</a
          >
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
                  @click="
                    goToPageByName(router, 'security group rule create', {
                      id: record.id,
                    })
                  "
                  >{{ t('common.content.action.security-rule-management') }}
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
  createSecurityGroup,
  deleteSecurityGroup,
  getSecurityGroupList,
  updateSecurityGroup,
} from '@/axios/network-service/SecurityGroupApi';
import { SecurityGroupType } from '@/types/network/security-group/SecurityGroupListType';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import SecurityGroupCreateFormModal from '@/views/network/security-group/modal/SecurityGroupCreateFormModal.vue';
import { SecurityGroupCreateType } from '@/types/network/security-group/SecurityGroupCreateType';
import { SecurityGroupDeleteType } from '@/types/network/security-group/SecurityGroupDeleteType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import { SecurityGroupUpdateType } from '@/types/network/security-group/SecurityGroupUpdateType';

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
const selectedData = ref<{ rows: SecurityGroupType[]; keys: string[] }>({
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

const columns: TableColumnType<SecurityGroupType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.resource-name',
    dataIndex: 'tenantName',
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
const data = ref<SecurityGroupType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 보안 그룹 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getSecurityGroupList(pageNumber, pageSize)
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

// 자원 생성 : 보안 그룹 생성
const showCreateSecurityGroupModal = ref<boolean>(false);
const securityGroupCreateData = ref<SecurityGroupCreateType>({
  name: '',
  description: '',
  projectId: undefined,
});
const openCreateSecurityGroupModal = () => {
  showCreateSecurityGroupModal.value = true;
};
const createResource = () => {
  createSecurityGroup(securityGroupCreateData.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.security-group'),
        }),
        'color: #0068ff'
      );
      refresh();
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.security-group'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 자원 수정 : 보안 그룹 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<SecurityGroupType>();
const securityGroupUpdateForm = ref<SecurityGroupUpdateType>({
  securityGroup: {} as SecurityGroupType,
});
const openUpdateFormModal = (securityGroup: SecurityGroupType) => {
  updateModalData.value = securityGroup;
  securityGroupUpdateForm.value.securityGroup = securityGroup;
  showUpdateModal.value = true;
};
const updateResource = (updateForm: BasicUpdateFormType<SecurityGroupType>) => {
  securityGroupUpdateForm.value.securityGroup.name = updateForm.name;
  securityGroupUpdateForm.value.securityGroup.description =
    updateForm.description;
  updateSecurityGroup(
    securityGroupUpdateForm.value.securityGroup.id,
    securityGroupUpdateForm.value
  )
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.security-group'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.security-group'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

const openConfirmModal = (
  action: string,
  securityGroup?: SecurityGroupType
) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '보안 그룹',
    selectedData,
    securityGroup?.id,
    securityGroup?.name,
    'name',
    action,
    t
  );
  if (securityGroup && securityGroup.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(securityGroup.id);
    selectedData.value.rows.push(securityGroup);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

// 자원 삭제 : 보안 그룹 삭제
const securityGroupDeleteForm = ref<SecurityGroupDeleteType>({
  securityGroupIds: [] as string[],
});
const deleteResource = (idList: string[]) => {
  securityGroupDeleteForm.value.securityGroupIds = idList;
  deleteSecurityGroup(securityGroupDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.security-group'),
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
          data: t('common.content.security-group'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

const rowSelection = computed(() => {
  return {
    onChange: (
      selectedRowKeys: string[],
      selectedRows: SecurityGroupType[]
    ) => {
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
