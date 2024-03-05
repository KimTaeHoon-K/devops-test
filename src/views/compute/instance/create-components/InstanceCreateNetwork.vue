<template>
  <div class="head-title-wrapper">
    <h3 class="heading-sub-title">
      {{ t('message.create.step-info.instance.network.title') }}
    </h3>
    <p class="description">
      {{ t('message.create.step-info.instance.network.description') }}
    </p>
  </div>
  <a-row>
    <div class="ant-form-item-label">
      <label for="basic_project" class="ant-form-item-required">
        {{ t('message.create.step-info.instance.network.title') }}
      </label>
    </div>
  </a-row>
  <div class="head-title-wrapper normal-word">
    <p class="text" v-if="!emitsNetworkInfo.networkId">
      {{ '선택 네트워크' }}
    </p>
    <p class="text" v-else>
      <a-tag>{{ emitsNetworkInfo.networkName }}</a-tag>
    </p>
  </div>
  <a-space class="space-block" direction="vertical" :size="SizeConst.eight">
    <a-radio-group
      class="radio-group-button"
      v-model:value="networkType"
      name="NetworkChoice"
    >
      <a-radio-button value="allNetwork">
        {{ t('common.content.all-network') }}
      </a-radio-button>
      <a-radio-button value="sharedNetwork">{{
        t('common.content.project-network')
      }}</a-radio-button>
      <a-radio-button value="externalNetwork">{{
        t('common.content.external-network')
      }}</a-radio-button>
    </a-radio-group>
    <Field
      name="network"
      v-slot="{ errorMessage }"
      v-model:value="selectedNetwork"
    >
      <a-form-item
        :rules="[{ required: true }]"
        :help="errorMessage"
        :validate-status="errorMessage ? 'error' : undefined"
      >
        <a-table
          v-model:value="selectedNetwork"
          :row-selection="rowSelection"
          :columns="columns"
          :data-source="data"
          :loading="isLoading"
          :pagination="false"
          :row-key="'id'"
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
            <template v-if="column.dataIndex === 'imgName'">
              <a>{{ text }}</a>
            </template>
            <template v-if="column.dataIndex === 'routerExternal'">
              <span>{{ text ? 'Yes' : 'No' }} </span>
            </template>
            <template v-if="column.dataIndex === 'shared'">
              <span>{{ text ? 'Yes' : 'No' }} </span>
            </template>
            <template v-if="column.dataIndex === 'subnets'">
              <span>{{ text?.length }} </span>
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
          </template>
        </a-table>
      </a-form-item>
    </Field>
  </a-space>

  <!--  <a-space class="space-block" direction="vertical" :size="SizeConst.twentyFour">-->
  <!--    <a-space class="space-block" direction="vertical" :size="SizeConst.eight">-->
  <!--      <div class="ant-form-item-label">-->
  <!--        <label for="basic_project" class="ant-form-item-required">{{-->
  <!--          t('common.column.subnet')-->
  <!--        }}</label>-->
  <!--        <a-space :size="4">-->
  <!--          <a-button size="small" @click="addSubnetItem">추가</a-button>-->
  <!--          <a-button size="small" @click="removeAllSubnetItem"-->
  <!--            >전체 삭제</a-button-->
  <!--          >-->
  <!--        </a-space>-->
  <!--      </div>-->
  <!--      <a-space-->
  <!--        :size="SizeConst.eight"-->
  <!--        v-for="(subnetItem, idx) in subnetItems"-->
  <!--        v-bind:key="idx"-->
  <!--      >-->
  <!--        <a-form-item>-->
  <!--          <a-button-->
  <!--            @click="removeSubnetItem(subnetItem)"-->
  <!--            :disabled="subnetItems.length === 1"-->
  <!--          >-->
  <!--            <template #icon><minus-outlined /></template>-->
  <!--          </a-button>-->
  <!--        </a-form-item>-->
  <!--        <Field-->
  <!--          name="subnetId"-->
  <!--          v-model="subnetItem.subnetId"-->
  <!--          v-slot="{ handleChange, errorMessage }"-->
  <!--        >-->
  <!--          <a-form-item-->
  <!--            :help="errorMessage"-->
  <!--            :has-feedback="!!errorMessage"-->
  <!--            :validate-status="errorMessage ? 'error' : undefined"-->
  <!--          >-->
  <!--            <a-select-->
  <!--              v-model:value="subnetItem.subnetId"-->
  <!--              style="width: 200px"-->
  <!--              :placeholder="-->
  <!--                t('message.placeholder.select-1', {-->
  <!--                  data: t('common.content.subnet'),-->
  <!--                })-->
  <!--              "-->
  <!--              @update:value="handleChange"-->
  <!--              @change="handleSubnetChange"-->
  <!--              :loading="isSubnetLoading"-->
  <!--              :not-found-content="-->
  <!--                emitsNetworkInfo.networkId-->
  <!--                  ? undefined-->
  <!--                  : t('message.table.select-previous-data-first', {-->
  <!--                      prevData: t('common.content.network'),-->
  <!--                      data: t('common.content.subnet'),-->
  <!--                    })-->
  <!--              "-->
  <!--            >-->
  <!--              <a-select-option-->
  <!--                v-for="subnet in subnetOptions"-->
  <!--                v-bind:key="subnet"-->
  <!--                :value="subnet.id"-->
  <!--              >-->
  <!--                {{ subnet.name }}-->
  <!--              </a-select-option>-->
  <!--            </a-select>-->
  <!--          </a-form-item>-->
  <!--        </Field>-->
  <!--        <a-form-item>-->
  <!--          <a-select-->
  <!--            v-model:value="allocationType"-->
  <!--            style="width: 190px"-->
  <!--            :options="allocationTypeOptions"-->
  <!--          />-->
  <!--        </a-form-item>-->
  <!--        <a-form-item v-if="allocationType === 'auto' && selectedSubnet">-->
  <!--          할당 풀:-->
  <!--          <span-->
  <!--            v-for="(pool, idx) in selectedSubnet.allocationPools"-->
  <!--            v-bind:key="idx"-->
  <!--          >-->
  <!--            {{ `${pool.start} ~ ${pool.end}` }}-->
  <!--            {{ idx < selectedSubnet.allocationPools.length - 1 ? ', ' : '' }}-->
  <!--          </span>-->
  <!--        </a-form-item>-->
  <!--        <Field-->
  <!--          v-if="allocationType === 'manual' && selectedSubnet"-->
  <!--          :name="selectedSubnet.ipVersion === 4 ? 'ipv4Address' : 'ipv6Address'"-->
  <!--          v-model="ipAddress"-->
  <!--          v-slot="{ handleChange, errorMessage }"-->
  <!--        >-->
  <!--          <a-form-item-->
  <!--            :help="errorMessage"-->
  <!--            :has-feedback="!!errorMessage"-->
  <!--            :validate-status="errorMessage ? 'error' : undefined"-->
  <!--          >-->
  <!--            <a-input-->
  <!--              v-model:value="subnetItem.ipAddress"-->
  <!--              :placeholder="-->
  <!--                t('message.placeholder.input-1', {-->
  <!--                  data: t('common.column.ip-address'),-->
  <!--                })-->
  <!--              "-->
  <!--              @update:value="handleChange"-->
  <!--              style="width: 190px"-->
  <!--            />-->
  <!--          </a-form-item>-->
  <!--        </Field>-->
  <!--      </a-space>-->
  <!--    </a-space>-->
  <!--  </a-space>-->
