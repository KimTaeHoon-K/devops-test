<template>
  <a-pagination
    class="pagination-wrapper"
    v-model:current="pagination.currentPage"
    v-model:page-size="pagination.pageSize"
    :total="props.totalCount"
    :show-total="(total, range) => `${range[0]}-${range[1]} of ${total} items`"
    :default-current="props.currentPage.default"
    :default-page-size="props.pageSize.default"
    :show-size-changer="true"
    @change="changePagination"
    :page-size-options="props.pageSizeOptions"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { PaginationType } from '@/types/common/PaginationType';
const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  totalPage: {
    type: Number,
    default: 0,
  },
  pageSizeOptions: {
    type: Array,
  },
});

const pagination = ref<PaginationType>({
  currentPage: 1,
  pageSize: 10,
});

const emit = defineEmits({});
const changePagination = () => {
  emit('onChange', {
    currentPage: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
  });
};

onMounted(() => {
  pagination.value.currentPage = props.currentPage;
  pagination.value.pageSize = props.pageSize;
});
</script>

<style scoped></style>
