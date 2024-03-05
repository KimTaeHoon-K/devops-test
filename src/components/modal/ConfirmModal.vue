<template>
  <div class="modal">
    <a-modal
      :visible="showModal"
      :title="title"
      @ok="handleNormalModalOk"
      @cancel="handleNormalModalCancel"
      :okText="okText"
      :okButtonProps="okButtonProps"
      :cancelText="cancelText"
      :cancelButtonProps="cancelButtonProps"
    >
      <p>{{ modalContent }}</p>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  okText: {
    type: String,
    default: '확인',
  },
  okButtonProps: {
    type: Object,
    default: null,
  },
  cancelText: {
    type: String,
    default: '취소',
  },
  cancelButtonProps: {
    type: Object,
    default: null,
  },
  modalContent: {
    type: String,
    default: '',
  },
  confirmData: {
    type: Object,
  },
});

const emit = defineEmits({});

const handleNormalModalOk = () => {
  emit('update:confirmModalData', {
    title: '알림',
    okText: '확인',
    cancelText: '취소',
  });
  emit('update:modelValue', false);
  // 이부분에 prop에 넘겨준 이벤트 이름으로 설정
  emit('confirmMethod', props.confirmData);
};

const handleNormalModalCancel = () => {
  emit('update:confirmModalData', {
    title: '알림',
    okText: '확인',
    cancelText: '취소',
  });
  emit('update:modelValue', false);
  emit('cancelMethod', 'confirm');
};
</script>
<style lang="scss" scoped></style>
