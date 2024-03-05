<template>
  <a-form name="basic" layout="vertical">
    <div class="head-title-wrapper">
      <h3 class="heading-sub-title">
        {{ t('message.create.step-info.instance.security.title') }}
      </h3>
      <p class="description">
        {{ t('message.create.step-info.instance.security.description') }}
      </p>
    </div>
    <a-row>
      <div class="ant-form-item-label">
        <label for="basic_project" class="ant-form-item-required">
          {{ t('common.content.security-group') }}
        </label>
      </div>
    </a-row>
    <div class="head-title-wrapper normal-word">
      <p class="text" v-if="selectedSecurityGroup.rows.length === 0">
        {{ '보안 그룹을 선택해 주세요.' }}
      </p>
      <p class="text" v-else>
        <a-tag
          v-for="securityGroup in selectedSecurityGroup.rows"
          v-bind:key="securityGroup.id"
          closable
          @close="deselectItem(securityGroup)"
          >{{ securityGroup.name }}</a-tag
        >
      </p>
    </div>
    <div class="basic-info">
      <Field name="securityGroup" v-slot="{ errorMessage }">
        <!-- a-form-item 태그에서 has-feedback 옵션은 validation 상태 아이콘을 표시한다. -->
        <a-form-item
          :rules="[{ required: true }]"
          :help="errorMessage"
          :validate-status="errorMessage ? 'error' : undefined"
        >
          <a-table
            :row-selection="securityGroupRowSelection"
            :columns="securityGroupColumns"
            :data-source="securityGroupData"
            :loading="isSecurityGroupLoading"
            :row-key="'name'"
            :pagination="false"
            :scroll="{ y: 300 }"
            bordered
          >
            <template #headerCell="{ column }">
              <template v-if="column.dataIndex === 'name'">{{
                t(column.title, { data: t('common.content.security-group') })
              }}</template>
              <template v-else>
                {{ t(column.title) }}
              </template>
            </template>
            <template #bodyCell="{ column, text }">
              <template v-if="column.dataIndex === 'createdAt'">
                {{ dateConverter(text, 'YYYY-MM-DD HH:mm:ss') }}
              </template>
            </template>
          </a-table>
        </a-form-item>
      </Field>
    </div>

    <div class="basic-info">
      <a-collapse
        v-model:activeKey="KeyPairActiveKey"
        expandIconPosition="right"
      >
        <a-collapse-panel key="1" :header="t('common.content.key-pair')">
          <div class="head-title-wrapper normal-word">
            <p class="text" v-if="!emitsSecurityInfo.keypairName">
              {{ '선택 키페어' }}
            </p>
            <p class="text" v-else>
              <a-tag>{{ emitsSecurityInfo.keypairName }}</a-tag>
            </p>
          </div>
          <a-table
            :row-selection="keypairRowSelection"
            :columns="keypairColumns"
            :data-source="keypairData"
            :loading="isKeypairLoading"
            :row-key="'name'"
            :pagination="false"
            :scroll="{ y: 300 }"
            bordered
          >
            <template #headerCell="{ column }">
              <template v-if="column.dataIndex === 'name'">{{
                t(column.title, { data: t('common.content.key-pair') })
              }}</template>
              <template v-else>
                {{ t(column.title) }}
              </template>
            </template>
            <template #bodyCell="{ column, text }">
              <template v-if="column.dataIndex === 'imgName'">
                <a>{{ text }}</a>
              </template>
              <!--            <template v-else-if="column.dataIndex === 'status'">-->
              <!--            <span>-->
              <!--              <a-tag :color="text === 'active' ? 'processing' : (text === 'stop' ? 'warning' : 'success')">-->
              <!--                {{ text }}-->
              <!--              </a-tag>-->
              <!--            </span>-->
              <!--            </template>-->
            </template>
          </a-table>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </a-form>
</template>

