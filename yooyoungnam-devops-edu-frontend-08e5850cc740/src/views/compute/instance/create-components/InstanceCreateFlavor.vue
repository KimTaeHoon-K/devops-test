<template>
  <a-form class="form" name="basic" layout="vertical">
    <div class="head-title-wrapper">
      <h3 class="heading-sub-title">
        {{ t('message.create.step-info.instance.flavor.title') }}
      </h3>
      <p class="description">
        {{ t('message.create.step-info.instance.flavor.description') }}
      </p>
    </div>
    <a-row>
      <div class="ant-form-item-label">
        <label for="basic_project" class="ant-form-item-required">{{
          t('common.column.flavor')
        }}</label>
      </div>
    </a-row>
    <div class="head-title-wrapper normal-word">
      <p class="text" v-if="!emitsFlavorInfo.flavorId">
        {{ '선택 인스턴스 유형' }}
      </p>
      <p class="text" v-else>
        <a-tag>{{ emitsFlavorInfo.flavorName }}</a-tag>
      </p>
    </div>
    <a-space class="space-block" direction="vertical" :size="SizeConst.eight">
      <a-radio-group
        class="radio-group-button"
        v-model:value="InstanceChoiceValue"
        name="InstanceChoice"
      >
        <a-radio-button value="1">{{
          t('common.column.all-flavor')
        }}</a-radio-button>
        <a-radio-button value="2" disabled>X86 Architecture</a-radio-button>
        <a-radio-button value="3" disabled
          >Heterogeneous Computing</a-radio-button
        >
        <a-radio-button value="4" disabled>Custom</a-radio-button>
      </a-radio-group>
      <Field
        name="flavor"
        v-slot="{ errorMessage }"
        v-model:value="selectedFlavor"
      >
        <a-form-item
          :rules="[{ required: true }]"
          :help="errorMessage"
          :validate-status="errorMessage ? 'error' : undefined"
        >
          <a-table
            v-model:value="selectedFlavor"
            :row-selection="rowSelection"
            :columns="columns"
            :data-source="data"
            :loading="isLoading"
            :row-key="'id'"
            :pagination="false"
            :scroll="{ y: 300 }"
            bordered
          >
            <!--      <template #title>-->
            <!--        <div class="table-title-wrapper">-->
            <!--          <div class="table-title-left">-->
            <!--            <exclamation-circle-outlined />-->
            <!--            <span class="text"-->
            <!--            >표시 열 및 필터 설정을 초기화할 수 있습니다.</span-->
            <!--            >-->
            <!--          </div>-->
            <!--          <div class="table-title-right">-->
            <!--            <a-tooltip title="새로고침">-->
            <!--              <reload-outlined />-->
            <!--            </a-tooltip>-->
            <!--          </div>-->
            <!--        </div>-->
            <!--      </template>-->
            <template #headerCell="{ column }">
              <template v-if="column.dataIndex === 'name'">{{
                t(column.title, { data: t('common.content.flavor') })
              }}</template>
              <template v-else>
                {{ t(column.title) }}
              </template>
            </template>
            <template #bodyCell="{ column, text }">
              <template v-if="column.dataIndex === 'imgName'">
                <a>{{ nullConverter(text) }}</a>
              </template>
              <template v-if="column.dataIndex === 'ram'">
                {{ mibToGibConverter(text) }}
              </template>
              <template v-if="column.dataIndex === 'rootDisk'">
                {{ gibConverter(text) }}
              </template>
            </template>
          </a-table>
        </a-form-item>
      </Field>
      <Field
        name="flavorSize"
        v-slot="{ errorMessage }"
        v-model:value="emitsFlavorInfo.flavorRootDisk"
      >
        <a-form-item
          :help="errorMessage"
          :validate-status="errorMessage ? 'error' : undefined"
        />
      </Field>
    </a-space>
  </a-form>
</template>

<script lang="ts" setup>
import type { TableColumnType } from 'ant-design-vue';
import {
  computed,
  defineEmits,
  defineProps,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { Field } from 'vee-validate';
import {
  gibConverter,
  mibToGibConverter,
  nullConverter,
} from '@/utils/Converter';
import { getFlavorList } from '@/axios/compute-service/FlavorApi';
import { FlavorType } from '@/types/compute/flavor/FlavorListType';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { SizeConst } from '@/types/common/constant/SizeConst';

const InstanceChoiceValue = ref<string>('1');

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const isLoading = ref<boolean>(true);

const flavorId = ref<string[]>([]);

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  flavorInfo: Object,
  instanceSourceSize: {
    type: Number,
    required: true,
  },
  isCheckValid: {
    type: Boolean,
    default: false,
  },
});

const initData = () => {
  if (props.isCheckValid) {
    emitsFlavorInfo.value = {
      flavorId: props.flavorInfo?.flavorId,
      flavorName: props.flavorInfo?.flavorName,
      flavorRootDisk: props.flavorInfo?.flavorRootDisk,
      flavorVCPU: props.flavorInfo?.flavorVCPU,
    };
  }
};

const emits = defineEmits(['update:flavorInfo', 'update:isCheckValid']);
const emitsFlavorInfo = ref({
  flavorId: '',
  flavorName: '',
  flavorRootDisk: 0,
  flavorVCPU: 0,
});

const selectedFlavor = ref(props.flavorInfo?.flavorId);

const columns: TableColumnType<FlavorType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'vCPU',
    dataIndex: 'vcpu',
    // sorter: true,
  },
  {
    title: 'common.column.memory',
    dataIndex: 'ram',
    // sorter: true,
  },
  {
    title: 'common.column.root-disk',
    dataIndex: 'rootDisk',
    // sorter: true,
  },
];

const data = ref<FlavorType[]>();

// 자원 목록 조회 : 인스턴스 유형 목록 조회
const getResourceList = () => {
  getFlavorList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        let findPropsFlavor = data.value.find(
          (obj) => obj.id === props.flavorInfo?.flavorId
        );
        if (findPropsFlavor) {
          flavorId.value[0] = findPropsFlavor.id;
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

const rowSelection = computed(() => {
  return {
    type: 'radio',
    onChange: (selectedRowKeys: string[], selectedRows: FlavorType[]) => {
      flavorId.value = selectedRowKeys;
      emitsFlavorInfo.value.flavorId = selectedRowKeys[0];
      emitsFlavorInfo.value.flavorName = selectedRows[0].name;
      emitsFlavorInfo.value.flavorRootDisk = selectedRows[0].rootDisk;
      emitsFlavorInfo.value.flavorVCPU = selectedRows[0].vcpu;
      validateField('flavor', flavorId.value);
      validateField('flavorSize', emitsFlavorInfo.value.flavorRootDisk);
    },
    selectedRowKeys: flavorId.value,
  };
});

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

onMounted(() => {
  initData();
  getResourceList();
});

onUnmounted(() => {
  emits('update:flavorInfo', emitsFlavorInfo.value);
  emits('update:isCheckValid', true);
});
</script>

<style lang="scss" scoped></style>
