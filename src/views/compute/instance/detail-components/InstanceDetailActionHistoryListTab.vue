<template>
  <div class="button-wrapper right"></div>
  <div class="table-wrapper">
    <a-table
      :columns="columns"
      :data-source="data"
      :row-key="'id'"
      :pagination="false"
      :loading="isLoading"
      bordered
    >
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'action'">{{
          t(column.title, { data: t('common.content.action-name') })
        }}</template>
        <template v-else>
          {{ t(column.title) }}
        </template>
      </template>
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex === 'action'">
          <a>{{ text ? text : '(No action)' }}</a>
        </template>
        <template v-if="column.dataIndex === 'startTime'">
          {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
        </template>
      </template>
    </a-table>
    <a-pagination
      class="pagination-wrapper"
      v-model:current="pagination.currentPage"
      v-model:page-size="pagination.pageSize"
      :total="pagination.totalCount"
      :show-total="
        (total, range) => `${range[0]}-${range[1]} of ${total} items`
      "
      :default-current="1"
      :default-page-size="10"
      :show-size-changer="true"
      @change="changePagination"
    />
  </div>
</template>

<script lang="ts" setup>
import { defineProps, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { dateConverter } from '@/utils/Converter';
import { PaginationType } from '@/types/common/PaginationType';
import { getInstanceActionList } from '@/axios/compute-service/InstanceApi';
import { InstanceActionType } from '@/types/compute/instance/InstanceActionType';

const pagination = ref<PaginationType>({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPage: 0,
});

// 페이지 변경
const changePagination = (pageNumber: number, pageSize: number) => {
  isLoading.value = true;
  getResourceList(pageNumber, pageSize);
};

const props = defineProps({
  instanceId: {
    type: String,
    required: true,
  },
});

watch(props, () => {
  if (props.instanceId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
});

const router = useRouter();
const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const isLoading = ref<boolean>(true);

const columns: TableColumnType<InstanceActionType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'action',
  },
  {
    title: 'common.column.request-id',
    dataIndex: 'requestId',
  },
  {
    title: 'common.column.action-date',
    dataIndex: 'startTime',
  },
];
const data = ref<InstanceActionType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 작업 이력 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getInstanceActionList(pageNumber, pageSize, props.instanceId)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
        pagination.value.totalCount = res.data.totalCount;
        pagination.value.totalPage = res.data.totalPage;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

onMounted(() => {
  if (props.instanceId) {
    getResourceList(pagination.value.currentPage, pagination.value.pageSize);
  }
});
</script>

<style lang="scss" scoped></style>