<script lang="ts" setup>
import type { TableColumnType } from 'ant-design-vue';
import {
  computed,
  defineEmits,
  defineProps,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { getKeyPairList } from '@/axios/compute-service/KeypairApi';
import { KeyPairType } from '@/types/compute/key-pair/KeyPairListType';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { Field } from 'vee-validate';
import { dateConverter } from '@/utils/Converter';
import { SecurityGroupType } from '@/types/network/security-group/SecurityGroupListType';
import { getSecurityGroupList } from '@/axios/network-service/SecurityGroupApi';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { sortByField } from '@/utils/CommonUtil';

const providerStore = ProviderStore();
watch(providerStore, () => {
  // 프로젝트 별 조회인 경우.
  refresh();
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const props = defineProps({
  validateForm: {
    type: Object,
    required: true,
  },
  securityInfo: Object,
  projectId: {
    type: String,
    required: true,
  },
  isCheckValid: {
    type: Boolean,
    default: false,
  },
});

const initData = () => {
  if (props.isCheckValid) {
    emitsSecurityInfo.value = {
      securityGroupNames: props.securityInfo?.securityGroupNames,
      keypairName: props.securityInfo?.keypairName,
    };
  }
};

const KeyPairActiveKey = ref(1);

const emits = defineEmits(['update:securityInfo', 'update:isCheckValid']);

const emitsSecurityInfo = ref({
  securityGroupNames: props.securityInfo?.securityGroupNames,
  keypairName: props.securityInfo?.keypairName,
});

const securityGroupColumns: TableColumnType<SecurityGroupType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.created-at',
    dataIndex: 'createdAt',
    // sorter: true,
  },
];

const keypairColumns: TableColumnType<KeyPairType>[] = [
  {
    title: 'common.column.resource-name',
    dataIndex: 'name',
    // sorter: true,
  },
  {
    title: 'common.column.fingerprint',
    dataIndex: 'fingerprint',
  },
];

// 새로고침
const refresh = () => {
  securityGroupData.value = [];
  isSecurityGroupLoading.value = true;
  getSecurityGroupResourceList();
};

// 자원 목록 조회 : 보안 그룹 목록 조회
const securityGroupData = ref<SecurityGroupType[]>();
const isSecurityGroupLoading = ref<boolean>(true);
const getSecurityGroupResourceList = () => {
  getSecurityGroupList(1, Number.MAX_SAFE_INTEGER, props.projectId)
    .then((res) => {
      if (res.status === 200) {
        securityGroupData.value = sortByField(res.data.data, 'name');
        if (props.securityInfo?.securityGroupNames?.length > 0) {
          selectedSecurityGroup.value.keys =
            props.securityInfo?.securityGroupNames;
          validateField('securityGroup', selectedSecurityGroup.value.keys);
          selectedSecurityGroup.value.rows = securityGroupData.value?.filter(
            (sg) => {
              return props.securityInfo?.securityGroupNames.find(
                (sgName: string) => {
                  return sgName === sg.name;
                }
              );
            }
          ) as SecurityGroupType[];
        }
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isSecurityGroupLoading.value = false;
    });
};

// 자원 목록 조회 : 키페어 목록 조회
const keypairData = ref<KeyPairType[]>();
const isKeypairLoading = ref<boolean>(true);
const getKeyPairResourceList = () => {
  getKeyPairList(1, Number.MAX_SAFE_INTEGER)
    .then((res) => {
      if (res.status === 200) {
        keypairData.value = sortByField(res.data.data, 'name');
        if (props.securityInfo?.keypairName) {
          selectedKeyPair.value.keys = [
            keypairData.value?.find(
              (keyPair) => keyPair.name === props.securityInfo?.keypairName
            )?.name,
          ];
        }
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isKeypairLoading.value = false;
    });
};

const selectedKeyPair = ref<{
  rows: KeyPairType[];
  keys: string[] | undefined[] | unknown[];
}>({
  rows: [],
  keys: [],
});
const keypairRowSelection = computed(() => {
  return {
    type: 'radio',
    onChange: (selectedRowKeys: string[], selectedRows: KeyPairType[]) => {
      selectedKeyPair.value.rows = selectedRows;
      selectedKeyPair.value.keys = selectedRowKeys;
      emitsSecurityInfo.value.keypairName = selectedRowKeys[0];
    },
    selectedRowKeys: selectedKeyPair.value.keys,
  };
});

const selectedSecurityGroup = ref<{
  rows: SecurityGroupType[];
  keys: string[] | undefined[] | unknown[];
}>({
  rows: [],
  keys: [],
});
const securityGroupRowSelection = computed(() => {
  return {
    onChange: (
      selectedRowKeys: string[],
      selectedRows: SecurityGroupType[]
    ) => {
      selectedSecurityGroup.value.keys = selectedRowKeys;
      selectedSecurityGroup.value.rows = selectedRows;
      emitsSecurityInfo.value.securityGroupNames = selectedRowKeys;
      validateField('securityGroup', selectedRowKeys);
    },
    selectedRowKeys: selectedSecurityGroup.value.keys,
  };
});

const deselectItem = (securityGroup: SecurityGroupType) => {
  selectedSecurityGroup.value.rows = selectedSecurityGroup.value.rows.filter(
    (sg) => {
      return sg.id !== securityGroup.id;
    }
  );
  selectedSecurityGroup.value.keys = selectedSecurityGroup.value.keys.filter(
    (sgName) => {
      return sgName !== securityGroup.name;
    }
  );
  if (selectedSecurityGroup.value.keys.length === 0) {
    emitsSecurityInfo.value.securityGroupNames = [];
    validateField('securityGroup', emitsSecurityInfo.value.securityGroupNames);
  }
};

const validateField = (field: string, data: any) => {
  props.validateForm?.setFieldValue(field, data);
  props.validateForm?.validateField(field).then();
};

onMounted(() => {
  initData();
  getSecurityGroupResourceList();
  getKeyPairResourceList();
});

onUnmounted(() => {
  emits('update:securityInfo', emitsSecurityInfo.value);
  emits('update:isCheckValid', true);
});
</script>

<style lang="scss" scoped></style>
