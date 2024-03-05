<template>
  <a-row>
    <a-form-item
      label="위치"
      name="location"
      :rules="[{ required: true, message: '위치를 입력해 주세요.' }]"
      style="width: 100%"
    >
      <a-input-group compact>
        <a-input
          v-model:value="formState.location"
          placeholder="콘베 위치를 입력해 주세요."
          style="width: calc(100% - 80px)"
        />
        <a-button type="primary">위치선택</a-button>
      </a-input-group>
    </a-form-item>
  </a-row>
  <a-row>
    <a-form-item
      label="이름"
      name="location"
      :rules="[{ required: true }]"
      style="width: 100%"
    >
      <a-input-group compact>
        <a-input
          v-model:value="formState.name"
          style="width: calc(100% - 80px)"
        />
        <a-button type="primary">중복확인</a-button>
      </a-input-group>
    </a-form-item>
  </a-row>
  <a-row class="form-row" :gutter="12">
    <a-col :span="12">
      <a-form-item label="버전정보" name="versionInfo">
        <a-input v-model:value="formState.versionInfo" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="설명" name="description">
        <a-input v-model:value="formState.description" placeholder="설명" />
      </a-form-item>
    </a-col>
  </a-row>
  <div class="head-title-wrapper normal-word">
    <h3 class="heading-sub-title">계정정보</h3>
  </div>
  <a-row class="form-row" :gutter="12">
    <a-col :span="12">
      <a-form-item
        label="관리자 아이디"
        name="adminID"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.adminID" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item
        label="관리자 비밀번호"
        name="adminPassword"
        :rules="[{ required: true }]"
      >
        <a-input-password v-model:value="formState.adminPassword" />
      </a-form-item>
    </a-col>
  </a-row>
  <a-row class="form-row" :gutter="12">
    <a-col :span="12">
      <a-form-item label="도메인" name="domain" :rules="[{ required: true }]">
        <a-input v-model:value="formState.domain" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="URL" name="url" :rules="[{ required: true }]">
        <a-input v-model:value="formState.url" placeholder="URL" />
      </a-form-item>
    </a-col>
  </a-row>
  <div class="button-wrapper right">
    <a-space :size="SizeConst.sixteen">
      <a-button type="primary" @click="showAlimModal">연결 확인</a-button>
    </a-space>
  </div>
  <a-modal v-model:visible="AlimModalVisible" :title="`알림`" centered>
    연결이 확인 되었습니다.
    <template #footer>
      <div>
        <a-button type="primary" @click="handleAlimModalOk">확인</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script lang="ts" setup>
import type { UnwrapRef } from 'vue';
import { CheckCircleOutlined } from '@ant-design/icons-vue';
import { notification } from 'ant-design-vue';
import { ref, reactive, toRaw, h, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { SizeConst } from '@/types/common/constant/SizeConst';
const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

interface formState {
  description: string;
  location: string;
  versionInfo: string;
  adminID: string;
  adminPassword: string;
  domain: string;
  url: string;
}

const formState: UnwrapRef<formState> = reactive({
  description: '',
  name: '',
  location: '',
  accountInfo: '',
  adminPassword: '',
  domain: '',
  url: '',
});

const AlimModalVisible = ref<boolean>(false);
const showAlimModal = () => {
  AlimModalVisible.value = true;
  emit(
    'update:modelValue',
    reactive({
      location: formState.location,
      name: formState.name,
      version: formState.versionInfo,
      description: formState.description,
      account: {
        adminId: formState.adminID,
        adminPassword: formState.adminPassword,
        domain: formState.domain,
        url: formState.url,
      },
    })
  );
};

const emit = defineEmits({});
const handleAlimModalOk = (e: MouseEvent) => {
  AlimModalVisible.value = false;
  notification.open({
    message: '공급자 ###을 연결했습니다. ',
    icon: () => h(CheckCircleOutlined, { style: 'color: #0068ff' }),
  });
  emit('connectedMethod', {
    location: formState.location,
    name: formState.name,
    version: formState.versionInfo,
    description: formState.description,
    account: {
      adminId: formState.adminID,
      adminPassword: formState.adminPassword,
      domain: formState.domain,
      url: formState.url,
    },
  });
};

const onSubmit = (e: MouseEvent) => {
  console.log('submit!', toRaw(formState));
};
</script>

<style lang="scss" scoped></style>
