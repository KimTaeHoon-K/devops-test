<template>
  <div class="head-title-wrapper">
    <h3 class="heading-sub-title">
      {{ t('message.create.step-info.instance.storage.title') }}
    </h3>
    <p class="description">
      {{ t('message.create.step-info.instance.storage.description') }}
    </p>
  </div>
  <a-row>
    <a-space
      class="space-block"
      direction="vertical"
      :size="SizeConst.twentyFour"
    >
      <a-space class="space-block" direction="vertical" :size="SizeConst.eight">
        <div class="ant-form-item-label">
          <label for="basic_project" class="ant-form-item-required"
            >시스템 디스크</label
          >
          <a-space :size="SizeConst.eight">
            <a-button size="small" @click="addSystemDiskItem">추가</a-button>
            <a-button size="small" @click="removeAllSystemDiskItem"
              >전체삭제</a-button
            >
          </a-space>
        </div>
        <a-space
          :size="SizeConst.eight"
          v-for="(systemDisk, idx) in systemDiskItem"
          v-bind:key="idx"
        >
          <a-button
            @click="removeSystemDiskItem(systemDisk)"
            :disabled="systemDiskItem.length === 1"
          >
            <template #icon><minus-outlined /></template>
          </a-button>
          <a-select
            ref="select"
            v-model:value="systemDisk.volumeType"
            style="width: 190px"
            @focus="focus"
            @change="handleChange"
            :placeholder="
              t('message.placeholder.select-2', {
                data: t('common.content.volume-type'),
              })
            "
          >
            <a-select-option v-for="obj in volumes" :key="obj.id">{{
              obj.name ? obj.name : '(No name)'
            }}</a-select-option>
          </a-select>
          <a-input-number v-model:value="systemDisk.size" />
          GiB
          <a-checkbox v-model:checked="systemDisk.isCascade">
            인스턴스와 일괄 삭제</a-checkbox
          >
        </a-space>
      </a-space>
      <a-space class="space-block" direction="vertical" :size="SizeConst.eight">
        <div class="ant-form-item-label">
          <label for="basic_project">데이터 디스크</label>
          <a-space :size="SizeConst.eight">
            <a-button size="small" @click="addDataDiskItem">추가</a-button>
            <a-button size="small" @click="removeAllDataDiskItem"
              >전체삭제</a-button
            >
          </a-space>
        </div>
        <a-space
          :size="SizeConst.eight"
          v-for="(dataDisk, idx) in dataDiskItem"
          v-bind:key="idx"
        >
          <a-button
            @click="removeDataDiskItem(dataDisk)"
            :disabled="dataDiskItem.length === 1"
          >
            <template #icon><minus-outlined /></template>
          </a-button>
          <a-select
            ref="select"
            v-model:value="dataDisk.volumeType"
            style="width: 190px"
            @focus="focus"
            @change="handleChange"
            :placeholder="
              t('message.placeholder.select-2', {
                data: t('common.content.volume-type'),
              })
            "
          >
            <a-select-option v-for="obj in volumes" :key="obj.id">{{
              obj.name ? obj.name : '(No name)'
            }}</a-select-option>
          </a-select>
          <a-input-number v-model:value="dataDisk.size" />
          GiB
        </a-space>
      </a-space>
    </a-space>
  </a-row>
</template>

<script lang="ts" setup>
import { MinusOutlined } from '@ant-design/icons-vue';
import { defineEmits, defineProps, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getVolumeList } from '@/axios/storage-service/VolumeApi';
import { VolumeType } from '@/types/storage/volume/VolumeListType';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { SizeConst } from '@/types/common/constant/SizeConst';

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  storageInfo: Object,
  projectId: {
    type: String,
    required: true,
  },
  isCheckValid: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const initData = () => {
  if (props.isCheckValid) {
    emitsStorageInfo.value = {
      networkId: props.storageInfo?.networkId,
      networkName: props.storageInfo?.networkName,
      subnetCount: props.storageInfo?.subnetCount,
      routerExternal: props.storageInfo?.routerExternal,
    };
  }
};

const emitsStorageInfo = ref({
  networkId: '',
  networkName: '',
  subnetCount: 0,
  routerExternal: false,
});

const volumes = ref<VolumeType[]>();

const mainData = ref<VolumeType>();

const isLoading = ref<boolean>(true);

const formatValue = (diskValue: string) => {
  if (diskValue === '') {
    return '';
  }
  return diskValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const parseValue = (diskValue: string) => {
  if (diskValue === '') {
    return null;
  }
  return parseFloat(diskValue.replace(/,/g, ''));
};

interface SystemDiskItemType {
  volumeType?: string;
  size: number;
  isCascade: boolean;
}
const systemDiskItem = ref<SystemDiskItemType[]>([
  {
    volumeType: undefined,
    size: 0,
    isCascade: false,
  },
]);
const addSystemDiskItem = () => {
  systemDiskItem.value.push({
    volumeType: undefined,
    size: 0,
    isCascade: false,
  });
};
const removeAllSystemDiskItem = () => {
  systemDiskItem.value = [];
};
const removeSystemDiskItem = (item: SystemDiskItemType) => {
  let index = systemDiskItem.value.indexOf(item);
  if (index !== -1) {
    systemDiskItem.value.splice(index, 1);
  }
};

interface DataDiskItemType {
  volumeType?: string;
  size: number;
}
const dataDiskItem = ref<DataDiskItemType[]>([
  {
    volumeType: undefined,
    size: 0,
  },
]);
const addDataDiskItem = () => {
  dataDiskItem.value.push({
    volumeType: undefined,
    size: 0,
  });
};
const removeAllDataDiskItem = () => {
  dataDiskItem.value = [];
};
const removeDataDiskItem = (item: DataDiskItemType) => {
  let index = dataDiskItem.value.indexOf(item);
  if (index !== -1) {
    dataDiskItem.value.splice(index, 1);
  }
};

const handleChange = (value: string) => {
  console.log(`selected ${value}`);
  // console.log(volumeData.value.option.size);
  console.log(mainData.value);
};

// 자원 목록 조회 : 볼륨 목록 조회
const getResourceList = () => {
  let projectId = props.projectId;
  getVolumeList(1, Number.MAX_SAFE_INTEGER, projectId)
    .then((res) => {
      if (res.status === 200) {
        volumes.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const emits = defineEmits(['update:storageInfo', 'update:isCheckValid']);

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

onMounted(() => {
  initData();
  getResourceList();
});

onUnmounted(() => {
  emits('update:storageInfo', emitsStorageInfo.value);
  emits('update:isCheckValid', true);
});
</script>

<style lang="scss" scoped></style>
