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

  <!-- 폼 모달 -->
  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'네트워크 수정'"
    :origin-data="updateModalData"
    :description-update="false"
    @updateMethod="updateResource"
  >
    <a-row class="form-row" :gutter="12">
      <a-col :span="12">
        <a-form-item :label="'공유'">
          <a-switch v-model:checked="updateModalData.meta.shared" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item :label="'외부 라우팅'">
          <a-switch v-model:checked="updateModalData.meta.routerExternal" />
        </a-form-item>
      </a-col>
    </a-row>
  </BasicUpdateFormModal>

  <div>
    <a-form layout="vertical" :class="{ open: isChildClicked }">
      <a-row :gutter="12" class="topology-detail">
        <button @click="handleClose">
          <close-outlined />
        </button>
        <a-col :span="6">
          <span>{{ props.nodeDetailData?.name }}</span>
        </a-col>
        <a-col :span="6">
          <a-button
            size="middle"
            type="default"
            @click="openUpdateFormModal(props.nodeDetailData)"
            >{{ t('common.content.action.edit') }}</a-button
          >
          <a-button
            size="middle"
            type="default"
            @click="openConfirmModal('delete', props.nodeDetailData)"
            >{{ t('common.content.action.delete') }}</a-button
          >
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <a-tag
            :color="getStatusColor(props.nodeDetailData?.meta?.originalStatus)"
          >
            <template
              #icon
              v-if="
                props.nodeDetailData?.meta?.originalStatus.toUpperCase() !==
                'ACTIVE'
              "
            >
              <exclamation-circle-outlined /> </template
            >{{ props.nodeDetailData?.meta?.originalStatus }}
          </a-tag>
        </a-col>
        <a-col>
          <div class="information">
            <span class="txt">{{ props.nodeDetailData?.id }}</span>
            <CopyButton :textToCopy="props.nodeDetailData?.id" />
          </div>
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <a-descriptions bordered :column="1">
            <a-descriptions-item :label="t('common.content.external-network')">
              {{ props.nodeDetailData?.meta?.routerExternal ? 'Yes' : 'No' }}
            </a-descriptions-item>
            <a-descriptions-item :label="'공유'">
              {{ props.nodeDetailData?.meta?.shared ? 'Yes' : 'No' }}
            </a-descriptions-item>
            <a-descriptions-item :label="'공급자 네트워크 타입'">
              {{ props.nodeDetailData?.meta?.providerNetworkType }}
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="1" tab="연동 자원">
              <a-card title="연동자원">
                <template #extra>
                  <a-button
                    size="middle"
                    type="default"
                    @click="
                      goToPageByName(
                        router,
                        'network subnet create',
                        { id: props.nodeDetailData.id },
                        { projectId: props.nodeDetailData.meta.projectId }
                      )
                    "
                  >
                    서브넷 생성
                  </a-button>
                  <a-button
                    size="middle"
                    type="default"
                    @click="
                      goToPageByName(router, 'port create', undefined, {
                        networkId: props.nodeDetailData.id,
                        projectId: props.nodeDetailData.meta.projectId,
                      })
                    "
                  >
                    포트 생성
                  </a-button>
                </template>
                <a-table
                  :columns="connResourceColumns"
                  :data-source="connResourceTableData"
                  :row-key="'id'"
                  :pagination="false"
                  :loading="isConnResourceLoading"
                  bordered
                >
                </a-table>
              </a-card>
            </a-tab-pane>
            <a-tab-pane key="2" tab="유동 IP" force-render>
              <a-card title="유동 IP">
                <template #extra>
                  <a-button size="middle" type="default">{{
                    t('common.content.action.create')
                  }}</a-button>
                </template>
                <a-table
                  :columns="floatingIpColumns"
                  :data-source="floatingIpData"
                  :row-key="'id'"
                  :pagination="false"
                  :loading="isFloatingIpLoading"
                  bordered
                >
                  <template #headerCell="{ column }">
                    {{ t(column.title) }}
                  </template>
                  <template #bodyCell="{ column, text }">
                    <template v-if="column.dataIndex === 'floatingIpAddress'">
                      {{ text ? text : '(No IP)' }}
                    </template>
                    <template v-if="column.dataIndex === 'status'">
                      <span>
                        <a-tag
                          :key="text"
                          :color="getStatusColor(text?.toUpperCase())"
                        >
                          {{ text?.toUpperCase() }}
                        </a-tag>
                      </span>
                    </template>
                  </template>
                </a-table>
              </a-card>
            </a-tab-pane>
            <!-- TODO: 추후 프로메테우스에서 트래픽 정보 조회 -->
            <!--            <a-tab-pane key="3" tab="모니터링">-->
            <!--              <a-card title="모니터링">-->
            <!--                <template #extra>-->
            <!--                  <a-button size="middle" type="default">-->
            <!--                    {{ t('common.content.action.create') }}-->
            <!--                  </a-button>-->
            <!--                </template>-->
            <!--                <table>-->
            <!--                  <thead>-->
            <!--                    <tr>-->
            <!--                      <th></th>-->
            <!--                      <th><span>서브셋명</span></th>-->
            <!--                      <th><span>192.198.90.0 - 192.198.0.254</span></th>-->
            <!--                    </tr>-->
            <!--                  </thead>-->
            <!--                  <tbody>-->
            <!--                    <tr>-->
            <!--                      <td></td>-->
            <!--                      <td><span>포트명</span></td>-->
            <!--                      <td><span>192.198.90.0</span></td>-->
            <!--                    </tr>-->
            <!--                  </tbody>-->
            <!--                </table>-->
            <!--              </a-card>-->
            <!--            </a-tab-pane>-->
          </a-tabs>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import CopyButton from '@/components/CopyButton.vue';
