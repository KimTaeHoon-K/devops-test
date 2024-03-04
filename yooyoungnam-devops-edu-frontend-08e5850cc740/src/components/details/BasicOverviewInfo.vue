<template>
  <div class="components-wrapper">
    <a-card :loading="isLoading">
      <a-descriptions
        :title="props.title"
        bordered
        :column="1"
        size="small"
        :label-style="{ width: '20%' }"
      >
        <template v-for="(col, idx) in basicInfoColumns" v-bind:key="idx">
          <a-descriptions-item :label="t(col.title)">
            <span v-if="col.dataType === 'date'" class="txt">{{
              dateConverter(basicInfoData[col.dataIndex], col.dataFormat)
            }}</span>
            <span
              v-else-if="col.dataType === 'status' && col.convertFunc"
              class="txt"
              >{{
                basicInfoData[col.dataIndex]
                  ? col.convertFunc(basicInfoData[col.dataIndex])
                  : '-'
              }}</span
            >
            <span
              v-else-if="col.dataType === 'boolean' && col.convertFunc"
              class="txt"
              >{{ col.convertFunc(basicInfoData[col.dataIndex]) }}</span
            >
            <span
              v-else-if="col.dataType === 'number' && col.convertFunc"
              class="txt"
              >{{ col.convertFunc(basicInfoData[col.dataIndex]) }}</span
            >
            <span
              v-else-if="col.dataType === 'string' && col.convertFunc"
              class="txt"
              >{{
                col.convertFunc(basicInfoData[col.dataIndex], basicInfoData)
              }}</span
            >
            <span
              v-else-if="col.dataType === 'string' || col.dataType === 'number'"
              class="txt"
              >{{
                basicInfoData[col.dataIndex]
                  ? basicInfoData[col.dataIndex]
                  : '-'
              }}</span
            >
            <span v-else-if="col.dataType === 'boolean'" class="txt">{{
              basicInfoData[col.dataIndex]
            }}</span>
            <span v-else-if="col.dataType === 'others'" class="txt">
              <slot :name="col.dataIndex" />
            </span>
            <CopyButton
              v-if="col.isCopyable"
              :textToCopy="basicInfoData[col.dataIndex]"
            />
          </a-descriptions-item>
        </template>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import { dateConverter } from '@/utils/Converter';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import CopyButton from '@/components/CopyButton.vue';

const props = defineProps({
  title: String,
  basicInfoColumns: {
    type: Array,
    required: true,
  },
  basicInfoData: {
    type: Object,
    required: true,
  },
  isLoading: {
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
</script>

<style lang="scss" scoped></style>
