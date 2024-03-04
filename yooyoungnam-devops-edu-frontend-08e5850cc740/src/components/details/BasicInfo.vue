<template>
  <div class="basic-info">
    <a-collapse
      v-model:activeKey="detailOptionActiveKey"
      expandIconPosition="right"
    >
      <a-collapse-panel key="1" :header="props.title">
        <a-card :bordered="false" :loading="isLoading">
          <ul class="list-area">
            <li
              class="item"
              v-for="(col, idx) in basicInfoColumns"
              v-bind:key="idx"
            >
              <strong class="title">{{ t(col.title) }}</strong>
              <div class="information">
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
                  v-else-if="
                    col.dataType === 'string' || col.dataType === 'number'
                  "
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
              </div>
            </li>
          </ul>
        </a-card>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script lang="ts" setup>
import { ref, defineProps } from 'vue';
import { dateConverter } from '@/utils/Converter';
import { useI18n } from 'vue-i18n';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import CopyButton from '@/components/CopyButton.vue';

const detailOptionActiveKey = ref(1);

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
