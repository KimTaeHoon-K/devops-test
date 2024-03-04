<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header
    class="page-header"
    :title="t(route.meta?.title)"
  ></a-page-header>
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
                v-model="imageForm.name"
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
                v-model="imageForm.description"
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
          <a-row class="form-row">
            <Field
              name="owner"
              v-model="imageForm.projectId"
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
                  :value="imageForm.projectId"
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
          </a-row>
          <a-row class="form-row">
            <Field
              name="file"
              v-model="file"
              v-slot="{ handleChange, errorMessage }"
            >
              <a-form-item
                :label="t('common.column.image-upload')"
                :rules="[{ required: true }]"
                :help="errorMessage"
                :has-feedback="!!errorMessage"
                :validate-status="errorMessage ? 'error' : undefined"
              >
                <a-upload
                  v-model:value="file"
                  @change="handleFileChange"
                  @update:value="handleChange"
                  :accept="'.qcow2,.raw,.iso,.aki,.ari,.ami,.vdi,.vhd,.img'"
                  :custom-request="() => {}"
                >
                  <a-button>
                    <upload-outlined></upload-outlined>
                    {{ t('common.content.action.file-upload') }}
                  </a-button>
                </a-upload>
              </a-form-item>
            </Field>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="diskFormat"
                v-model="imageForm.diskFormat"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="t('common.column.format')"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-select
                    show-search
                    placeholder="포맷을 선택해 주세요."
                    style="width: 100%"
                    :options="formatOptions"
                    @update:value="handleChange"
                  ></a-select>
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <Field
                name="os"
                v-model="imageForm.os"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'OS'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-select
                    show-search
                    placeholder="OS를 선택해 주세요."
                    style="width: 100%"
                    :options="osOptions"
                    @update:value="handleChange"
                  >
                  </a-select>
                </a-form-item>
              </Field>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="12">
              <Field
                name="osVersion"
                v-model="imageForm.osVersion"
                v-slot="{ osVersionValue, handleChange, errorMessage }"
              >
                <a-form-item
                  :label="'OS Version'"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input
                    :value="osVersionValue"
                    @update:value="handleChange"
                    @blur="handleBlur('osVersion')"
                    placeholder="OS Version을 입력해 주세요."
                  />
                </a-form-item>
              </Field>
            </a-col>
            <!--            <a-col :span="12">-->
            <!--              <a-form-item :label="'OS Admin'">-->
            <!--                <a-input-->
            <!--                  v-model:value="imageForm.OSAdmin"-->
            <!--                  placeholder="OS Admin을 입력해 주세요."-->
            <!--                />-->
            <!--              </a-form-item>-->
            <!--            </a-col>-->
          </a-row>
          <a-row class="form-row" :gutter="12">
            <a-col :span="6">
              <Field
                name="minDisk"
                v-model="imageForm.minDisk"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="`${t('common.column.min-system-disk')} (GB)`"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="imageForm.minDisk"
                    @update:value="handleChange"
                    @blur="handleBlur('minDisk', 'number')"
                    @input="handleChange"
                    :min="0"
                    :default-value="0"
                    :placeholder="
                      t('message.placeholder.input-2', {
                        data: 'Disk',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="6">
              <Field
                name="minRam"
                v-model="imageForm.minRam"
                v-slot="{ handleChange, errorMessage }"
              >
                <a-form-item
                  :label="`${t('common.column.min-memory')} (GB)`"
                  :rules="[{ required: true }]"
                  :help="errorMessage"
                  :has-feedback="!!errorMessage"
                  :validate-status="errorMessage ? 'error' : undefined"
                >
                  <a-input-number
                    v-model:value="imageForm.minRam"
                    @update:value="handleChange"
                    @blur="handleBlur('minRam', 'number')"
                    @input="handleChange"
                    :min="0"
                    :default-value="0"
                    :placeholder="
                      t('message.placeholder.input-2', {
                        data: 'Ram',
                      })
                    "
                  />
                </a-form-item>
              </Field>
            </a-col>
            <a-col :span="12">
              <a-form-item :label="t('common.column.public-scope')">
                <a-select
                  v-model:value="imageForm.visibility"
                  show-search
                  placeholder="공개범위를 선택해 주세요."
                  style="width: 100%"
                  :options="visibilityOptions"
                  @change="handleVisibilityChange"
                ></a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="form-row" v-if="imageForm.visibility === 'shared'">
            <Field
              name="shared"
              v-model="imageForm.sharedProjectIds"
              v-slot="{ handleChange, errorMessage }"
            >
              <a-form-item
                :label="t('common.column.shared-project')"
                :rules="[{ required: true }]"
                :help="errorMessage"
                :has-feedback="!!errorMessage"
                :validate-status="errorMessage ? 'error' : undefined"
                style="width: 100%"
              >
                <a-select
                  mode="multiple"
                  v-model:value="imageForm.sharedProjectIds"
                  style="width: 100%"
                  :placeholder="
                    !imageForm.projectId
                      ? '소유 프로젝트를 먼저 선택해 주세요.'
                      : '프로젝트를 선택해 주세요.'
                  "
                  @update:value="handleChange"
                  :allow-clear="true"
                  :disabled="!imageForm.projectId"
                >
                  <a-select-option
                    v-for="project in sharedProjectOptions"
                    v-bind:key="project"
                    :disabled="project.id === imageForm.projectId"
                    :value="project.id"
                  >
                    {{ project.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </Field>
          </a-row>
          <a-row class="form-row" :gutter="12">
            <!--            <a-col :span="12">-->
            <!--              <a-form-item :label="t('common.column.use-type')">-->
            <!--                <a-select-->
            <!--                  v-model:value="value"-->
            <!--                  show-search-->
            <!--                  placeholder="사용 유형를 선택해 주세요."-->
            <!--                  style="width: 100%"-->
            <!--                  :options="userTypeOptions"-->
            <!--                  :filter-option="filterUserTypeOption"-->
            <!--                  @change="handleOsChange"-->
            <!--                ></a-select>-->
            <!--              </a-form-item>-->
            <!--            </a-col>-->
            <a-col :span="24">
              <a-form-item :label="t('common.column.is-protected')">
                <a-switch v-model:checked="imageForm.protected" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-collapse
            v-model:activeKey="detailOptionActiveKey"
            :bordered="false"
            ghost
            expandIconPosition="right"
          >
            <a-collapse-panel key="1" header="세부 옵션">
              <a-row class="form-row">
                <a-form-item
                  :label="`qemu_guest_agent ${t('common.column.activate')}`"
                >
                  <a-switch v-model:checked="qemuQuestAgentChecked" />
                </a-form-item>
              </a-row>
              <!--            <a-row class="form-row" :gutter="12">-->
              <!--              <a-col :span="12">-->
              <!--                <a-form-item-->
              <!--                  label="CPU 정책"-->
              <!--                  :rules="[-->
              <!--                    { required: true, message: 'CPU 정책을 선택해 주세요.' },-->
              <!--                  ]"-->
              <!--                >-->
              <!--                  <a-select-->
              <!--                    v-model:value="value"-->
              <!--                    show-search-->
              <!--                    placeholder="CPU 정책을 선택해 주세요."-->
              <!--                    style="width: 100%"-->
              <!--                    :options="cpuPolicyOptions"-->
              <!--                    :filter-option="filterCpuPolicyOption"-->
              <!--                    @change="handleFormatChange"-->
              <!--                  ></a-select>-->
              <!--                </a-form-item>-->
              <!--              </a-col>-->
              <!--              <a-col :span="12">-->
              <!--                <a-form-item-->
              <!--                  label="CPU 스레드 정책"-->
              <!--                  :rules="[-->
              <!--                    {-->
              <!--                      required: true,-->
              <!--                      message: 'CPU 스레드 정책를 선택해 주세요.',-->
              <!--                    },-->
              <!--                  ]"-->
              <!--                >-->
              <!--                  <a-select-->
              <!--                    v-model:value="value"-->
              <!--                    show-search-->
              <!--                    placeholder="CPU 스레드 정책를 선택해 주세요."-->
              <!--                    style="width: 100%"-->
              <!--                    :options="cpuSredPolicyOptions"-->
              <!--                    :filter-option="filterCpuStredPolicyOption"-->
              <!--                    @change="handleOsChange"-->
              <!--                  ></a-select>-->
              <!--                </a-form-item>-->
              <!--              </a-col>-->
              <!--            </a-row>-->
            </a-collapse-panel>
          </a-collapse>
        </a-form>
      </a-card>
    </div>
    <div class="footer-bar">
      <div class="footer-bar-right">
        <a-space :size="SizeConst.sixteen">
          <a-button size="large" @click="goToPageByName(router, 'image')">{{
            t('common.content.action.cancel')
          }}</a-button>
          <a-button
            type="primary"
            size="large"
            html-type="submit"
            :loading="createLoading"
            >{{ t('common.content.action.create') }}</a-button
          >
        </a-space>
      </div>
    </div>
  </Form>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import type { SelectProps } from 'ant-design-vue';
import { UploadChangeParam } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Field, Form, useField, useForm } from 'vee-validate';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { goToPageByName } from '@/utils/RouterUtil';
import { createImage, uploadImageFile } from '@/axios/compute-service/ImageApi';
import { openNotification } from '@/utils/CommonUtil';
import { ImageCreateType } from '@/types/compute/image/ImageCreateType';
import { getProjectList } from '@/axios/identity-service/ProjectApi';
import { ProjectType } from '@/types/identity/project/ProjectListType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { ImageType } from '@/types/compute/image/ImageListType';
import { SizeConst } from '@/types/common/constant/SizeConst';

// TODO: 생성 중 프로젝트 변경 하면 안되지 않나..?
const providerStore = ProviderStore();
const projectOptionsDisabled = ref<boolean>();
watch(providerStore, () => {
  getProjectResourceList();
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

const detailOptionActiveKey = ref();
const qemuQuestAgentChecked = ref<boolean>(true);

// file upload
const file = ref<File>({} as File);
const handleFileChange = (info: UploadChangeParam) => {
  if (info.fileList.length > 0) {
    info.file.status = 'done';
    file.value = info.file.originFileObj as File;
    openNotification(
      true,
      `[${info.file.name}]가 업로드 되었습니다.`,
      'color: #0068ff'
    );
  } else {
    file.value = {} as File;
    openNotification(
      false,
      `[${info.file.name}]가 삭제 되었습니다.`,
      'color: #ff4d4f'
    );
  }
};

const projectOptions = ref<ProjectType[]>([]);
const sharedProjectOptions = ref<ProjectType[]>([]);
const getProjectResourceList = () => {
  getProjectList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        projectOptions.value = res.data.data;
        sharedProjectOptions.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};
const setProjectSelection = () => {
  projectOptionsDisabled.value =
    providerStore.isSelected &&
    !providerStore.getSelectedProjectId.includes('all');
  if (projectOptionsDisabled.value) {
    imageForm.value.projectId = providerStore.getSelectedProjectId;
  } else {
    imageForm.value.projectId = undefined;
    setValidateFieldError('owner', undefined);
  }
  clearSharedProjectSelect();
};

const formatOptions = ref<SelectProps['options']>([
  {
    value: 'qcow2',
    label: 'QCOW2 - QEMU image format',
  },
  {
    value: 'raw',
    label: 'RAW - RAW disk image format',
  },
  {
    value: 'iso',
    label: 'ISO - Optical disc image format',
  },
  {
    value: 'aki',
    label: 'AKI - Amazon kernel image format',
  },
  {
    value: 'ari',
    label: 'ARI - Amazon ramdisk image format',
  },
  {
    value: 'ami',
    label: 'AMI - Amazon server image format',
  },
  {
    value: 'vdi',
    label: 'VDI - VirtualBox compatible image format',
  },
  {
    value: 'vhd',
    label: 'VHD - VirtualPC compatible image format',
  },
]);

const osOptions = ref<SelectProps['options']>([
  {
    value: 'CentOS',
    label: 'CentOS',
  },
  {
    value: 'Ubuntu',
    label: 'Ubuntu',
  },
  {
    value: 'Fedora',
    label: 'Fedora',
  },
  {
    value: 'Windows',
    label: 'Windows',
  },
  {
    value: 'Debian',
    label: 'Debian',
  },
  {
    value: 'CoreOS',
    label: 'CoreOS',
  },
  {
    value: 'Arch',
    label: 'Arch',
  },
  {
    value: 'FreeBSD',
    label: 'FreeBSD',
  },
  {
    value: 'Others',
    label: 'Others',
  },
]);

const visibilityOptions = ref<SelectProps['options']>([
  {
    value: 'public',
    label: 'Public',
  },
  {
    value: 'private',
    label: 'Private',
  },
  {
    value: 'shared',
    label: 'Shared',
  },
]);

const imageForm = ref<ImageCreateType>({
  name: '',
  description: '',
  diskFormat: undefined, // 포맷
  os: undefined,
  osVersion: '',
  minDisk: 0, // GB
  minRam: 0, // MB
  visibility: 'public', // public, private, shared, community
  protected: false,
  containerFormat: 'bare', // TODO: image file 업로드 위해선 필수.. 값 선택?
  projectId: undefined,
  sharedProjectIds: [],
  // qemuGuestAgent: false,
});

let createForm: any = useForm();
const { value: nameValue } = useField('name');
const validationSchema = {
  // 작성 순서로 유효성 체크 우선 순위 결정 됨.
  name: {
    conInputRequired: t('common.column.name'),
    conInputNotBlank: String,
  },
  description: { conInputMaxText: 40 },
  minDisk: {
    conInputRequired: '시스템 디스크 최솟값',
    conInputOnlyNaturalNumber: String,
  },
  minRam: {
    conInputRequired: '메모리 최솟값',
    conInputOnlyNaturalNumber: String,
  },
  owner: { conSelectRequired: '소유 프로젝트' },
  diskFormat: { conSelectRequired: '포맷' },
  os: { conSelectRequired: 'OS' },
  osVersion: { conInputRequired: 'OS Version', conInputNotBlank: String },
  shared: {},
  file: { conUploadRequired: '이미지 파일' },
};

const checkValid = () => {
  // invalid submit
};

const handleProjectChange = (e: any) => {
  imageForm.value.projectId = e;
  createForm.validateField('projectId');
  clearSharedProjectSelect();
};

const clearSharedProjectSelect = () => {
  imageForm.value.sharedProjectIds = [];
  setValidateFieldError('shared', undefined);
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

const handleVisibilityChange = (e: any) => {
  if (e === 'shared') {
    validationSchema.shared = { conMultipleSelectRequired: '공유 프로젝트' };
  } else {
    validationSchema.shared = {};
  }
};

const createLoading = ref<boolean>(false);

const createResource = () => {
  createLoading.value = true;
  createImage(imageForm.value)
    .then((res) => {
      if (res.status === 200) {
        uploadFile(res.data.data);
      }
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        '이미지 생성에 실패하였습니다.\n' + err.code + err.message,
        'color: #ff4d4f'
      );
    });
};
const uploadFile = (createdImage: ImageType) => {
  let formData = new FormData();
  formData.append('file', file.value);
  uploadImageFile(createdImage.id, formData)
    .then((res) => {
      openNotification(
        true,
        '이미지 생성이 성공적으로 완료되었습니다.',
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      // TODO: 파일 업로드 실패 시 생성된 이미지 삭제..
    })
    .finally(() => {
      createLoading.value = false;
      goToPageByName(router, 'image');
    });
};

onMounted(() => {
  getProjectResourceList();
  setProjectSelection();
});
</script>
<style lang="scss" scoped></style>
