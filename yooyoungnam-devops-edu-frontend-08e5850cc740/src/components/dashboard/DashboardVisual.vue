<template>
  <div class="dashboard-visual">
    <div class="img">
      <img :src="props.photo" alt="" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps } from 'vue';
const props = defineProps({
  photo: {
    type: String,
    required: true,
  },
});
</script>
<style lang="scss" scoped></style>
