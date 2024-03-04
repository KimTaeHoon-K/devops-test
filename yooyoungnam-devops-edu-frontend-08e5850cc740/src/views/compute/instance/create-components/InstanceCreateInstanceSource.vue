<template>
  <a-form class="form" name="basic" layout="vertical">
    <div class="head-title-wrapper">
      <h3 class="heading-sub-title">
        {{ t('message.create.step-info.instance.instance-source.title') }}
      </h3>
      <p class="description">
        {{ t('message.create.step-info.instance.instance-source.description') }}
      </p>
    </div>
    <a-row>
      <div class="ant-form-item-label">
        <label for="basic_project" class="ant-form-item-required">
          {{ t('message.create.step-info.instance.instance-source.title') }}
        </label>
      </div>
    </a-row>
    <div class="head-title-wrapper normal-word">
      <p class="text" v-if="!emitsImageInfo.imageId">
        {{ '선택 인스턴스 소스' }}
      </p>
      <p class="text" v-else>
        <a-tag>{{ emitsImageInfo.imageName }}</a-tag>
      </p>
    </div>
    <a-space class="space-block" direction="vertical" :size="SizeConst.eight">
      <a-radio-group
        class="radio-group-button"
        v-model:value="BootingChoiceValue"
        name="organizationChoice"
      >
        <a-radio-button value="1">
          {{ t('common.content.image') }}
        </a-radio-button>
        <a-radio-button value="2" disabled>{{
          t('common.content.instance-snapshot')
        }}</a-radio-button>
        <a-radio-button value="3" disabled>
          {{ t('common.content.bootable-volume') }}
        </a-radio-button>
      </a-radio-group>
      <Field
        name="image"
        v-slot="{ errorMessage }"
        v-model:value="selectedImage"
      >
        <a-form-item
          :rules="[{ required: true }]"
          :help="errorMessage"
          :validate-status="errorMessage ? 'error' : undefined"
        >
          <a-table
            v-model:value="selectedImage"
            :row-selection="rowSelection"
            :columns="columns"
            :data-source="data"
            :row-key="'id'"
            :loading="isLoading"
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
                t(column.title, { data: t('common.content.image') })
              }}</template>
              <template v-else>
                {{ t(column.title) }}
              </template>
            </template>
            <template #bodyCell="{ column, text }">
              <template v-if="column.dataIndex === 'name'">
                {{ noNamePrint(text) }}
              </template>
              <template v-if="column.dataIndex === 'size'">
                {{ bytesToGibConverter(text) }}
              </template>
              <template v-if="column.dataIndex === 'isProtected'">
                <span v-if="text">
                  <lock-outlined :style="{ color: '#DE350B' }" />
                </span>
                <span v-else-if="!text">
                  <unlock-outlined :style="{ color: '#1890ff' }" />
                </span>
              </template>
              <template v-if="column.dataIndex === 'status'">
                <span>
                  <a-tag
                    :key="text"
                    :color="text === 'active' ? 'geekblue' : 'lightgray'"
                  >
                    {{ text.toUpperCase() }}
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
          <label class="ant-form-item-required">볼륨 (GiB)</label>
        </div>
        <Field
          name="volume"
          v-model="emitsImageInfo.volumeSize"
          v-slot="{ handleChange, errorMessage }"
        >
          <a-form-item
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-space :size="SizeConst.eight">
              <a-input-number
                v-model:value="emitsImageInfo.volumeSize"
                @input="handleChange"
                :min="0"
                :default-value="0"
                :placeholder="
                  t('message.placeholder.input-2', {
                    data: '볼륨',
                  })
                "
              />
              <a-checkbox
                v-model:checked="emitsImageInfo.volumeDeleteOnTermination"
              >
                인스턴스와 일괄 삭제</a-checkbox
              >
            </a-space>
          </a-form-item>
        </Field>
      </a-space>
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
import { Field } from 'vee-validate';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons-vue';
import { bytesToGibConverter, dateConverter } from '@/utils/Converter';
import { getImageList } from '@/axios/compute-service/ImageApi';
import { ImageType } from '@/types/compute/image/ImageListType';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { SizeConst } from '@/types/common/constant/SizeConst';

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const isLoading = ref<boolean>(true);

const imageId = ref<string[]>([]);

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  imageInfo: Object,
  isCheckValid: {
    type: Boolean,
    default: false,
  },
});

const selectedImage = ref(props.imageInfo?.imageId);

const initData = () => {
  if (props.isCheckValid) {
    emitsImageInfo.value = {
      imageId: props.imageInfo?.imageId,
      imageName: props.imageInfo?.imageName,
      imageSize: props.imageInfo?.imageSize,
      imageVisibility: props.imageInfo?.imageVisibility,
      volumeSize: props.imageInfo?.volumeSize,
      volumeDeleteOnTermination: props.imageInfo?.volumeDeleteOnTermination,
    };
  }
};

const emits = defineEmits(['update:imageInfo', 'update:isCheckValid']);
const emitsImageInfo = ref({
  imageId: '',
  imageName: '',
  imageSize: 0,
  imageVisibility: '',
  volumeSize: 0,
  volumeDeleteOnTermination: false,
});

const BootingChoiceValue = ref<string>('1');

const columns: TableColumnType<ImageType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
  },
  {
    title: 'common.column.visibility',
    dataIndex: 'visibility',
  },
  {
    title: 'common.column.disk-format',
    dataIndex: 'diskFormat',
  },
  {
    title: 'common.column.is-protected',
    dataIndex: 'isProtected',
  },
  {
    title: 'common.column.size',
    dataIndex: 'size',
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
const data = ref<ImageType[]>();

const noNamePrint = (data: string) => {
  if (!data || data === '') {
    return '(No name)';
  } else {
    return data;
  }
};

const rowSelection = computed(() => {
  return {
    type: 'radio',
    onChange: (selectedRowKeys: string[], selectedRows: ImageType[]) => {
      imageId.value = selectedRowKeys;
      emitsImageInfo.value.imageId = selectedRowKeys[0];
      emitsImageInfo.value.imageName = selectedRows[0].name;
      emitsImageInfo.value.imageSize = selectedRows[0].size;
      emitsImageInfo.value.imageVisibility = selectedRows[0].visibility;
      validateField('image', imageId.value);
    },
    selectedRowKeys: imageId.value,
  };
});

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

// 자원 목록 조회 : 이미지 목록 조회
const getResourceList = () => {
  getImageList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        let findPropsImage = data.value.find(
          (obj) => obj.id === props.imageInfo?.imageId
        );
        if (findPropsImage) {
          imageId.value[0] = findPropsImage.id;
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

onMounted(() => {
  initData();
  getResourceList();
});

onUnmounted(() => {
  emits('update:imageInfo', emitsImageInfo.value);
  emits('update:isCheckValid', true);
});
</script>

<style lang="scss" scoped></style>
