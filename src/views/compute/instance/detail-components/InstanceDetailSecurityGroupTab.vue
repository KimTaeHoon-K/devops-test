<template>
  <div class="button-wrapper right">
    <a-button size="middle" type="default">
      {{ t('common.content.action.management') }}
    </a-button>
  </div>
  <div class="space-20">
    <a-collapse
      v-model:activeKey="securityGroupKey"
      expandIconPosition="right"
      v-for="securityGroup in props.detailInfoSecurityGroups"
      :key="securityGroup.id"
    >
      <a-collapse-panel :key="securityGroup.id" :header="securityGroup.name">
        <a-tabs
          v-model:securityGroupType="securityGroupType"
          :destroy-inactive-tab-pane="true"
        >
          <a-tab-pane key="egress" tab="Egress">
            <InstanceDetailSecurityGroupTable
              :security-group-id="securityGroup.id"
              :security-group-type="'egress'"
            />
          </a-tab-pane>
          <a-tab-pane key="ingress" tab="Ingress">
            <InstanceDetailSecurityGroupTable
              :security-group-id="securityGroup.id"
              :security-group-type="'ingress'"
            />
          </a-tab-pane>
        </a-tabs>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import InstanceDetailSecurityGroupTable from '@/views/compute/instance/detail-components/InstanceDetailSecurityGroupTable.vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const securityGroupKey = ref([]);
const securityGroupType = ref<string>('egress');

const props = defineProps({
  detailInfoSecurityGroups: {
    type: Array,
  },
});
</script>

<style lang="scss" scoped></style>
