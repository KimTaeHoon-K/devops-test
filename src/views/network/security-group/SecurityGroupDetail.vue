<template>
  <Breadcrumb />
  <!-- header section -->
  <a-page-header
    class="page-header"
    :title="t(route.meta?.title)"
    @back="goToPageByNumber(router, -1)"
  >
    <!-- header button items -->
    <template #extra>
      <a-button size="middle" type="default" @click="openUpdateFormModal(data)">
        {{ t('common.content.action.edit') }}
      </a-button>
      <a-button
        size="middle"
        type="default"
        @click="openConfirmModal('delete', data)"
        >{{ t('common.content.action.delete') }}</a-button
      >
    </template>
  </a-page-header>

  <!-- 모달 -->
  <ConfirmModal
    v-model="showConfirmModal"
    :show-modal="showConfirmModal"
    :title="confirmModalData.title"
    :ok-text="confirmModalData.okText"
    :ok-button-props="confirmModalData.okButtonProps"
    :cancel-text="confirmModalData.cancelText"
    :modal-content="confirmModalData.modalContent"
    :confirm-data="confirmModalData.confirmData"
    @confirmMethod="confirmModalData.confirmMethod"
  />

  <!-- 폼 모달 -->
  <BasicUpdateFormModal
    v-if="showUpdateModal"
    v-model="showUpdateModal"
    :show-modal="showUpdateModal"
    :title="'보안 그룹 수정'"
    :origin-data="updateModalData"
    @updateMethod="updateResource"
  />

  <div class="contents">
    <BasicInfo
      :title="t('common.content.basic-information')"
      :is-loading="isLoading"
      :basic-info-columns="basicInfoColumns"
      :basic-info-data="data"
    />
    <div class="detail-info">
      <a-tabs v-model:activeKey="activeKey" :destroy-inactive-tab-pane="true">
        <a-tab-pane
          key="security-rule"
          :tab="t('common.content.security-rule')"
        >
          <SecurityGroupDetailRuleListTab :security-group-id="data.id" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { InfoColumnType } from '@/types/common/InfoColumnType';
import { goToPageByName, goToPageByNumber } from '@/utils/RouterUtil';
import BasicInfo from '@/components/details/BasicInfo.vue';
import { ConfirmModalType } from '@/types/common/ConfirmModalType';
import {
  confirmModalContentCreator,
  openNotification,
} from '@/utils/CommonUtil';
import ConfirmModal from '@/components/modal/ConfirmModal.vue';
import { BasicUpdateFormType } from '@/types/common/BasicUpdateFormType';
import BasicUpdateFormModal from '@/components/modal/BasicUpdateFormModal.vue';
import {
  deleteSecurityGroup,
  getSecurityGroupDetail,
  updateSecurityGroup,
} from '@/axios/network-service/SecurityGroupApi';
import { SecurityGroupType } from '@/types/network/security-group/SecurityGroupListType';
import { SecurityGroupDeleteType } from '@/types/network/security-group/SecurityGroupDeleteType';
import { SecurityGroupUpdateType } from '@/types/network/security-group/SecurityGroupUpdateType';
import SecurityGroupDetailRuleListTab from '@/views/network/security-group/detail-components/SecurityGroupDetailRuleListTab.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const showConfirmModal = ref<boolean>(false);
const confirmModalData = ref<ConfirmModalType>({
  title: '알림',
  okText: '확인',
  cancelText: '취소',
});

const activeKey = ref<string>('security-rule');

const isLoading = ref<boolean>(true);

const securityGroupId = route.params.id as string;

// 새로고침
const refresh = () => {
  data.value = {} as SecurityGroupType;
  isLoading.value = true;
  activeKey.value = 'security-rule';
  getResource(securityGroupId);
};

const basicInfoColumns: InfoColumnType[] = [
  {
    title: 'common.column.name',
    dataIndex: 'name',
    dataType: 'string',
  },
  {
    title: 'common.column.id',
    dataIndex: 'id',
    dataType: 'string',
    isCopyable: true,
  },
  {
    title: 'common.column.detail-info-name.project',
    dataIndex: 'projectName',
    dataType: 'string',
  },
  {
    title: 'common.column.project-id',
    dataIndex: 'projectId',
    dataType: 'string',
    isCopyable: true,
  },
  {
    title: 'common.column.description',
    dataIndex: 'description',
    dataType: 'string',
  },
];

const data = ref<SecurityGroupType>({} as SecurityGroupType);

const getResource = (id: string) => {
  getSecurityGroupDetail(id)
    .then((res) => {
      if (res.status === 200) {
        data.value = res.data.data;
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const openConfirmModal = (action: string, securityGroup: SecurityGroupType) => {
  if (action === 'delete') {
    confirmModalData.value.confirmMethod = deleteResource;
  }
  confirmModalData.value.modalContent = confirmModalContentCreator(
    '보안 그룹',
    undefined,
    securityGroup?.id,
    securityGroup?.name,
    'name',
    action,
    t
  );
  confirmModalData.value.confirmData = [securityGroup.id];
  showConfirmModal.value = true;
};

const securityGroupDeleteForm = ref<SecurityGroupDeleteType>({
  securityGroupIds: [] as string[],
});
// 자원 삭제 : 보안 그룹 삭제
const deleteResource = (idList: string[]) => {
  securityGroupDeleteForm.value.securityGroupIds = idList;
  deleteSecurityGroup(securityGroupDeleteForm.value)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.security-group'),
        }),
        'color: #0068ff'
      );
      goToPageByName(router, 'security group');
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.security-group'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    });
};

// 보안 그룹 수정
const showUpdateModal = ref<boolean>(false);
const updateModalData = ref<SecurityGroupType>({} as SecurityGroupType);
const securityGroupUpdateForm = ref<SecurityGroupUpdateType>({
  securityGroup: {} as SecurityGroupType,
});
const openUpdateFormModal = (securityGroup: SecurityGroupType) => {
  updateModalData.value = Object.assign({}, securityGroup);
  securityGroupUpdateForm.value.securityGroup.id = securityGroup.id;
  showUpdateModal.value = true;
};
const updateResource = (updateForm: BasicUpdateFormType<SecurityGroupType>) => {
  securityGroupUpdateForm.value.securityGroup.name = updateForm.name;
  securityGroupUpdateForm.value.securityGroup.description =
    updateForm.description;
  updateSecurityGroup(
    securityGroupUpdateForm.value.securityGroup.id,
    securityGroupUpdateForm.value
  )
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.security-group'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.security-group'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

onMounted(() => {
  getResource(securityGroupId);
});
</script>

<style lang="scss" scoped></style>
