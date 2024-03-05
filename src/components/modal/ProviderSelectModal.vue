<template>
  <div class="modal">
    <a-modal
      :visible="showModal"
      :title="t('title.provider-project-select')"
      :okText="t('common.content.action.select')"
      :ok-button-props="{ disabled: selectedData.keys.length === 0 }"
      :cancelText="t('common.content.action.cancel')"
      @ok="handleFormModalOk"
      @cancel="handleNormalModalCancel"
      centered
      width="800px"
    >
      <div class="contents">
        <a-table
          :row-selection="rowSelection"
          :columns="columns"
          :data-source="data"
          :pagination="false"
          :scroll="{ y: 300 }"
          :expand-row-by-click="true"
          :row-key="'id'"
          :loading="isLoading"
          :default-expanded-row-keys="expandedRowKeys"
          @expand="handleExpand"
          @expandedRowsChange="handleExpandedRowKeys"
        >
          <template #headerCell="{ column }">{{ t(column.title) }}</template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <span v-if="record.isProvider">
                <apartment-outlined />
                {{ record.name }}
              </span>
              <span v-if="!record.isProvider">
                <folder-outlined />
                {{
                  record.name === 'all'
                    ? t('common.content.all-project')
                    : record.name
                }}
              </span>
            </template>
            <template v-if="column.key === 'id'">
              <div class="text-ellipsis">
                <span>{{
                  record.isProvider || record.id.includes('all')
                    ? ''
                    : record.id
                }}</span>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'favorites'">
              <span v-if="!record.isProvider">
                <book-outlined />
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { computed, defineEmits, defineProps, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  ApartmentOutlined,
  BookOutlined,
  FolderOutlined,
} from '@ant-design/icons-vue';
import { getProviderList } from '@/axios/provider-service/ProviderApi';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { ProjectType } from '@/types/identity/project/ProjectListType';
import { ProviderType } from '@/types/provider/ProviderListType';
import { openNotification, sortByField } from '@/utils/CommonUtil';

const props = defineProps({
  showModal: {
    type: Boolean,
    required: true,
  },
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const isLoading = ref<boolean>(true);

const providerStore = ProviderStore();

// table data
const columns = [
  {
    title: 'common.column.name',
    dataIndex: 'name',
    key: 'name',
    width: 220,
    // TODO: 동적 정렬
    // sorter: true,
  },
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 300,
  },
  // {
  //   title: '',
  //   dataIndex: 'favorites',
  //   width: '60px',
  // },
];

const expandedRowKeys = ref<string[]>([]);
const data = ref<ProviderType[]>([]);

// 자원 목록 조회 : 공급자 목록 조회
const getResourceList = () => {
  getProviderList()
    .then((res) => {
      if (res.status === 200) {
        data.value = sortByField(res.data.data[0].providers, 'name');
        isSelected();
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const isSelected = () => {
  if (providerStore.isSelected) {
    expandedRowKeys.value.push(providerStore.getSelectedProviderId);
    selectedData.value.provider = providerStore.selectedProvider;
    selectedData.value.rows = providerStore.selectedProvider.children;
    selectedData.value.keys = [providerStore.getSelectedProjectId];
  }
};

const selectedData = ref<{
  provider: ProviderType;
  rows: ProjectType[];
  keys: string[];
}>({
  provider: {} as ProviderType,
  rows: [],
  keys: [],
});

const expandKeyIsProvider = ref<boolean>();
const handleExpand = (expanded: boolean, record: any) => {
  expandKeyIsProvider.value = record.isProvider;
  if (record.id === selectedData.value.keys[0]) {
    return;
  }
  if (!record.isProvider) {
    if (selectedData.value.keys[0] === record.id) {
      selectedData.value.keys = [];
      selectedData.value.rows = [];
    } else {
      selectedData.value.keys = [record.id];
      selectedData.value.rows = [record];
    }
  } else {
    selectedData.value.provider = {
      id: record.id,
      name: record.name,
      isProvider: record.isProvider,
    } as ProviderType;
  }
};

const handleExpandedRowKeys = (expandedKeys: string[]) => {
  if (!expandKeyIsProvider.value) {
    expandedKeys.pop();
  } else if (expandedKeys.length > 1) {
    expandedKeys.splice(0, 1);
  }
};

const rowSelection = computed(() => {
  return {
    selectedRowKeys: selectedData.value.keys,
    hideSelectAll: true,
    type: 'radio',
    getCheckboxProps: (record: ProviderType) => ({
      hidden: true,
    }),
  };
});

const emit = defineEmits({});

const handleFormModalOk = (e: MouseEvent) => {
  let provider = selectedData.value.provider;
  provider.children = selectedData.value.rows;
  providerStore.selectProvider(provider);
  emit('update:modelValue', false);
  openNotification(
    true,
    t('message.notification.success.project-selected'),
    'color: #0068ff'
  );
};

const handleNormalModalCancel = () => {
  emit('update:modelValue', false);
};

onMounted(() => {
  getResourceList();
});
</script>
<style lang="scss" scoped></style>
