<template>
  <div class="button-wrapper right">
    <a-space class="space-block" :size="SizeConst.sixteen">
      <a-button
        size="middle"
        type="default"
        @click="
          goToPageByName(router, 'security group rule create', {
            id: props.securityGroupId,
          })
        "
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
    </a-space>
  </div>

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
      <template #headerCell="{ column }">{{ t(column.title) }} </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'direction'">
          {{ text ? firstCharToUpperCase(text) : '-' }}
        </template>
        <template v-if="column.dataIndex === 'portRange'">
          <template v-if="record.portRangeMin && record.portRangeMax">
            {{ record.portRangeMin }} ~ {{ record.portRangeMax }}
          </template>
          <template v-else> Any </template>
        </template>
        <template v-if="column.dataIndex === 'protocol'">
          {{ text ? text.toUpperCase() : 'Any' }}
        </template>
        <template v-if="column.dataIndex === 'remoteIpPrefix'">
          {{ text ? text : '::/0' }}
        </template>
        <template v-if="column.dataIndex === 'remoteGroupId'">
          {{ text ? text : '-' }}
        </template>
        <template v-if="column.dataIndex === 'icmp'">
          {{ text ? text : '-' }}
        </template>
        <template v-if="column.dataIndex === 'createdAt'">
          {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-if="column.dataIndex === 'optionButton'">
          <a-dropdown placement="bottomRight">
            <template #overlay>
              <a-menu>
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
import { dateConverter } from '@/utils/Converter';
import { goToPageByName } from '@/utils/RouterUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import {
  confirmModalContentCreator,
  firstCharToUpperCase,
  openNotification,
} from '@/utils/CommonUtil';
import {
  deleteSecurityGroupRule,
  getSecurityGroupRuleList,
} from '@/axios/network-service/SecurityGroupApi';
import { SecurityGroupRuleType } from '@/types/network/security-group/security-group-rule/SecurityGroupRuleListType';
import { SecurityGroupRuleDeleteType } from '@/types/network/security-group/security-group-rule/SecurityGroupRuleDeleteType';
import { SizeConst } from '@/types/common/constant/SizeConst';

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

const selectedData = ref<{ rows: SecurityGroupRuleType[]; keys: string[] }>({
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

const props = defineProps({
  securityGroupId: {
    type: String,
    required: true,
  },
});

watch(props, () => {
  if (props.securityGroupId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
});

const isLoading = ref<boolean>(true);

const columns: TableColumnType<SecurityGroupRuleType>[] = [
  {
    title: 'Direction',
    dataIndex: 'direction',
  },
  {
    title: 'common.column.ethernet-type',
    dataIndex: 'ethertype',
  },
  {
    title: 'common.column.ip-protocol',
    dataIndex: 'protocol',
  },
  {
    title: 'common.column.port-range',
    dataIndex: 'portRange',
  },
  {
    title: 'Remote IP Prefix',
    dataIndex: 'remoteIpPrefix',
  },
  {
    title: 'Remote Group ID',
    dataIndex: 'remoteGroupId',
  },
  {
    title: 'ICMP Type/ICMP Code',
    dataIndex: 'icmp',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
  },
  {
    title: '',
    dataIndex: 'optionButton',
    align: 'center',
  },
];
const data = ref<SecurityGroupRuleType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 보안 규칙 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getSecurityGroupRuleList(pageNumber, pageSize, props.securityGroupId)
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

const openConfirmModal = (
  action: string,
  securityGroupRule?: SecurityGroupRuleType
) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '보안 규칙',
    selectedData,
    securityGroupRule?.id,
    undefined,
    'name',
    action,
    t
  );
  if (securityGroupRule && securityGroupRule.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(securityGroupRule.id);
    selectedData.value.rows.push(securityGroupRule);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

const SecurityGroupRuleDeleteForm = ref<SecurityGroupRuleDeleteType>({
  securityGroupRuleIds: [] as string[],
});
// 자원 삭제 : 보안 규칙 삭제
const deleteResource = (idList: string[]) => {
  SecurityGroupRuleDeleteForm.value.securityGroupRuleIds = idList;
  deleteSecurityGroupRule(SecurityGroupRuleDeleteForm.value)
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
      selectedRows: SecurityGroupRuleType[]
    ) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

onMounted(() => {
  if (props.securityGroupId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
});
</script>
