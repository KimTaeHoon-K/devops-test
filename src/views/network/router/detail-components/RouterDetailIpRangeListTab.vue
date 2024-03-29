<template>
  <div class="button-wrapper right">
    <a-space class="space-block" :size="SizeConst.sixteen">
      <a-button
        size="middle"
        type="default"
        @click="
          goToPageByName(router, 'router ip range add', undefined, {
            networkId: networkId,
            projectId: projectId,
            subnetId: subnetId,
          })
        "
      >
        {{ t('common.content.action.ip-range-add') }}
      </a-button>
      <!--      <a-button-->
      <!--        size="middle"-->
      <!--        type="default"-->
      <!--        @click="openConfirmModal('delete')"-->
      <!--        :disabled="selectedData.rows.length === 0"-->
      <!--      >-->
      <!--        {{ t('common.content.action.delete') }}-->
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

  <!-- 포트 수정 모달 -->
  <PortUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'포트 수정'"
    :origin-data="updateModalData"
    @updateMethod="updateResource"
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
          t(column.title, { data: t('common.content.port') })
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
              goToPageByName(router, 'port detail', {
                id: record.id,
              })
            "
            >{{ text ? text : '(No name)' }}</a
          >
        </template>
        <template v-if="column.dataIndex === 'projectName'">
          {{ text ? text : '-' }}
        </template>
        <template v-if="column.dataIndex === 'deviceOwner'">
          {{ text ? text : '-' }}
        </template>
        <template v-if="column.dataIndex === 'ipv4Address'">
          <template v-if="getIpv4AddressList(record.fixedIps).length === 0">
            -
          </template>
          <template
            v-for="(fixedIp, idx) in getIpv4AddressList(record.fixedIps)"
            v-bind:key="fixedIp"
          >
            {{ fixedIp.ipAddress }}
            {{
              idx + 1 < getIpv4AddressList(record.fixedIps).length ? ', ' : ''
            }}
          </template>
        </template>
        <template v-if="column.dataIndex === 'virtualization'">
          {{ text ? 'Yes' : 'No' }}
        </template>
        <template v-if="column.dataIndex === 'status'">
          <span>
            <a-tag
              :key="text"
              :color="
                text?.toUpperCase() === 'ACTIVE' ? 'geekblue' : 'lightgray'
              "
            >
              {{ text?.toUpperCase() }}
            </a-tag>
          </span>
        </template>
        <template v-if="column.dataIndex === 'createdAt'">
          {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
        </template>
        <!--        <template v-if="column.dataIndex === 'optionButton'">-->
        <!--          <a-dropdown placement="bottomRight">-->
        <!--            <template #overlay>-->
        <!--              <a-menu>-->
        <!--                <a-menu-item @click="openUpdateFormModal(record)"-->
        <!--                  >{{ t('common.content.action.edit') }}-->
        <!--                </a-menu-item>-->
        <!--                <a-menu-item @click="openConfirmModal('delete', record)"-->
        <!--                  >{{ t('common.content.action.delete') }}-->
        <!--                </a-menu-item>-->
        <!--              </a-menu>-->
        <!--            </template>-->
        <!--            <ellipsis-outlined />-->
        <!--          </a-dropdown>-->
        <!--        </template>-->
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
import { EllipsisOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { dateConverter } from '@/utils/Converter';
import { goToPageByName } from '@/utils/RouterUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { NetworkListType } from '@/types/network/network/NetworkListType';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import {
  confirmModalContentCreator,
  getIpv4AddressList,
  openNotification,
} from '@/utils/CommonUtil';
import PortUpdateFormModal from '@/views/network/port/modal/PortUpdateFormModal.vue';
import {
  deletePort,
  getPortList,
  updatePort,
} from '@/axios/network-service/PortApi';
import { PortType } from '@/types/network/port/PortType';
import {
  PortUpdateFormType,
  PortUpdateType,
} from '@/types/network/port/PortUpdateType';
import { PortDeleteType } from '@/types/network/port/PortDeleteType';
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

const props = defineProps({
  projectId: {
    type: String,
    default: undefined,
  },
  routerId: {
    type: String,
    default: undefined,
  },
});

watch(props, () => {
  if (props.routerId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
});

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});
const selectedData = ref<{ rows: PortType[]; keys: string[] }>({
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

const columns: TableColumnType<NetworkListType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.ipv4-address',
    dataIndex: 'ipv4Address',
  },
  {
    title: 'common.column.mac-address',
    dataIndex: 'macAddress',
  },
  {
    title: 'common.column.connected-resource',
    dataIndex: 'deviceOwner',
  },
  {
    title: 'common.column.status',
    dataIndex: 'status',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
  },
  // {
  //   title: '',
  //   dataIndex: 'optionButton',
  //   align: 'center',
  // },
];
const data = ref<PortType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 포트 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getPortList(pageNumber, pageSize, undefined, undefined, props.routerId)
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

const openConfirmModal = (action: string, port?: PortType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '포트',
    selectedData,
    port?.id,
    port?.name,
    'name',
    action,
    t
  );
  if (port && port.id) {
    selectedData.value = { keys: [], rows: [] };
    selectedData.value.keys.push(port.id);
    selectedData.value.rows.push(port);
  }
  confirmModalData.value.confirmData = selectedData.value.keys;
  showConfirmModal.value = true;
};

// 자원 삭제 : 포트 삭제
const portDeleteForm = ref<PortDeleteType>({
  portIds: [] as string[],
});
const deleteResource = (idList: string[]) => {
  portDeleteForm.value.portIds = idList;
  deletePort(portDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.port'),
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
          data: t('common.content.port'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 자원 수정 : 포트 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<PortType>({} as PortType);
const portUpdateForm = ref<PortUpdateType>({
  port: {} as PortUpdateFormType,
});
const openUpdateFormModal = (port: PortType) => {
  updateModalData.value = Object.assign({}, port);
  portUpdateForm.value.port.id = port.id;
  showUpdateModal.value = true;
};
const updateResource = (updateForm: PortUpdateFormType) => {
  portUpdateForm.value.port = updateForm;
  updatePort(portUpdateForm.value.port.id, portUpdateForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.port'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.port'),
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
    onChange: (selectedRowKeys: string[], selectedRows: PortType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

onMounted(() => {
  if (props.routerId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
});
</script>

<style lang="scss" scoped></style>
