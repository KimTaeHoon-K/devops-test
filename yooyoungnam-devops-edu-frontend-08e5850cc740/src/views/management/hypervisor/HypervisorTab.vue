<template>
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
      <template v-if="column.dataIndex === 'hypervisorHostName'">{{
        t(column.title, { data: t('common.content.hypervisor') })
      }}</template>
      <template v-else>
        {{ t(column.title) }}
      </template>
    </template>
    <template #bodyCell="{ column, text, record, index }">
      <!--      <template v-if="column.title === 'No.'">-->
      <!--        {{ (index + 1) + ((pagination.currentPage-1) * pagination.pageSize) }}-->
      <!--      </template>-->
      <template v-if="column.dataIndex === 'hypervisorHostName'">
        <a
          @click="
            goToPageByName(router, 'hypervisor detail', {
              id: record.id,
            })
          "
          >{{ text ? text : '(No name)' }}</a
        >
      </template>
      <template v-if="column.dataIndex === 'hypervisorType'">
        <span>
          {{ text ? text : '-' }}
        </span>
      </template>
      <template v-if="column.dataIndex === 'vcpusUsed'">
        <ProgressUsage
          :graphNumber="percentageConverter(text, record.vcpus)"
          :available="record.vcpus - text"
          :usage="text"
          :total="record.vcpus"
          :unit="'Core'"
        />
      </template>
      <template v-if="column.dataIndex === 'memoryMbUsed'">
        <ProgressUsage
          :graphNumber="percentageConverter(text, record.memoryMb)"
          :available="mbToGibConverterWithoutUnit(record.memoryMb - text)"
          :usage="mbToGibConverterWithoutUnit(text)"
          :total="mbToGibConverterWithoutUnit(record.memoryMb)"
          :unit="'GiB'"
        />
      </template>
      <template v-if="column.dataIndex === 'runningVms'">
        {{ text ? text : '-' }}
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
import { ReloadOutlined } from '@ant-design/icons-vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import {
  mbToGibConverterWithoutUnit,
  percentageConverter,
} from '@/utils/Converter';
import { getHypervisorList } from '@/axios/compute-service/HypervisorApi';
import { goToPageByName } from '@/utils/RouterUtil';
import { HypervisorType } from '@/types/compute/hypervisor/HypervisorListType';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import { PaginationType } from '@/types/common/PaginationType';
import ProgressUsage from '@/components/charts/ProgressUsage.vue';

const pagination = ref<PaginationType>({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPage: 0,
});

// 페이지 변경
const changePagination = (pageNumber: number, pageSize: number) => {
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  getResourceList(pageNumber, pageSize);
};
const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '',
  okText: '확인',
  cancelText: '취소',
});

const selectedData = ref<{ rows: HypervisorType[]; keys: string[] }>({
  rows: [],
  keys: [],
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

const columns: TableColumnType<HypervisorType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'hypervisorHostName',
  },
  {
    title: 'common.column.category',
    dataIndex: 'hypervisorType',
  },
  {
    title: 'vCPU',
    dataIndex: 'vcpusUsed',
  },
  {
    title: 'common.column.configured-memory',
    dataIndex: 'memoryMbUsed',
  },
  {
    title: 'common.column.instance-count',
    dataIndex: 'runningVms',
    // sorter: true,
  },
];

const data = ref<HypervisorType[]>();

// 새로고침
const refresh = () => {
  data.value = [];
  isLoading.value = true;
  selectedData.value = { keys: [], rows: [] };
  pagination.value.currentPage = 1;
  pagination.value.pageSize = 10;
  getResourceList(pagination.value.currentPage, pagination.value.pageSize);
};

// 자원 목록 조회 : 하이퍼바이저 목록 조회
const getResourceList = (pageNumber: number, pageSize: number) => {
  getHypervisorList(pageNumber, pageSize)
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
