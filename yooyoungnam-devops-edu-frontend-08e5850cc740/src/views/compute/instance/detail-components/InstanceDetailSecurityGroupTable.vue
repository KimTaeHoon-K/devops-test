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

  <div class="table-wrapper">
    <a-table
      :columns="columns"
      :data-source="data?.securityGroupRules"
      :row-key="'id'"
      :pagination="false"
      :loading="isLoading"
      bordered
    >
      <template #headerCell="{ column }">{{ t(column.title) }}</template>
      <template #bodyCell="{ column, text }">
        <template
          v-if="
            column.dataIndex === 'protocol' ||
            column.dataIndex === 'portRangeMax'
          "
        >
          <span>{{ text ? text : 'Any' }}</span>
        </template>
        <template v-else-if="column.dataIndex === 'remoteIpPrefix'">
          <span>{{ text ? text : '::/0' }}</span>
        </template>
        <template v-else>
          <span>{{ text ? text : '-' }}</span>
        </template>
        <template v-if="column.dataIndex === 'createdAt'">
          {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { dateConverter } from '@/utils/Converter';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { getInstanceDetailSecurityGroupList } from '@/axios/network-service/SecurityGroupApi';
import {
  InstanceDetailSecurityGroupListType,
  InstanceDetailSecurityGroupType,
  SecurityGroupType,
} from '@/types/network/security-group/SecurityGroupListType';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { confirmModalContentCreator } from '@/utils/CommonUtil';

const providerStore = ProviderStore();
watch(providerStore, (providerStore) => {
  // 프로젝트 별 조회인 경우.
  refresh();
});

const props = defineProps({
  securityGroupType: {
    type: String,
    required: true,
  },
  securityGroupId: {
    type: String,
    required: true,
  },
});

const pagination = ref<PaginationType>({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPage: 0,
});

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

const columns: TableColumnType<InstanceDetailSecurityGroupType>[] = [
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
    dataIndex: 'portRangeMax',
  },
  {
    title: 'common.column.remote-ip-prefix',
    dataIndex: 'remoteIpPrefix',
  },
  {
    title: 'common.column.remote-group-id',
    dataIndex: 'remoteGroupId',
  },
];
const data = ref<InstanceDetailSecurityGroupListType>();

// 새로고침
const refresh = () => {
  // data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  getResourceList();
};

// 자원 목록 조회 : 보안 그룹 목록 조회
const getResourceList = () => {
  getInstanceDetailSecurityGroupList(
    props.securityGroupId,
    props.securityGroupType
  )
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
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
const deleteResource = (idList?: string | string[]) => {
  console.log(idList);
  // deleteSecurityGroup(idList)
  //   .then((res) => {
  //     openNotification(
  //       true,
  //       '삭제가 성공적으로 완료되었습니다.',
  //       'color: #0068ff'
  //     );
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     openNotification(
  //       false,
  //       '삭제에 실패하였습니다.\n' + err.code + err.message,
  //       'color: #ff4d4f'
  //     );
  //   });
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
  getResourceList();
});
</script>

<style lang="scss" scoped></style>
