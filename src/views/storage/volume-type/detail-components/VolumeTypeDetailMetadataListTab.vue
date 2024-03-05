<template>
  <MetadataInfo
    :metadata-info-data="data"
    :is-loading="isLoading"
    @createResource="createMetadata"
    @updateResource="updateMetadata"
    @deleteResource="deleteMetadata"
  />
</template>

<script lang="ts" setup>
import { defineProps, onMounted, ref, watch } from 'vue';
import { openNotification } from '@/utils/CommonUtil';
import { MetadataCreateFormType } from '@/types/common/MetadataCreateFormType';
import { MetadataDeleteType } from '@/types/common/MetadataDeleteType';
import MetadataInfo from '@/components/details/MetadataInfo.vue';
import { MetadataType } from '@/types/common/MetadataType';
import { MetadataUpdateFormType } from '@/types/common/MetadataUpdateFormType';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { useI18n } from 'vue-i18n';
import {
  createVolumeTypeMetadata,
  deleteVolumeTypeMetadata,
  getVolumeTypeMetadataList,
  updateVolumeTypeMetadata,
} from '@/axios/storage-service/VolumeTypeApi';

const props = defineProps({
  volumeTypeId: {
    type: String,
    required: true,
  },
});

watch(props, () => {
  if (props.volumeTypeId) {
    getMetadata(props.volumeTypeId);
  }
});

const { t } = useI18n({
  messages: {
    english: en,
    korean: ko,
  },
});

const data = ref<MetadataType[]>([]);
const metadata = ref<any>();
const isLoading = ref<boolean>(true);

const refresh = () => {
  data.value = [];
  metadata.value = {} as object;
  isLoading.value = true;
  getMetadata(props.volumeTypeId);
};

const getMetadata = (volumeTypeId: string) => {
  getVolumeTypeMetadataList(volumeTypeId)
    .then((res) => {
      if (res.status === 200) {
        metadata.value = res.data.data.extraSpecs;
        Object.keys(metadata.value).map((key) => {
          data.value.push({
            id: key,
            key: key,
            value: metadata.value[key],
          });
        });
      }
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const createMetadata = (metadata: MetadataCreateFormType) => {
  // TODO: 타입..?
  const metadataObj = {} as any;
  metadataObj[metadata.key] = metadata.value;
  createVolumeTypeMetadata(props.volumeTypeId, metadataObj)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.volume-type-metadata'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.volume-type-metadata'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

const updateMetadata = (metadata: MetadataUpdateFormType) => {
  const metadataObj = {} as any;
  metadataObj[metadata.key] = metadata.value;
  updateVolumeTypeMetadata(props.volumeTypeId, metadata.key, metadataObj)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.volume-type-metadata'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.volume-type-metadata'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

const deleteMetadata = (metadataDeleteData: MetadataDeleteType) => {
  deleteVolumeTypeMetadata(props.volumeTypeId, metadataDeleteData)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.volume-type-metadata'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.volume-type-metadata'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

onMounted(() => {
  if (props.volumeTypeId) {
    getMetadata(props.volumeTypeId);
  }
});
</script>
