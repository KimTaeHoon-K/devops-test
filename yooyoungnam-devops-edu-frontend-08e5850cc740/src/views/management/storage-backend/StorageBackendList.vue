<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)" />

  <div class="contents table-wrapper">
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
        <template v-if="column.dataIndex === 'name'">{{
          t(column.title, { data: t('common.content.volume-snapshot') })
        }}</template>
        <template v-else-if="column.dataIndex === 'volumeBackendName'">{{
          t(column.title, { data: t('common.content.backend') })
        }}</template>
        <template v-else>
          {{ t(column.title) }}
        </template>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          {{ text ? text : '(No name)' }}
        </template>
        <template v-else-if="column.dataIndex === 'storageCapacity'">
          <ProgressUsage
            :graphNumber="
              percentageConverter(
                record.capabilities?.totalCapacityGb -
                  record.capabilities?.freeCapacityGb,
                record.capabilities?.totalCapacityGb
              )
            "
            :available="record.capabilities?.freeCapacityGb"
            :usage="
              Number(
                (
                  record.capabilities?.totalCapacityGb -
                  record.capabilities?.freeCapacityGb
                ).toFixed(2)
              )
            "
            :total="record.capabilities?.totalCapacityGb"
            :unit="'GiB'"
          />
        </template>
        <template v-else>
          {{ record.capabilities[column.dataIndex] }}
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
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { StorageBackendType } from '@/types/storage/storage-backend/StorageBackendListType';
import { PaginationType } from '@/types/common/PaginationType';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { getStorageBackendList } from '@/axios/storage-service/StorageBackendApi';
import { percentageConverter } from '@/utils/Converter';
import { goToPageByName } from '@/utils/RouterUtil';
import ProgressUsage from '@/components/charts/ProgressUsage.vue';

const providerStore = ProviderStore();
watch(providerStore, (providerStore) => {
  if (providerStore.isChangedProvider) {
    goToPageByName(router, 'contrabass dashboard');
  }
});

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

const router = useRouter();
const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const isLoading = ref<boolean>(true);

const columns: TableColumnType<StorageBackendType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.protocol',
    dataIndex: 'storageProtocol',
  },
  {
    title: 'common.column.resource-name',
    dataIndex: 'volumeBackendName',
  },
  {
    title: 'common.column.storage-capacity',
    dataIndex: 'storageCapacity',
  },
];
const data = ref<StorageBackendType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 스토리지 백엔드 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getStorageBackendList(pageNumber, pageSize)
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
