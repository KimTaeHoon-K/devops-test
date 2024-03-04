<template>
  <a-form class="form" name="basic" layout="vertical">
    <div class="head-title-wrapper">
      <h3 class="heading-sub-title">
        {{ t('message.create.step-info.load-balancer.load-balancer.title') }}
      </h3>
      <p class="description">
        {{
          t('message.create.step-info.load-balancer.load-balancer.description')
        }}
      </p>
    </div>
    <a-row class="form-row" :gutter="12">
      <a-col :span="12">
        <Field
          name="name"
          v-model="emitsLoadBalancerInfoInfo.name"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="t('common.column.name')"
            :rules="[{ required: true }]"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input
              :value="emitsLoadBalancerInfoInfo.name"
              @update:value="handleChange"
              @blur="handleChange"
              :placeholder="
                t('message.placeholder.input-1', {
                  data: t('common.column.name'),
                })
              "
            />
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="12">
        <Field
          name="description"
          v-model="emitsLoadBalancerInfoInfo.description"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :label="t('common.column.description')"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input
              v-model:value="emitsLoadBalancerInfoInfo.description"
              @update:value="handleChange"
              @blur="handleChange"
              :placeholder="
                t('message.placeholder.input-1', {
                  data: t('common.column.description'),
                })
              "
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="12">
        <Field
          name="project"
          v-model="emitsLoadBalancerInfoInfo.projectId"
          v-slot="{ errorMessage }"
        >
          <a-form-item
            :label="'할당 프로젝트'"
            :rules="[{ required: true }]"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
            style="width: 100%"
          >
            <a-select
              :value="emitsLoadBalancerInfoInfo.projectId"
              style="width: 100%"
              :placeholder="
                t('message.placeholder.select-2', {
                  data: t('common.content.project'),
                })
              "
              @update:value="handleProjectChange"
              :loading="isProjectLoading"
              :disabled="projectOptionsDisabled"
            >
              <a-select-option
                v-for="project in projectOptions"
                v-bind:key="project"
                :value="project.id"
              >
                {{ project.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </Field>
      </a-col>
      <a-col :span="12">
        <Field
          name="adminStateUp"
          v-model="emitsLoadBalancerInfoInfo.adminStateUp"
        >
          <a-form-item :label="'Admin 관리 상태'">
            <a-switch
              v-model:checked="emitsLoadBalancerInfoInfo.adminStateUp"
            />
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row class="form-row">
      <div class="ant-form-item-label">
        <label for="basic_project">{{ t('common.column.network') }}</label>
      </div>
    </a-row>
    <div class="head-title-wrapper normal-word">
      <p class="text" v-if="!emitsLoadBalancerInfoInfo.projectId">
        {{ '프로젝트를 선택해 주세요.' }}
      </p>
      <p class="text" v-else-if="!emitsLoadBalancerInfoInfo.networkId">
        {{ '선택 네트워크' }}
      </p>
      <p class="text" v-else>
        <a-tag closable @close="deselectItem('network')">{{
          emitsLoadBalancerInfoInfo.networkName
        }}</a-tag>
      </p>
    </div>
    <a-space
      class="space-block"
      direction="vertical"
      :size="SizeConst.twentyFour"
    >
      <Field
        name="network"
        v-slot="{ errorMessage }"
        v-model:value="emitsLoadBalancerInfoInfo.networkId"
      >
        <a-form-item
          :help="errorMessage"
          :validate-status="errorMessage ? 'error' : undefined"
        >
          <a-table
            v-model:value="emitsLoadBalancerInfoInfo.networkId"
            :row-selection="rowSelection"
            :columns="columns"
            :data-source="networkOptions"
            :row-key="'id'"
            :loading="isNetworkLoading"
            :pagination="false"
            :scroll="{ y: 300 }"
            bordered
          >
            <template v-if="!emitsLoadBalancerInfoInfo.projectId" #emptyText>
              <div class="txt list-pre">
                {{
                  t('message.table.select-previous-data-first', {
                    prevData: t('common.content.project'),
                    data: t('common.content.network'),
                  })
                }}
              </div>
            </template>
            <template #headerCell="{ column }">
              <template v-if="column.dataIndex === 'name'">{{
                t(column.title, { data: t('common.content.network') })
              }}</template>
              <template v-else>
                {{ t(column.title) }}
              </template>
            </template>
            <template #bodyCell="{ column, text }">
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
                      text?.toUpperCase() === 'ACTIVE'
                        ? 'geekblue'
                        : 'lightgray'
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
    <a-space
      class="space-block"
      direction="vertical"
      :size="SizeConst.twentyFour"
    >
      <a-space class="space-block" direction="vertical" :size="SizeConst.eight">
        <div class="ant-form-item-label">
          <label for="basic_project">{{ t('common.content.subnet') }}</label>
        </div>
        <a-space :size="SizeConst.eight">
          <Field
            name="subnetId"
            v-model="emitsLoadBalancerInfoInfo.subnetId"
            v-slot="{ handleChange, errorMessage }"
          >
            <a-form-item
              :help="errorMessage"
              :has-feedback="!!errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
            >
              <a-select
                v-model:value="emitsLoadBalancerInfoInfo.subnetId"
                style="width: 200px"
                :placeholder="
                  t('message.placeholder.select-1', {
                    data: t('common.content.subnet'),
                  })
                "
                @update:value="handleChange"
                @change="handleSubnetChange"
                :loading="isSubnetLoading"
                :not-found-content="
                  emitsLoadBalancerInfoInfo.networkId
                    ? undefined
                    : t('message.table.select-previous-data-first', {
                        prevData: t('common.content.network'),
                        data: t('common.content.subnet'),
                      })
                "
              >
                <a-select-option
                  v-for="subnet in subnetOptions"
                  v-bind:key="subnet"
                  :value="subnet.id"
                >
                  {{ subnet.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </Field>
          <a-form-item>
            <a-select
              v-model:value="allocationType"
              style="width: 190px"
              :options="allocationTypeOptions"
            />
          </a-form-item>
          <a-form-item v-if="allocationType === 'auto' && selectedSubnet">
            할당 풀:
            <span
              v-for="(pool, idx) in selectedSubnet.allocationPools"
              v-bind:key="idx"
            >
              {{ `${pool.start} ~ ${pool.end}` }}
              {{ idx < selectedSubnet.allocationPools.length - 1 ? ', ' : '' }}
            </span>
          </a-form-item>
          <Field
            v-if="allocationType === 'manual' && selectedSubnet"
            :name="
              selectedSubnet.ipVersion === 4 ? 'ipv4Address' : 'ipv6Address'
            "
            v-model="ipAddress"
            v-slot="{ handleChange, errorMessage }"
          >
            <a-form-item
              :help="errorMessage"
              :has-feedback="!!errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
            >
              <a-input
                v-model:value="ipAddress"
                :placeholder="
                  t('message.placeholder.input-2', {
                    data: t('common.column.ip-address'),
                  })
                "
                @update:value="handleChange"
                style="width: 190px"
              />
            </a-form-item>
          </Field>
        </a-space>
      </a-space>
    </a-space>
  </a-form>
</template>

<script lang="ts" setup>
import {
  computed,
  defineEmits,
  defineProps,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import type { SelectProps, TableColumnType } from 'ant-design-vue';
import { Field } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { ProjectType } from '@/types/identity/project/ProjectListType';
import { getProjectList } from '@/axios/identity-service/ProjectApi';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { LoadBalancerInfoType } from '@/types/network/load-balancer/LoadBalancerCreateType';
import { NetworkType } from '@/types/network/network/NetworkListType';
import { getNetworkList } from '@/axios/network-service/NetworkApi';
import { dateConverter } from '@/utils/Converter';
import { getSubnetList } from '@/axios/network-service/SubnetApi';
import { SubnetType } from '@/types/network/network/subnet/SubnetListType';
import { SizeConst } from '@/types/common/constant/SizeConst';

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  loadBalancerInfo: {
    type: Object as () => LoadBalancerInfoType,
    required: true,
  },
  isCheckValid: {
    type: Boolean,
    default: false,
  },
});

const providerStore = ProviderStore();
const projectOptionsDisabled = ref<boolean>();
watch(providerStore, () => {
  refresh();
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

// 새로고침
const refresh = () => {
  projectOptions.value = [];
  isProjectLoading.value = true;
  networkOptions.value = [];
  getProjectResourceList();
  setProjectSelection();
};

const initData = () => {
  if (props.isCheckValid) {
    emitsLoadBalancerInfoInfo.value = {
      name: props.loadBalancerInfo?.name,
      description: props.loadBalancerInfo?.description,
      projectId: props.loadBalancerInfo?.projectId,
      projectName: props.loadBalancerInfo?.projectName,
      adminStateUp: props.loadBalancerInfo?.adminStateUp,
      networkId: props.loadBalancerInfo?.networkId,
      networkName: props.loadBalancerInfo?.networkName,
      subnetId: props.loadBalancerInfo?.subnetId,
      subnetName: props.loadBalancerInfo?.subnetName,
      address: props.loadBalancerInfo?.address,
    };
  }
};

const emits = defineEmits(['update:loadBalancerInfo', 'update:isCheckValid']);
const emitsLoadBalancerInfoInfo = ref<LoadBalancerInfoType>({
  name: '',
  description: '',
  projectId: undefined,
  projectName: '',
  adminStateUp: true,
  networkId: undefined,
  networkName: '',
  subnetId: undefined,
  subnetName: '',
  address: '',
});

// 프로젝트 목록 조회
const projectOptions = ref<ProjectType[]>([]);
const isProjectLoading = ref<boolean>(true);
const getProjectResourceList = () => {
  getProjectList(1, 1000)
    .then((res) => {
      if (res.status === 200) {
        projectOptions.value = res.data.data;

        // false: 전체 프로젝트 선택 상태
        projectOptionsDisabled.value =
          providerStore.isSelected &&
          !providerStore.getSelectedProjectId.includes('all');
        if (
          props.isCheckValid &&
          props.loadBalancerInfo.projectId &&
          !projectOptionsDisabled.value
        ) {
          projectOptions.value.map((project) => {
            if (project.id === props.loadBalancerInfo.projectId) {
              emitsLoadBalancerInfoInfo.value.projectId = project.id;
              emitsLoadBalancerInfoInfo.value.projectName = project.name;
            }
          });
          handleProjectChange(emitsLoadBalancerInfoInfo.value.projectId);
        } else if (projectOptionsDisabled.value) {
          emitsLoadBalancerInfoInfo.value.projectId =
            providerStore.getSelectedProjectId;
          emitsLoadBalancerInfoInfo.value.projectName =
            providerStore.getSelectedProjectName;
          handleProjectChange(emitsLoadBalancerInfoInfo.value.projectId);
        }
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isProjectLoading.value = false;
    });
};
const setProjectSelection = () => {
  projectOptionsDisabled.value =
    providerStore.isSelected &&
    !providerStore.getSelectedProjectId.includes('all');
  if (projectOptionsDisabled.value) {
    emitsLoadBalancerInfoInfo.value.projectId =
      providerStore.getSelectedProjectId;
    emitsLoadBalancerInfoInfo.value.projectName =
      providerStore.getSelectedProjectName;
  } else {
    emitsLoadBalancerInfoInfo.value.projectId = undefined;
    setValidateFieldError('owner', undefined);
  }
};

const handleProjectChange = (e: any) => {
  projectOptions.value.map((project) => {
    if (project.id === e) {
      emitsLoadBalancerInfoInfo.value.projectId = project.id;
      emitsLoadBalancerInfoInfo.value.projectName = project.name;
    }
  });
  // props.validateForm?.validateField('project').then();
  if (emitsLoadBalancerInfoInfo.value.projectId) {
    initSubnet();
    initNetwork();
    isNetworkLoading.value = true;
    getNetworkResourceList(emitsLoadBalancerInfoInfo.value.projectId);
  }
};

// 네트워크 목록 조회
const columns: TableColumnType<NetworkType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
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
  },
];

const networkOptions = ref<NetworkType[]>();
const isNetworkLoading = ref<boolean>(false);
const getNetworkResourceList = (projectId: string) => {
  getNetworkList(1, Number.MAX_SAFE_INTEGER, projectId)
    .then((res) => {
      if (res.status === 200) {
        networkOptions.value = res.data.data;
        if (props.isCheckValid && props.loadBalancerInfo.networkId) {
          networkOptions.value.map((network) => {
            if (network.id === props.loadBalancerInfo.networkId) {
              emitsLoadBalancerInfoInfo.value.networkId = network.id;
              emitsLoadBalancerInfoInfo.value.networkName = network.name;
            }
          });
          getSubnetResourceList(props.loadBalancerInfo.networkId);
        }
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isNetworkLoading.value = false;
    });
};

const handleChangeNetwork = () => {
  if (emitsLoadBalancerInfoInfo.value.networkId) {
    initSubnet();
    isSubnetLoading.value = true;
    getSubnetResourceList(emitsLoadBalancerInfoInfo.value.networkId);
  }
};

// 행 체크 로직
const rowSelection = computed(() => {
  return {
    type: 'radio',
    onChange: (selectedRowKeys: string[], selectedRows: NetworkType[]) => {
      emitsLoadBalancerInfoInfo.value.networkId = selectedRowKeys[0];
      emitsLoadBalancerInfoInfo.value.networkName = selectedRows[0].name;
      validateField('network', emitsLoadBalancerInfoInfo.value.networkId);
      handleChangeNetwork();
    },
    selectedRowKeys: [emitsLoadBalancerInfoInfo.value.networkId],
  };
});

const deselectItem = (resourceType: string) => {
  if (resourceType === 'network') {
    emitsLoadBalancerInfoInfo.value.networkId = undefined;
    emitsLoadBalancerInfoInfo.value.networkName = '';
    initSubnet();
  }
};

const initSubnet = () => {
  subnetOptions.value = [];
  selectedSubnet.value = undefined;
  emitsLoadBalancerInfoInfo.value.subnetId = undefined;
  emitsLoadBalancerInfoInfo.value.subnetName = '';
  allocationType.value = 'auto';
  ipAddress.value = undefined;
};

const initNetwork = () => {
  networkOptions.value = [];
  emitsLoadBalancerInfoInfo.value.networkId = undefined;
  emitsLoadBalancerInfoInfo.value.networkName = '';
};

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

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

const selectedSubnet = ref<SubnetType>();
const ipAddress = ref<string>();
const subnetOptions = ref<SubnetType[]>();
const isSubnetLoading = ref<boolean>(false);
const getSubnetResourceList = (networkId: string) => {
  getSubnetList(1, Number.MAX_SAFE_INTEGER, networkId)
    .then((res) => {
      if (res.status === 200) {
        subnetOptions.value = res.data.data;
        if (props.isCheckValid && props.loadBalancerInfo.subnetId) {
          subnetOptions.value.map((subnet) => {
            if (subnet.id === props.loadBalancerInfo.subnetId) {
              selectedSubnet.value = subnet;
              emitsLoadBalancerInfoInfo.value.subnetId =
                selectedSubnet.value.id;
              emitsLoadBalancerInfoInfo.value.subnetName =
                selectedSubnet.value.name;
            }
          });
          if (props.loadBalancerInfo.address) {
            allocationType.value = 'manual';
            ipAddress.value = props.loadBalancerInfo.address;
          }
        } else if (subnetOptions.value.length > 0) {
          selectedSubnet.value = subnetOptions.value[0];
          emitsLoadBalancerInfoInfo.value.subnetId = selectedSubnet.value.id;
          emitsLoadBalancerInfoInfo.value.subnetName =
            selectedSubnet.value.name;
        }
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

const setValidateFieldError = (field: string, error: string | undefined) => {
  props.validateForm.validateField(field).then((res: any) => {
    if (!res.valid) {
      props.validateForm.setFieldError(field, error);
    }
  });
};

onMounted(() => {
  initData();
  getProjectResourceList();
});

onUnmounted(() => {
  if (selectedSubnet.value) {
    emitsLoadBalancerInfoInfo.value.subnetId = selectedSubnet.value.id;
    emitsLoadBalancerInfoInfo.value.subnetName = selectedSubnet.value.name;
    emitsLoadBalancerInfoInfo.value.allocationPools =
      selectedSubnet.value.allocationPools;
    emitsLoadBalancerInfoInfo.value.address = ipAddress.value;
  }
  emits('update:loadBalancerInfo', emitsLoadBalancerInfoInfo.value);
  emits('update:isCheckValid', true);
});
</script>
<style lang="scss" scoped></style>
