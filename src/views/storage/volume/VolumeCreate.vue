<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header class="page-header" :title="t(route.meta?.title)" />
  <Form
    @submit="createResource"
    @invalid-submit="checkValid"
    :validation-schema="validationSchema"
    ref="createForm"
  >
    <div class="contents">
      <a-card>
        <a-form class="form" name="basic" layout="vertical">
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="name"
                v-model="volumeForm.name"
                v-slot="{ handleChange, errorMessage }"
              >
                <!-- :rules="[{ required: true }]" : label 필수 표시 위해 추가 -->
                <a-form-item
                  :label="t('common.column.name')"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    @update:value="handleChange"
                    @blur="handleBlur('name')"
                    @input="nameValue = $event.target.value"
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
                v-model="volumeForm.description"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.description')"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    @update:value="handleChange"
                    @blur="handleBlur('description')"
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
                name="owner"
                v-model="volumeForm.ownerProjectId"
                v-slot="{ errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.owner-project')"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                  style="width: 100%"
                >
                  <!-- TODO: @update:value / @blur 동시 유효성 체크? -->
                  <a-select
                    :value="volumeForm.ownerProjectId"
                    style="width: 100%"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: t('common.content.project'),
                      })
                    "
                    :disabled="projectOptionsDisabled"
                    @update:value="handleProjectChange"
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
                name="availabilityZone"
                v-model="volumeForm.availabilityZone"
                v-slot="{ errorMessage }"
              >
                <a-form-item label="가용 존">
                  <a-select
                    v-model:value="volumeForm.availabilityZone"
                    show-search
                    placeholder="가용 존을 선택해 주세요."
                    style="width: 100%"
                    :options="availabilityZoneOptions"
                  ></a-select>
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="size"
                v-model="volumeForm.size"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  label="용량 (GiB)"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="volumeForm.size"
                    @update:value="handleChange"
                    @blur="handleBlur('size', 'number')"
                    @input="handleChange"
                    :min="0"
                    :default-value="0"
                    :placeholder="
                      t('message.placeholder.input-1', {
                        data: t('common.column.capacity'),
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <a-form-item :label="'부팅 가능'">
                <a-switch v-model:checked="volumeForm.bootable" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="form-row">
            <div class="ant-form-item-label">
              <label for="basic_project">볼륨 소스</label>
            </div>
          </a-row>
          <div class="head-title-wrapper normal-word">
            <p class="text">
              {{
                selectedImage
                  ? selectedImage.name
                  : selectedVolumeSnapshot
                  ? selectedVolumeSnapshot.name
                  : '볼륨 소스를 선택하지 않을 경우 빈 볼륨으로 생성합니다.'
              }}
            </p>
          </div>
          <a-form-item>
            <a-space
              class="space-block"
              direction="vertical"
              :size="SizeConst.eight"
            >
              <a-radio-group
                class="radio-group-button"
                v-model:value="volumeSourceChoiceValue"
                name="volumeSourceChoice"
                :disabled="createByVolumeSnapshot"
              >
                <a-radio-button value="image">이미지</a-radio-button>
                <a-radio-button value="volume-snapshot"
                  >볼륨 스냅샷</a-radio-button
                >
              </a-radio-group>
              <template v-if="volumeSourceChoiceValue === 'image'">
                <ImageTable v-model:image="selectedImage" />
              </template>
              <template
                v-else-if="volumeSourceChoiceValue === 'volume-snapshot'"
              >
                <VolumeSnapshotTable
                  v-model:volume-snapshot="selectedVolumeSnapshot"
                  :volume-snapshot-id="volumeSnapshotId"
                  :selected-project-id="volumeForm.ownerProjectId"
                />
              </template>
            </a-space>
          </a-form-item>
          <a-row class="form-row">
            <div class="ant-form-item-label">
              <label for="basic_project">볼륨 타입</label>
            </div>
          </a-row>
          <div class="head-title-wrapper normal-word">
            <p class="text">
              {{
                selectedVolumeType ? selectedVolumeType?.name : '선택 볼륨 타입'
              }}
            </p>
          </div>
          <a-form-item>
            <a-space
              class="space-block"
              direction="vertical"
              :size="SizeConst.eight"
            >
              <VolumeTypeTable
                v-model:volume-type="selectedVolumeType"
                :volume-source-choice-value="volumeSourceChoiceValue"
                :selected-volume-snapshot="selectedVolumeSnapshot"
              ></VolumeTypeTable>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
    <div class="footer-bar">
      <div class="footer-bar-right">
        <a-space :size="SizeConst.sixteen">
          <a-button size="large" @click="router.go(-1)">{{
            t('common.content.action.cancel')
          }}</a-button>
          <a-button type="primary" size="large" html-type="submit">{{
            t('common.content.action.create')
          }}</a-button>
        </a-space>
      </div>
    </div>
  </Form>
</template>

<script lang="ts" setup>
import type { SelectProps } from 'ant-design-vue';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Field, Form, useField, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { goToPageByName } from '@/utils/RouterUtil';
import { openNotification } from '@/utils/CommonUtil';
import { getProjectList } from '@/axios/identity-service/ProjectApi';
import { ProjectType } from '@/types/identity/project/ProjectListType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { VolumeCreateType } from '@/types/storage/volume/VolumeCreateType';
import { createVolume } from '@/axios/storage-service/VolumeApi';
import { PaginationType } from '@/types/common/PaginationType';
import { getAvailabilityZoneSummaryList } from '@/axios/compute-service/HostAggregatesApi';
import VolumeTypeTable from '@/views/storage/volume/create-components/VolumeTypeTable.vue';
import ImageTable from '@/views/storage/volume/create-components/ImageTable.vue';
import VolumeSnapshotTable from '@/views/storage/volume/create-components/VolumeSnapshotTable.vue';
import { VolumeTypeType } from '@/types/storage/volume-type/VolumeTypeListType';
import { ImageType } from '@/types/compute/image/ImageListType';
import { VolumeSnapshotType } from '@/types/storage/volume-snapshot/VolumeSnapshotListType';
import { bytesToGibConverterWithoutUnit } from '@/utils/Converter';
import { SizeConst } from '@/types/common/constant/SizeConst';

// TODO: 생성 중 프로젝트 변경 하면 안되지 않나..?
const providerStore = ProviderStore();
const projectOptionsDisabled = ref<boolean>();
watch(providerStore, () => {
  setProjectSelection();
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const volumeSnapshotId = route.query.volumeSnapshotId as string;
const projectId = route.query.projectId as string;
const createByVolumeSnapshot = ref<boolean>(false);

const volumeSourceChoiceValue = ref<string>('image');

const pagination = ref<PaginationType>({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPage: 0,
});

const projectOptions = ref<ProjectType[]>([]);
const getProjectResourceList = () => {
  getProjectList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        projectOptions.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};
const setProjectSelection = () => {
  if (projectId) {
    projectOptionsDisabled.value = true;
    volumeForm.value.ownerProjectId = projectId;
  } else {
    projectOptionsDisabled.value =
      providerStore.isSelected &&
      !providerStore.getSelectedProjectId.includes('all');
    if (projectOptionsDisabled.value) {
      volumeForm.value.ownerProjectId = providerStore.getSelectedProjectId;
    } else {
      volumeForm.value.ownerProjectId = undefined;
      setValidateFieldError('owner', undefined);
    }
  }
};

// 자원 목록 조회 : 가용 존 목록 조회
const availabilityZoneOptions = ref<SelectProps['options']>([]);
const getAvailabilityZoneResourceList = (
  pageNumber: number,
  pageSize: number
) => {
  getAvailabilityZoneSummaryList(pageNumber, pageSize)
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

const selectedVolumeType = ref<VolumeTypeType>();
const selectedImage = ref<ImageType>();
const selectedVolumeSnapshot = ref<VolumeSnapshotType>();
const volumeForm = ref<VolumeCreateType>({
  name: '',
  description: '',
  ownerProjectId: '',
  availabilityZone: undefined,
  size: 0,
  bootable: false,
  multiattach: true,
  volumeTypeId: undefined,
  imageId: undefined,
  snapshotId: undefined,
});

let createForm: any = useForm();
const { value: nameValue } = useField('name');
const validationSchema = ref<any>({
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  description: { conInputMaxText: 40 },
  size: {
    conInputRequired: '용량',
    conInputOnlyNaturalNumber: String,
    conInputGreaterThan: 0,
  },
  owner: { conSelectRequired: '소유 프로젝트' },
});

watch([selectedVolumeSnapshot, selectedImage], () => {
  if (selectedVolumeSnapshot.value) {
    validationSchema.value.size.conInputGreaterThan =
      selectedVolumeSnapshot.value.size;
    if (!createByVolumeSnapshot.value) {
      createForm.validateField('size');
    }
  } else if (selectedImage.value) {
    validationSchema.value.size.conInputGreaterThan = Math.ceil(
      Number(bytesToGibConverterWithoutUnit(selectedImage.value.size))
    );
    createForm.validateField('size');
  } else {
    validationSchema.value.size.conInputGreaterThan = 0;
    createForm.setFieldError('size', null);
  }
});

const checkValid = () => {
  // invalid submit
};

const handleProjectChange = (e: any) => {
  volumeForm.value.ownerProjectId = e;
  createForm.validateField('projectId');
};

const handleBlur = (field: string, inputType?: string) => {
  if (field !== 'owner') {
    createForm.validateField(field);
    setValidateFieldError('owner', undefined);
  }
};

const setValidateFieldError = (field: string, error: string | undefined) => {
  createForm.validateField(field).then((res: any) => {
    if (!res.valid) {
      createForm.setFieldError(field, error);
    }
  });
};

const createResource = () => {
  if (selectedVolumeType.value) {
    volumeForm.value.volumeTypeId = selectedVolumeType.value.id;
  }
  if (selectedImage.value) {
    volumeForm.value.imageId = selectedImage.value.id;
  }
  if (selectedVolumeSnapshot.value) {
    volumeForm.value.snapshotId = selectedVolumeSnapshot.value.id;
  }
  createVolume(volumeForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.volume'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.volume'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      goToPageByName(router, 'volume');
    });
};

onMounted(async () => {
  getAvailabilityZoneResourceList(
    pagination.value.currentPage,
    pagination.value.pageSize
  );
  getProjectResourceList();
  setProjectSelection();
  await router.isReady();
  if (volumeSnapshotId && projectId) {
    createByVolumeSnapshot.value = true;
    volumeSourceChoiceValue.value = 'volume-snapshot';
  }
});
</script>
<style lang="scss" scoped></style>
