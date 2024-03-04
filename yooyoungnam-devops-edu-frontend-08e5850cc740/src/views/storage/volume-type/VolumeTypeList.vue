<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra>
      <a-button
        size="middle"
        type="default"
        @click="handleShowCreateModalProp(activeKey - 1)"
      >
        {{ t('common.content.action.create') }}
      </a-button>
      <a-button
        size="middle"
        type="default"
        @click="handleShowConfirmModalProp(activeKey - 1, 'delete')"
        :disabled="selectedDataCount[0] === 0 && selectedDataCount[1] === 0"
      >
        {{ t('common.content.action.delete') }}
      </a-button>
    </template>
  </a-page-header>

  <div class="contents">
    <div class="table-wrapper">
      <a-tabs v-model:activeKey="activeKey" :destroy-inactive-tab-pane="true">
        <a-tab-pane key="1" :tab="t('menu.storage.volume-type.main')">
          <VolumeTypeTab
            v-model:selected-data-count="selectedDataCount[0]"
            v-model:show-confirm-modal-prop="showConfirmModalProps[0]"
            v-model:show-create-modal-prop="showCreateModalProps[0]"
          />
        </a-tab-pane>
        <a-tab-pane key="2" :tab="t('menu.storage.qos-specs.main')">
          <QosSpecsTab
            v-model:selected-data-count="selectedDataCount[1]"
            v-model:show-confirm-modal-prop="showConfirmModalProps[1]"
            v-model:show-create-modal-prop="showCreateModalProps[1]"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Breadcrumb from '@/components/Breadcrumb.vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import VolumeTypeTab from '@/views/storage/volume-type/VolumeTypeTab.vue';
import QosSpecsTab from '@/views/storage/volume-type/QosSpecsTab.vue';

const activeKey = ref('1');

const showConfirmModalProps = ref<boolean[]>([false, false]);
const showCreateModalProps = ref<boolean[]>([false, false]);
const selectedDataCount = ref<number[]>([0, 0]);

const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const handleShowCreateModalProp = (tabKey: number) => {
  showCreateModalProps.value[tabKey] = true;
};

const handleShowConfirmModalProp = (tabKey: number, action: string) => {
  showConfirmModalProps.value[tabKey] = true;
};
</script>

<style lang="scss" scoped></style>
