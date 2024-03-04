<template>
  <Breadcrumb />
  <a-page-header class="page-header" :title="t(route.meta?.title)">
    <template #extra>
      <a-button size="middle" type="default"> 생성 </a-button>
      <a-button size="middle" type="default"> 복사 </a-button>
      <a-button size="middle" type="default"> 수정 </a-button>
      <a-button size="middle" type="default"> 삭제 </a-button>
    </template>
  </a-page-header>

  <div class="contents">
    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      :pagination="false"
      :loading="false"
      bordered
    >
      <template #title>
        <div class="table-title-wrap">
          <div class="table-title-left">
            <!--<exclamation-circle-outlined />-->
            <!--<span class="text">{{ t('message.table.can-reset-columns') }}</span>-->
          </div>
          <div class="table-title-right">
            <a-tooltip title="새로고침">
              <reload-outlined />
            </a-tooltip>
          </div>
        </div>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <a>{{ text }}</a>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { TableColumnType, TableProps } from 'ant-design-vue';
import {
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { ProviderStore } from '@/stores/provider/ProviderStore';

const providerStore = ProviderStore();
watch(providerStore, (providerStore) => {
  // 프로젝트 별 조회가 아닌 경우.
  // if (providerStore.isChangedProvider) {
  //   refresh();
  // }
  // 프로젝트 별 조회인 경우.
  // refresh();
});

const activeKey = ref('1');

interface DataType {
  key: string;
  name: string;
  description: string;
  area: string;
  role: string;
  createAt: string;
  updateAt: string;
}

const columns: TableColumnType<DataType>[] = [
  {
    title: '이름',
    dataIndex: 'name',
  },
  {
    title: '이름',
    dataIndex: 'description',
  },
  {
    title: '이름',
    dataIndex: 'area',
  },
  {
    title: '이름',
    dataIndex: 'role',
  },
  {
    title: '이름',
    dataIndex: 'createAt',
    // sorter: true,
  },
  {
    title: '이름',
    dataIndex: 'updateAt',
    // sorter: true,
  },
];

const route = useRoute();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const rowSelection: TableProps['rowSelection'] = {
  // onChange: (selectedRowKeys: string[], selectedRows: DataType[]) => {},
  getCheckboxProps: (record: DataType) => ({
    name: record.name,
  }),
};

const pageSize = ref();
</script>

<style lang="scss" scoped></style>
