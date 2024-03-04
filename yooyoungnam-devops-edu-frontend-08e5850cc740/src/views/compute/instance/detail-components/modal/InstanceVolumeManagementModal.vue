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
              {{ '볼륨 정보' }}
            </h3>
          </div>
          <a-row class="form-row" :gutter="12">
            <a-col :span="24">
              <a-form-item
                :label="
                  t('common.column.resource-name', {
                    data: t('common.content.instance'),
                  })
                "
              >
                <a-input :value="props.instanceName" disabled />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <div class="ant-form-item-label">
              <label for="volumeIds">{{ '선택 볼륨' }}</label>
            </div>
          </a-row>
          <div class="head-title-wrapper normal-word">
            <p class="text" v-if="selectedData.rows.length === 0">
              {{ '볼륨을 선택해 주세요.' }}
            </p>
            <p class="text" v-else>
              <a-tag
                v-for="vol in selectedData.rows"
                v-bind:key="vol.id"
                closable
                @close="deselectItem(vol)"
                >{{ vol.name ? vol.name : '(No Name) / ' + vol.id }}</a-tag
              >
            </p>
          </div>
          <Field
            name="volumeId"
            v-slot="{ errorMessage }"
            v-model:value="selectedVolumeId"
          >
            <a-form-item
              :rules="[{ required: true }]"
              :help="errorMessage"
              :validate-status="errorMessage ? 'error' : undefined"
            >
              <a-table
                v-model:value="selectedVolumeId"
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
                    t(column.title, { data: t('common.content.volume') })
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
                  <template v-if="column.dataIndex === 'size'">
                    {{ gibConverter(text) }}
                  </template>
                  <template v-if="column.dataIndex === 'bootable'">
                    <span>
                      {{ text ? 'Yes' : 'No' }}
                    </span>
                  </template>
                  <template v-if="column.dataIndex === 'multiattach'">
                    <span>
                      {{ text ? 'Yes' : 'No' }}
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
import { dateConverter, gibConverter } from '@/utils/Converter';
import { getVolumeListByAttachable } from '@/axios/storage-service/VolumeApi';

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
  instanceId: {
    type: String,
    required: true,
  },
  instanceName: {
    type: String,
    required: true,
  },
  attachedVolumeList: {
    type: Array as () => VolumeType[],
    required: true,
  },
});

const isLoading = ref<boolean>(true);
const data = ref<VolumeType[]>([] as VolumeType[]);
const columns: TableColumnType<VolumeType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
  },
  {
    title: 'common.column.capacity',
    dataIndex: 'size',
  },
  {
    title: 'common.column.type',
    dataIndex: 'volumeType',
  },
  {
    title: 'common.column.booting',
    dataIndex: 'bootable',
  },
  {
    title: 'common.column.shared',
    dataIndex: 'multiattach',
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

const getResourceList = (pageNumber: number, pageSize: number) => {
  getVolumeListByAttachable(pageNumber, pageSize)
    .then((res) => {
      if (res.status === 200) {
        // if (props.attachedVolumeList.length > 0) {
        //   let tempData = res.data.data;
        //   let dupleId = [] as string[];
        //   props.attachedVolumeList.forEach((attVol) => {
        //     if (tempData.findIndex((vol) => vol.id === attVol.id) > -1) {
        //       dupleId.push(attVol.id);
        //     }
        //   });
        //
        //   let filteredData = tempData.filter((vol) => {
        //     if (!dupleId.includes(vol.id)) {
        //       return vol;
        //     }
        //   });
        //
        //   data.value = props.attachedVolumeList.concat(filteredData);
        //
        //   selectedData.value.rows.push(...props.attachedVolumeList);
        //   selectedData.value.keys.push(
        //     ...props.attachedVolumeList.map((vol) => {
        //       return vol.id;
        //     })
        //   );
        // } else {
        data.value = res.data.data;
        // }
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
  if (status?.toUpperCase() === 'IN-USE') {
    return 'geekblue';
  } else if (status?.toUpperCase() === 'ERROR') {
    return 'volcano';
  }
  return 'lightgray';
};

const validationSchema = {
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  volumeId: { conSelectRequired: '볼륨' },
};
let updateForm: any = useForm();

const selectedVolumeId = ref<string | undefined>();

const emit = defineEmits({});

const handleFormModalSubmit = () => {
  updateForm.setValues({
    volumeId: selectedVolumeId.value,
  });
  updateForm.validate().then((res: any) => {
    if (res.valid) {
      handleFormModalOk();
    } else {
      return;
    }
  });
};

const selectedData = ref<{ rows: VolumeType[]; keys: string[] }>({
  rows: [],
  keys: [],
});
const rowSelection = computed(() => {
  return {
    // TODO: checkbox
    type: 'radio',
    onChange: (selectedRowKeys: string[], selectedRows: VolumeType[]) => {
      selectedData.value.keys = selectedRowKeys;
      selectedData.value.rows = selectedRows;
      selectedVolumeId.value = selectedRowKeys[0];
      validateField('volumeId', selectedVolumeId.value);
    },
    selectedRowKeys: selectedData.value.keys,
  };
});

const deselectItem = (volume: VolumeType) => {
  selectedData.value.rows = selectedData.value.rows.filter((vol) => {
    return vol.id !== volume.id;
  });
  selectedData.value.keys = selectedData.value.keys.filter((volId) => {
    return volId !== volume.id;
  });
  if (selectedData.value.keys.length === 0) {
    selectedVolumeId.value = undefined;
    validateField('volumeId', selectedVolumeId.value);
  }
};

const validateField = (field: string, data: any) => {
  updateForm?.setFieldValue(field, data);
  updateForm?.validateField(field).then();
};

const handleFormModalOk = () => {
  emit('update:modelValue', false);
  // 이부분에 prop에 넘겨준 이벤트 이름으로 설정
  emit('attachMethod', selectedVolumeId.value);
};

const handleFormModalCancel = () => {
  emit('update:modelValue', false);
};

onMounted(() => {
  getResourceList(1, Number.MAX_SAFE_INTEGER);
});
</script>
<style lang="scss" scoped></style>
