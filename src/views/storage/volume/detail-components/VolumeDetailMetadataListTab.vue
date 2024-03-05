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
import {
  createVolumeMetadata,
  deleteVolumeMetadata,
  getVolumeMetadataList,
  updateVolumeMetadata,
} from '@/axios/storage-service/VolumeApi';
import { MetadataCreateFormType } from '@/types/common/MetadataCreateFormType';
import { MetadataDeleteType } from '@/types/common/MetadataDeleteType';
import MetadataInfo from '@/components/details/MetadataInfo.vue';
import { MetadataType } from '@/types/common/MetadataType';
import { MetadataUpdateFormType } from '@/types/common/MetadataUpdateFormType';
import en from '@/locales/lang/en';
import ko from '@/locales/lang/ko';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  volumeId: {
    type: String,
    required: true,
  },
});

watch(props, () => {
  if (props.volumeId) {
    getMetadata(props.volumeId);
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
  getMetadata(props.volumeId);
};

const getMetadata = (volumeId: string) => {
  getVolumeMetadataList(volumeId)
    .then((res) => {
      if (res.status === 200) {
        metadata.value = res.data.data.metadata;
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
  createVolumeMetadata(props.volumeId, metadataObj)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.create', {
          data: t('common.content.volume-metadata'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.create', {
          data: t('common.content.volume-metadata'),
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
  updateVolumeMetadata(props.volumeId, metadata.key, metadataObj)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.update', {
          data: t('common.content.volume-metadata'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.update', {
          data: t('common.content.volume-metadata'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

const deleteMetadata = (metadataDeleteData: MetadataDeleteType) => {
  deleteVolumeMetadata(props.volumeId, metadataDeleteData)
    .then((res) => {
      openNotification(
        true,
        t('message.notification.success.delete', {
          data: t('common.content.volume-metadata'),
        }),
        'color: #0068ff'
      );
    })
    .catch((err) => {
      console.error(err);
      openNotification(
        false,
        `${t('message.notification.error.delete', {
          data: t('common.content.volume-metadata'),
        })}\n${err.code}${err.message}`,
        'color: #ff4d4f'
      );
    })
    .finally(() => {
      refresh();
    });
};

onMounted(() => {
  if (props.volumeId) {
    getMetadata(props.volumeId);
  }
});
</script>