</template>

<script lang="ts" setup>
import type { SelectProps, TableColumnType } from 'ant-design-vue';
import { MinusOutlined } from '@ant-design/icons-vue';
import {
  computed,
  defineEmits,
  defineProps,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { Field } from 'vee-validate';
import { getNetworkList } from '@/axios/network-service/NetworkApi';
import { dateConverter } from '@/utils/Converter';
import {
  NetworkListType,
  NetworkType,
} from '@/types/network/network/NetworkListType';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { SubnetType } from '@/types/network/network/subnet/SubnetListType';
import { getSubnetList } from '@/axios/network-service/SubnetApi';
import { SizeConst } from '@/types/common/constant/SizeConst';

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  networkInfo: Object,
  projectId: {
    type: String,
    required: true,
  },
  isCheckValid: {
    type: Boolean,
    default: false,
  },
});

const networkType = ref<string>('allNetwork');

watch(networkType, (networkType) => {
  if (networkType === 'sharedNetwork') {
    refresh(false);
  } else if (networkType === 'externalNetwork') {
    refresh(true);
  } else {
    refresh();
  }
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const initData = () => {
  if (props.isCheckValid) {
    emitsNetworkInfo.value = {
      networkId: props.networkInfo?.networkId,
      networkName: props.networkInfo?.networkName,
      subnetCount: props.networkInfo?.subnetCount,
      routerExternal: props.networkInfo?.routerExternal,
    };
  }
};

const emits = defineEmits(['update:networkInfo', 'update:isCheckValid']);

const emitsNetworkInfo = ref({
  networkId: '',
  networkName: '',
  subnetCount: 0,
  routerExternal: false,
});

const allocationType = ref<string>('auto');
const allocationTypeOptions = ref<SelectProps['options']>([
  {
    value: 'auto',
    label: '자동 할당',
  },
  {
    value: 'manual',
    label: '수동 할당',
  },
]);

const isLoading = ref<boolean>(true);
const columns: TableColumnType<NetworkListType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.router-external',
    dataIndex: 'routerExternal',
  },
  {
    title: 'common.column.shared',
    dataIndex: 'shared',
  },
  {
    title: 'common.column.subnet-count',
    dataIndex: 'subnets',
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
];

// 새로고침
const refresh = (routerExternal?: boolean) => {
  data.value = [];
  isLoading.value = true;
  getResourceList(routerExternal);
};

// 자원 목록 조회 : 네트워크 목록 조회
const data = ref<NetworkType[]>();
const getResourceList = (routerExternal?: boolean) => {
  getNetworkList(1, Number.MAX_SAFE_INTEGER, props.projectId, routerExternal)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        let findPropsNetwork = data.value.find(
          (obj) => obj.id === props.networkInfo?.networkId
        );
        if (findPropsNetwork) {
          networkId.value[0] = findPropsNetwork.id;
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

const handleChangeNetwork = () => {
  if (emitsNetworkInfo.value.networkId) {
    initSubnet();
    isSubnetLoading.value = true;
    getSubnetResourceList(emitsNetworkInfo.value.networkId);
  }
};

const networkId = ref<string[]>([]);
const selectedNetwork = ref<string>(props.networkInfo?.networkId);
const rowSelection = computed(() => {
  return {
    type: 'radio',
    onChange: (selectedRowKeys: string[], selectedRows: NetworkType[]) => {
      networkId.value = selectedRowKeys;
      emitsNetworkInfo.value.networkId = selectedRowKeys[0];
      emitsNetworkInfo.value.networkName = selectedRows[0].name;
      emitsNetworkInfo.value.subnetCount = selectedRows[0].subnets.length;
      emitsNetworkInfo.value.routerExternal = selectedRows[0].routerExternal;
      validateField('network', networkId.value);
      // handleChangeNetwork();
    },
    selectedRowKeys: networkId.value,
  };
});

const initSubnet = () => {
  subnetOptions.value = [];
  selectedSubnet.value = undefined;
  emitsNetworkInfo.value.subnetId = undefined;
  emitsNetworkInfo.value.subnetName = '';
  allocationType.value = 'auto';
  ipAddress.value = undefined;
  subnetItems.value = [
    {
      subnetId: undefined,
      ipAddress: '',
    },
  ];
};

const selectedSubnet = ref<SubnetType>();
const ipAddress = ref<string>();
const subnetOptions = ref<SubnetType[]>();
const isSubnetLoading = ref<boolean>(false);
const getSubnetResourceList = (networkId: string) => {
  getSubnetList(1, Number.MAX_SAFE_INTEGER, networkId)
    .then((res) => {
      if (res.status === 200) {
        subnetOptions.value = res.data.data;
        // if (props.isCheckValid && props.networkInfo.subnetId) {
        //   subnetOptions.value.map((subnet) => {
        //     if (subnet.id === props.networkInfo.subnetId) {
        //       selectedSubnet.value = subnet;
        //       emitsNetworkInfo.value.subnetId =
        //         selectedSubnet.value.id;
        //       emitsNetworkInfo.value.subnetName =
        //         selectedSubnet.value.name;
        //     }
        //   });
        //   if (props.networkInfo.address) {
        //     allocationType.value = 'manual';
        //     ipAddress.value = props.networkInfo.address;
        //   }
        // } else if (subnetOptions.value.length > 0) {
        //   selectedSubnet.value = subnetOptions.value[0];
        //   emitsNetworkInfo.value.subnetId = selectedSubnet.value.id;
        //   emitsNetworkInfo.value.subnetName =
        //     selectedSubnet.value.name;
        // }
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isSubnetLoading.value = false;
    });
};
const handleSubnetChange = (e: any) => {
  subnetOptions.value?.map((subnet) => {
    if (subnet.id === e) {
      selectedSubnet.value = subnet;
    }
  });
};

interface SubnetItemType {
  subnetId?: string;
  ipAddress?: string;
}
const subnetItems = ref<SubnetItemType[]>([]);
const addSubnetItem = () => {
  subnetItems.value.push({
    subnetId: undefined,
    ipAddress: '',
  });
};
const removeAllSubnetItem = () => {
  subnetItems.value = [];
};
const removeSubnetItem = (item: SubnetItemType) => {
  let index = subnetItems.value.indexOf(item);
  if (index !== -1) {
    subnetItems.value.splice(index, 1);
  }
};

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

onMounted(() => {
  initData();
  getResourceList();
});

onUnmounted(() => {
  emits('update:networkInfo', emitsNetworkInfo.value);
  emits('update:isCheckValid', true);
});
</script>

<style lang="scss" scoped></style>