import {
  CloseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue';
import { TopologyNodeType } from '@/types/network/topology/TopologyNodeType';
import { TableColumnType } from 'ant-design-vue';
import { FloatingIpType } from '@/types/network/floating-ip/FloatingIpListType';
import { getFloatingIpList } from '@/axios/network-service/FloatingApi';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { NetworkType } from '@/types/network/network/NetworkListType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { NetworkDeleteType } from '@/types/network/network/NetworkDeleteType';
import {
  deleteNetwork,
  updateNetwork,
} from '@/axios/network-service/NetworkApi';
import { NetworkUpdateType } from '@/types/network/network/NetworkUpdateType';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import { goToPageByName } from '@/utils/RouterUtil';
import { useRouter } from 'vue-router';

const props = defineProps({
  isChildClicked: {
    type: Boolean,
    default: false,
  },
  nodeDetailData: {
    type: Object as () => TopologyNodeType,
    required: true,
  },
});

const prevNodeDetailDataId = ref<string>();
watch(props, () => {
  if (props.nodeDetailData.id !== prevNodeDetailDataId.value) {
    prevNodeDetailDataId.value = props.nodeDetailData.id;
    isFloatingIpLoading.value = true;
    floatingIpData.value = [];
    getFloatingIpResourceList(props.nodeDetailData.id);
    isConnResourceLoading.value = true;
    connResourceTableData.value = [];
    getConnResourceList();
  }
});

const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const activeKey = ref('1');

const emits = defineEmits({});
const handleClose = () => {
  emits('update:isChildClicked', false);
};

const getStatusColor = (status: string) => {
  if (status?.toUpperCase() === 'ACTIVE') {
    return 'geekblue';
  } else if (status?.toUpperCase() === 'ERROR') {
    return 'volcano';
  }
  return 'lightgray';
};

const connResourceColumns: TableColumnType<TableDataItem>[] = [
  {
    title: 'common.column.floating-ip',
    dataIndex: 'name',
  },
  {
    title: 'common.column.resource-name',
    dataIndex: 'ipData',
  },
];

interface TableDataItem {
  id: string;
  name: string;
  type: string; // 서브넷과 포트 구분 필드명. subnet/port
  ipData: string;
  children?: TableDataItem[];
}

const connResourceTableData = ref<TableDataItem[]>([]);
const isConnResourceLoading = ref<boolean>(true);
const getConnResourceList = () => {
  propsDataToTableData();
};
const propsDataToTableData = () => {
  if (props.nodeDetailData.meta?.subnets) {
    props.nodeDetailData.meta?.subnets.map((subnet: any) => {
      let childrenData = [] as TableDataItem[];
      if (subnet.ports.length > 0) {
        subnet.ports.map((port: any) => {
          childrenData.push({
            id: port.id,
            name: port.name ? port.name : '(NoName)',
            type: 'port',
            ipData: port.ips[0],
          });
        });
      }
      connResourceTableData.value.push({
        id: subnet.id,
        name: subnet.name,
        ipData: subnet.cidr,
        type: 'subnet',
        children: childrenData,
      });
    });
    isConnResourceLoading.value = false;
  }
};

const floatingIpColumns: TableColumnType<FloatingIpType>[] = [
  {
    title: 'common.column.floating-ip',
    dataIndex: 'floatingIpAddress',
  },
  {
    title: 'common.column.resource-name',
    dataIndex: 'projectName',
  },
  {
    title: 'common.column.status',
    dataIndex: 'status',
  },
];
const floatingIpData = ref<FloatingIpType[]>();
const isFloatingIpLoading = ref<boolean>(true);
const getFloatingIpResourceList = (networkId: string) => {
  getFloatingIpList(1, Number.MAX_SAFE_INTEGER, undefined, undefined, networkId)
    .then((res) => {
      if (res.status === 200) {
        floatingIpData.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isFloatingIpLoading.value = false;
    });
};

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});

const openConfirmModal = (action: string, network: TopologyNodeType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '네트워크',
    undefined,
    network?.id,
    network?.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [network.id];
  showConfirmModal.value = true;
};

const networkDeleteForm = ref<NetworkDeleteType>({
  networkIds: [] as string[],
});
// 자원 삭제 : 네트워크 삭제
const deleteResource = (idList: string[]) => {
  networkDeleteForm.value.networkIds = idList;
  deleteNetwork(networkDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.network'),
        }),
        'color: #0068ff'
      );
      emits('update:isRefresh', true);
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.network'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 네트워크 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<TopologyNodeType>({} as TopologyNodeType);
const networkUpdateForm = ref<NetworkUpdateType>({
  network: {} as NetworkType,
});
const openUpdateFormModal = (network: TopologyNodeType) => {
  updateModalData.value = Object.assign({}, network);
  networkUpdateForm.value.network.id = network.id;
  showUpdateModal.value = true;
};
const updateResource = (updateForm: BasicUpdateFormType<NetworkType>) => {
  networkUpdateForm.value.network.name = updateForm.name;
  networkUpdateForm.value.network.shared = updateModalData.value.meta.shared;
  networkUpdateForm.value.network.routerExternal =
    updateModalData.value.meta.routerExternal;

  updateNetwork(networkUpdateForm.value.network.id, networkUpdateForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.network'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.network'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      emits('update:isRefresh', true);
    });
};

onMounted(() => {
  getConnResourceList();
  getFloatingIpResourceList(props.nodeDetailData.id);
});
</script>
<style lang="scss" scoped></style>
