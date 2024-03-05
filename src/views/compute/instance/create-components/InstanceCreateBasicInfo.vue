<template>
  <a-form class="form" name="basic" layout="vertical">
    <div class="head-title-wrapper">
      <h3 class="heading-sub-title">
        {{ t('message.create.step-info.basic-info.title') }}
      </h3>
      <p class="description">
        {{ t('message.create.step-info.basic-info.description.instance') }}
      </p>
    </div>
    <a-row class="form-row" :gutter="12">
      <a-col :span="12">
        <Field
          v-model="emitsInstanceBasicInfo.instanceName"
          v-slot="{ name, handleChange, errorMessage }"
          name="instanceName"
        >
          <a-form-item
            :label="t('common.column.name')"
            :rules="[{ required: true }]"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-input
              v-bind="name"
              :value="emitsInstanceBasicInfo.instanceName"
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
        <a-form-item :label="t('common.column.description')" name="description">
          <a-input
            v-model:value="emitsInstanceBasicInfo.instanceDescription"
            :placeholder="
              t('message.placeholder.input-1', {
                data: t('common.column.description'),
              })
            "
          />
        </a-form-item>
      </a-col>
    </a-row>
    <a-row class="form-row" :gutter="12">
      <a-col :span="12">
        <Field
          name="availabilityZone"
          v-model="emitsInstanceBasicInfo.availabilityZone"
          v-slot="{ errorMessage }"
        >
          <a-form-item
            label="Availability Zone"
            :rules="[{ required: true }]"
            :help="errorMessage"
            :has-feedback="!!errorMessage"
            :validate-status="errorMessage ? 'error' : undefined"
          >
            <a-select
              v-model:value="emitsInstanceBasicInfo.availabilityZone"
              show-search
              placeholder="Availability Zone을 선택해 주세요."
              style="width: 100%"
              :options="availabilityZoneOptions"
            ></a-select>
          </a-form-item>
        </Field>
      </a-col>
    </a-row>
    <a-row>
      <div class="ant-form-item-label">
        <label for="basic_project" class="ant-form-item-required">{{
          t('menu.management.project.main')
        }}</label>
      </div>
    </a-row>
    <div class="head-title-wrapper normal-word">
      <p class="text" v-if="!emitsInstanceBasicInfo.projectId">
        {{ '선택 프로젝트' }}
      </p>
      <p class="text" v-else>
        <a-tag>{{ emitsInstanceBasicInfo.projectName }}</a-tag>
      </p>
    </div>
    <Field
      name="project"
      v-slot="{ project, errorMessage }"
      v-model:value="projectId"
    >
      <a-form-item
        :rules="[{ required: true }]"
        :help="errorMessage"
        :validate-status="errorMessage ? 'error' : undefined"
      >
        <a-table
          v-bind="project"
          v-model:value="projectId"
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
          <!--          <div class="table-title-right">-->
          <!--            <a-tooltip title="새로고침">-->
          <!--              <reload-outlined />-->
          <!--            </a-tooltip>-->
          <!--          </div>-->
          <!--        </div>-->
          <!--      </template>-->
          <template #headerCell="{ column }">
            <template v-if="column.dataIndex === 'name'">{{
              t(column.title, { data: t('common.content.project') })
            }}</template>
            <template v-else>
              {{ t(column.title) }}
            </template>
          </template>
          <template #bodyCell="{ column, text }">
            <template v-if="column.dataIndex === 'name'">
              <folder-outlined />
              {{ text }}
            </template>
            <template v-if="column.dataIndex === 'id'">
              {{ text }}
            </template>
          </template>
        </a-table>
      </a-form-item>
    </Field>
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
import { FolderOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { ProjectType } from '@/types/identity/project/ProjectListType';
import { getProjectList } from '@/axios/identity-service/ProjectApi';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { ProviderStoreType } from '@/types/provider/ProviderStoreType';
import { getAvailabilityZoneSummaryList } from '@/axios/compute-service/HostAggregatesApi';

const providerStore = ProviderStore();

watch(providerStore, () => {
  refresh();
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const projectId = ref<string[]>([]);

const isLoading = ref<boolean>(true);

const columns: TableColumnType<ProjectType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
  },
  {
    title: 'common.column.project-id',
    dataIndex: 'id',
  },
];

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  instanceBasicInfo: Object,
  isCheckValid: {
    type: Boolean,
    default: false,
  },
});

const initData = () => {
  if (props.isCheckValid) {
    emitsInstanceBasicInfo.value = {
      instanceName: props.instanceBasicInfo?.instanceName,
      instanceDescription: props.instanceBasicInfo?.instanceDescription,
      projectId: props.instanceBasicInfo?.projectId,
      projectName: props.instanceBasicInfo?.projectName,
      availabilityZone: props.instanceBasicInfo?.availabilityZone,
    };
  }
};

const emits = defineEmits(['update:instanceBasicInfo', 'update:isCheckValid']);
const emitsInstanceBasicInfo = ref({
  instanceName: '',
  instanceDescription: '',
  projectId: '',
  projectName: '',
  availabilityZone: undefined,
});

const data = ref<ProjectType[]>();

// 행 체크 로직
const rowSelection = computed(() => {
  if (
    providerStore.isSelected &&
    !providerStore.getSelectedProjectId.includes('all')
  ) {
    return {
      type: 'radio',
      selectedRowKeys: projectId.value,
      getCheckboxProps: (record: ProviderStoreType) => ({
        disabled: record,
      }),
    };
  } else {
    return {
      type: 'radio',
      onChange: (selectedRowKeys: string[], selectedRows: ProjectType[]) => {
        projectId.value = selectedRowKeys;
        emitsInstanceBasicInfo.value.projectId = selectedRowKeys[0];
        emitsInstanceBasicInfo.value.projectName = selectedRows[0].name;
        validateField('project', projectId.value);
      },
      selectedRowKeys: projectId.value,
    };
  }
});

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  getResourceList();
};

// 프로젝트 목록 조회
const getResourceList = () => {
  getProjectList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        if (
          providerStore.isSelected &&
          !providerStore.getSelectedProjectId.includes('all')
        ) {
          projectId.value[0] = providerStore.getSelectedProjectId;
          emitsInstanceBasicInfo.value.projectId =
            providerStore.getSelectedProjectId;
          emitsInstanceBasicInfo.value.projectName =
            providerStore.getSelectedProjectName;
        } else {
          let findPropsProject = data.value.find(
            (obj) => obj.id === props.instanceBasicInfo?.projectId
          );
          if (findPropsProject) {
            projectId.value[0] = findPropsProject.id;
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

// 자원 목록 조회 : 가용 존 목록 조회
const availabilityZoneOptions = ref<SelectProps['options']>([]);
const getAvailabilityZoneResourceList = () => {
  getAvailabilityZoneSummaryList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        res.data.data.forEach((avaZone) => {
          if (avaZone.zoneState.available) {
            availabilityZoneOptions.value?.push({
              value: avaZone.zoneName,
              label: avaZone.zoneName,
            });
          }
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

onMounted(() => {
  initData();
  getResourceList();
  getAvailabilityZoneResourceList();
});

onUnmounted(() => {
  emits('update:instanceBasicInfo', emitsInstanceBasicInfo.value);
  emits('update:isCheckValid', true);
});
</script>
<style lang="scss" scoped></style>
