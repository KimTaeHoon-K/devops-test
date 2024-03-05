<template>
  <div class="tenant-navigator">
    <a @click="openProviderSelectModal">
      <img src="@/assets/images/icon/icon-navigator.svg" alt="" />
      <div class="text-area">
        <div class="project-name">
          {{
            providerStore?.isSelected
              ? providerStore?.getSelectedProjectName === 'all'
                ? t('common.content.all-project')
                : providerStore?.getSelectedProjectName
              : '프로젝트를 선택해 주세요.'
          }}
        </div>
        <div class="provider-name">
          {{
            providerStore?.isSelected
              ? providerStore?.getSelectedProviderName
              : '공급자를 선택해 주세요.'
          }}
        </div>
      </div>
      <setting-outlined class="icon icon-right" />
    </a>
  </div>
</template>
<script lang="ts" setup>
import { defineEmits, defineProps, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { SettingOutlined } from '@ant-design/icons-vue';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { goToPageByName } from '@/utils/RouterUtil';

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false,
  },
});
const router = useRouter();

const providerStore = ProviderStore();
watch(providerStore, (providerStore) => {
  if (providerStore.isChangedProvider) {
    goToPageByName(router, 'contrabass dashboard');
  }
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const emit = defineEmits({});

const openProviderSelectModal = () => {
  emit('update:modelValue', true);
};
</script>
<style lang="scss" scoped></style>
