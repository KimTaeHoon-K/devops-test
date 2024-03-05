<template>
  <!--  <a-page-header class="page-header" :title="t(route.meta?.title)">-->
  <!--    <template #extra>-->
  <!--      <a-button-->
  <!--          size="middle"-->
  <!--          type="default"-->
  <!--          @click="goToPageByName(router, 'image create')"-->
  <!--      >-->
  <!--        {{ t('common.content.action.create') }}-->
  <!--      </a-button>-->
  <!--      <a-button size="middle" type="default" @click="openDeleteConfirmModal()">-->
  <!--        {{ t('common.content.action.delete') }}-->
  <!--      </a-button>-->
  <!--    </template>-->
  <!--  </a-page-header>-->
  <a-table
    :columns="columns"
    :data-source="data"
    :row-key="'id'"
    :pagination="false"
    :loading="isLoading"
    bordered
  >
    <template #title>
      <div class="table-title-wrap">
        <div class="table-title-left">
          <!--<exclamation-circle-outlined />-->
          <!--<span class="text">{{ t('message.table.can-reset-columns') }}</span>-->
        </div>
        <div class="table-title-right">
          <a-tooltip :title="t('common.content.action.refresh')">
            <reload-outlined @click="refresh()" />
          </a-tooltip>
        </div>
      </div>
    </template>
    <template #headerCell="{ column }">
      <template v-if="column.dataIndex === 'zoneName'">{{
        t(column.title, { data: t('common.content.availability-zone') })
      }}</template>
      <template v-else>
        {{ t(column.title) }}
      </template>
    </template>
    <template #bodyCell="{ column, text, record, index }">
      <!--      <template v-if="column.title === 'No.'">-->
      <!--        {{ (index + 1) + ((pagination.currentPage-1) * pagination.pageSize) }}-->
      <!--      </template>-->
      <template v-if="column.dataIndex === 'zoneName'">
        <a
          @click="
            goToPageByName(router, 'zoneName detail', {
              id: record.id,
            })
          "
          >{{ text ? text : '(No name)' }}</a
        >
      </template>
      <template v-if="column.dataIndex === 'zoneState'">
        {{ text.available === true ? 'Yes' : 'No' }}
      </template>
    </template>
  </a-table>
  <a-pagination
    class="pagination-wrapper"
    v-model:current="pagination.currentPage"
    v-model:page-size="pagination.pageSize"
    :total="pagination.totalCount"
    :show-total="(total, range) => `${range[0]}-${range[1]} of ${total} items`"
    :default-current="1"
    :default-page-size="10"
    :show-size-changer="true"
    @change="changePagination"
  />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import {
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { goToPageByName } from '@/utils/RouterUtil';
import { AvailabilityZoneType } from '@/types/compute/host-aggregates/AvailabilityZoneListType';
import { getAvailabilityZoneList } from '@/axios/compute-service/HostAggregatesApi';
import { PaginationType } from '@/types/common/PaginationType';

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
const showConfirmModal = ref<boolean>(false);

const router = useRouter();
const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const isLoading = ref<boolean>(true);

const columns: TableColumnType<AvailabilityZoneType>[] = [
  // {
  //   title: 'No.',
  //   sorter: false,
  // },
  {
    title: 'common.column.resource-name',
    dataIndex: 'zoneName',
  },
  {
    title: 'common.column.isAvailable',
    dataIndex: 'zoneState',
  },
];

const data = ref<AvailabilityZoneType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 가용존 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getAvailabilityZoneList(pageNumber, pageSize)
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
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
});
</script>

<style lang="scss" scoped></style>
