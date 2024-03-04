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
            @click="
              goToPageByName(router, 'network subnet update', {
                id: props.nodeDetailData.meta.networkId,
                subnetId: props.nodeDetailData.id,
              })
            "
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
          <div class="information">
            <span class="txt">{{ props.nodeDetailData?.id }}</span>
            <CopyButton :textToCopy="props.nodeDetailData?.id" />
          </div>
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <a-descriptions bordered :column="1">
            <a-descriptions-item :label="'게이트웨이 IP'">
              {{ props.nodeDetailData?.meta?.gatewayIp }}
            </a-descriptions-item>
            <a-descriptions-item :label="'CIDR'">
              {{ props.nodeDetailData?.meta?.cidr }}
            </a-descriptions-item>
          </a-descriptions>
        </a-col>
      </a-row>
      <a-row>
        <a-col>
          <a-card title="연동 포트">
            <template #extra>
              <a-button
                size="middle"
                type="default"
                @click="
                  goToPageByName(router, 'port create', undefined, {
                    networkId: props.nodeDetailData.meta.networkId,
                    projectId: props.nodeDetailData.meta.projectId,
                    subnetId: props.nodeDetailData.id,
                  })
                "
              >
                추가
              </a-button>
            </template>
            <a-table
              :columns="columns"
              :data-source="data"
              :row-key="'id'"
              :pagination="false"
              :loading="isPortLoading"
              bordered
            >
              <template #headerCell="{ column }">
                <template v-if="column.dataIndex === 'name'">{{
                  t(column.title, { data: t('common.content.port') })
                }}</template>
                <template v-else>
                  {{ t(column.title) }}
                </template>
              </template>
              <template #bodyCell="{ column, text }">
                <template v-if="column.dataIndex === 'name'">
                  {{ text ? text : '(No name)' }}
                </template>
                <template v-if="column.dataIndex === 'fixedIps'">
                  <template v-if="text.length === 0"> - </template>
                  <template v-for="(fixedIp, idx) in text" v-bind:key="fixedIp">
                    {{ fixedIp.ipAddress }}
                    {{ idx + 1 < text.length ? ', ' : '' }}
                  </template>
                </template>
              </template>
            </a-table>
          </a-card>
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
import { CloseOutlined } from '@ant-design/icons-vue';
import { TopologyNodeType } from '@/types/network/topology/TopologyNodeType';
import { getPortList } from '@/axios/network-service/PortApi';
import { PortType } from '@/types/network/port/PortType';
import { TableColumnType } from 'ant-design-vue';
import { goToPageByName } from '@/utils/RouterUtil';
import { useRouter } from 'vue-router';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { SubnetType } from '@/types/network/network/subnet/SubnetListType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import { SubnetDeleteType } from '@/types/network/network/subnet/SubnetDeleteType';
import { deleteSubnet } from '@/axios/network-service/SubnetApi';

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
    isPortLoading.value = true;
    data.value = [];
    getResourceList(props.nodeDetailData.id);
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

const columns: TableColumnType<PortType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
  },
  {
    title: 'common.column.fixed-ip',
    dataIndex: 'fixedIps',
  },
];
const data = ref<PortType[]>();
const isPortLoading = ref<boolean>(true);
const getResourceList = (subnetId: string) => {
  getPortList(1, Number.MAX_SAFE_INTEGER, undefined, subnetId, undefined)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isPortLoading.value = false;
    });
};

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});

const openConfirmModal = (action: string, subnet: TopologyNodeType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '서브넷',
    undefined,
    subnet?.id,
    subnet?.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [subnet.id];
  showConfirmModal.value = true;
};

// 자원 삭제 : 서브넷 삭제
const subnetDeleteForm = ref<SubnetDeleteType>({
  subnetIds: [] as string[],
});
const deleteResource = (idList: string[]) => {
  subnetDeleteForm.value.subnetIds = idList;
  deleteSubnet(subnetDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.subnet'),
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
          data: t('common.content.subnet'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

onMounted(() => {
  getResourceList(props.nodeDetailData.id);
});
</script>
<style lang="scss" scoped></style>
