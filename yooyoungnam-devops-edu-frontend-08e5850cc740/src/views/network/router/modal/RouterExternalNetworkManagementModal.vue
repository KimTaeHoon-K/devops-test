<template>
  <div class="modal">
    <a-modal
      :visible="props.showModal"
      :title="props.title"
      :okText="'확인'"
      @ok="handleFormModalSubmit"
      :cancelText="'취소'"
      @cancel="handleFormModalCancel"
      width="1000px"
      centered
    >
      <Form :validation-schema="validationSchema" ref="updateForm">
        <a-form class="form" name="basic" layout="vertical">
          <div class="head-title-wrapper">
            <h3 class="heading-sub-title">
              {{ '외부 게이트웨이 정보' }}
            </h3>
          </div>
          <a-row class="form-row" :gutter="12">
            <a-col :span="24">
              <a-form-item
                :label="
                  t('common.column.resource-name', {
                    data: t('common.content.router'),
                  })
                "
              >
                <a-input :value="props.originData.name" disabled />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <div class="ant-form-item-label">
              <label for="volumeIds">{{ '선택 네트워크' }}</label>
            </div>
          </a-row>
          <div class="head-title-wrapper normal-word">
            <p class="text" v-if="selectedData.rows.length === 0">
              {{ '네트워크를 선택해 주세요.' }}
            </p>
            <p class="text" v-else>
              <a-tag
                v-for="network in selectedData.rows"
                v-bind:key="network.id"
                closable
                @close="deselectItem(network)"
                >{{
                  network.name ? network.name : '(No Name) / ' + network.id
                }}</a-tag
              >
            </p>
          </div>
          <Field
            name="networkId"
            v-slot="{ errorMessage }"
            v-model:value="networkId"
          >
            <a-form-item
              :rules="[{ required: true }]"
              :help="errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
            >
              <a-table
                v-model:value="networkId"
                :row-selection="rowSelection"
                :columns="columns"
                :data-source="data"
                :row-key="'id'"
                :pagination="false"
                :loading="isLoading"
                :scroll="{ y: 300 }"
                bordered
              >
                <template #headerCell="{ column }">
                  <template v-if="column.dataIndex === 'name'">{{
                    t(column.title, { data: t('common.content.network') })
                  }}</template>
                  <template v-else>
                    {{ t(column.title) }}
                  </template>
                </template>
                <template #bodyCell="{ column, text }">
                  <template v-if="column.dataIndex === 'name'">
                    <span>
                      {{ text ? text : '(No name)' }}
                    </span>
                  </template>
                  <template v-if="column.dataIndex === 'status'">
                    <span>
                      <a-tag :key="text" :color="getStatusColor(text)">
                        {{ text?.toUpperCase() }}
                      </a-tag>
                    </span>
                  </template>
                  <template v-if="column.dataIndex === 'createdAt'">
                    {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
                  </template>
                </template>
              </a-table>
            </a-form-item>
          </Field>
        </a-form>
      </Form>
      <slot />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineEmits, defineProps, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Field, Form, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { TableColumnType } from 'ant-design-vue';
import { VolumeType } from '@/types/storage/volume/VolumeListType';
import { dateConverter } from '@/utils/Converter';
import { getNetworkList } from '@/axios/network-service/NetworkApi';
import { NetworkType } from '@/types/network/network/NetworkListType';
import { RouterUpdateType } from '@/types/network/router/RouterUpdateType';
import { RouterType } from '@/types/network/router/RouterListType';
import { ExternalGateWayInfoType } from '@/types/network/common/NetworkCommonType';

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  originData: {
    type: Object as () => RouterType,
    required: true,
  },
});

const isLoading = ref<boolean>(true);

const data = ref<NetworkType[]>([] as NetworkType[]);
const columns: TableColumnType<VolumeType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
  },
  {
    title: 'common.column.status',
    dataIndex: 'status',
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
  },
];

const networkId = ref<string | undefined>();

// 자원 조회 : 외부 연결 가능 네트워크 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getNetworkList(pageNumber, pageSize, undefined, true)
    .then((res) => {
      if (res.status === 200) {
        let tempData = res.data.data;
        if (tempData.length > 0) {
          data.value = tempData.filter((network) => {
            return network.subnets.length > 0;
          });
          if (props.originData.externalGatewayInfo?.networkId) {
            networkId.value = props.originData.externalGatewayInfo.networkId;
            selectedData.value.keys = [
              props.originData.externalGatewayInfo.networkId,
            ];
            selectedData.value.rows = [
              ...data.value.filter((network) => {
                return network.id === networkId.value;
              }),
            ];
          }
        }
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const getStatusColor = (status: string) => {
  if (status?.toUpperCase() === 'ACTIVE') {
    return 'geekblue';
  } else if (status?.toUpperCase() === 'ERROR') {
    return 'volcano';
  }
  return 'lightgray';
};

let updateForm: any = useForm();
const validationSchema = {
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  // networkId: { conSelectRequired: t('common.column.network') },
};

const routerUpdateFormData = ref<RouterUpdateType>({} as RouterUpdateType);

const handleFormModalSubmit = () => {
  updateForm.setValues({
    networkId: networkId.value,
  });
  updateForm.validate().then((res: any) => {
    if (res.valid) {
      handleFormModalOk();
    } else {
      return;
    }
  });
};

const selectedData = ref<{ rows: NetworkType[]; keys: string[] }>({
  rows: [],
  keys: [],
});
const rowSelection = computed(() => {
  return {
    onChange: (selectedRowKeys: string[], selectedRows: NetworkType[]) => {
      networkId.value = selectedRowKeys[0];
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
    },
    type: 'radio',
    selectedRowKeys: selectedData.value.keys,
  };
});

const deselectItem = (network: NetworkType) => {
  selectedData.value.rows = selectedData.value.rows.filter((net) => {
    return net.id !== network.id;
  });
  selectedData.value.keys = selectedData.value.keys.filter((netId) => {
    return netId !== network.id;
  });
  networkId.value = undefined;
};

const emit = defineEmits({});

const handleFormModalOk = () => {
  routerUpdateFormData.value.router = Object.assign({}, props.originData);
  routerUpdateFormData.value.router.externalGatewayInfo =
    {} as ExternalGateWayInfoType;
  if (networkId.value) {
    routerUpdateFormData.value.router.externalGatewayInfo.networkId =
      networkId.value;
  } else {
    routerUpdateFormData.value.router.externalGatewayInfo = undefined;
  }
  emit('update:modelValue', false);
  // 이부분에 prop에 넘겨준 이벤트 이름으로 설정
  emit('updateMethod', undefined, routerUpdateFormData.value);
};

const handleFormModalCancel = () => {
  emit('update:modelValue', false);
};

onMounted(() => {
  getResourceList(1, Number.MAX_SAFE_INTEGER);
});
</script>
<style lang="scss" scoped></style>
