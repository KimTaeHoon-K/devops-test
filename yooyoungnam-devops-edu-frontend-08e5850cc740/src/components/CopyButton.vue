<template>
  <button @click="copyText">
    <copy-outlined />
  </button>
</template>

<script lang="ts" setup>
import { h } from 'vue';
import { CopyOutlined, CheckCircleOutlined } from '@ant-design/icons-vue';
import { notification } from 'ant-design-vue';
import { defineProps } from 'vue';

const props = defineProps({
  textToCopy: {
    type: String,
    required: true,
  },
});

const copyText = async () => {
  try {
    // clipboard API 는 localhost나 https 환경에서만 동작
    await navigator.clipboard.writeText(props.textToCopy);
    notification.open({
      message: '복사 되었습니다.',
      icon: () => h(CheckCircleOutlined, { style: 'color: #0068ff' }),
    });
  } catch (err) {
    // localhost과 https 외의 환경 예외처리
    let textArea = document.createElement('textarea');
    textArea.value = props.textToCopy;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      notification.open({
        message: '복사 되었습니다.',
        icon: () => h(CheckCircleOutlined, { style: 'color: #0068ff' }),
      });
    } catch (err) {
      notification.error({
        message: 'Error',
      });
    } finally {
      document.body.removeChild(textArea);
    }
  }
};
</script>
