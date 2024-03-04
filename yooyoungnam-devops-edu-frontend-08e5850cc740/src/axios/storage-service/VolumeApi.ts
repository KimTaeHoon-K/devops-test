import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import {
  VolumeDetailType,
  VolumeType,
} from '@/types/storage/volume/VolumeListType';
import { VolumeCreateType } from '@/types/storage/volume/VolumeCreateType';
import { VolumeUpdateType } from '@/types/storage/volume/VolumeUpdateType';
import { VolumeDeleteType } from '@/types/storage/volume/VolumeDeleteType';
import { MetadataDeleteType } from '@/types/common/MetadataDeleteType';
import { MetadataResponseType } from '@/types/common/MetadataResponseType';
import { VolumeAttachType } from '@/types/storage/volume/VolumeAttachType';
import { VolumeDetachType } from '@/types/storage/volume/VolumeDetachType';
import { meta } from '@typescript-eslint/parser';

// prefix
const STORAGE_VOLUME_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/block-storage/volumes`;

// 볼륨 목록 조회 api
export async function getVolumeList(
  page: number,
  pageSize: number,
  projectId?: string
): Promise<AxiosResponse<ResponseType<VolumeType[]>>> {
  return instance.get(`${STORAGE_VOLUME_PREFIX}`, {
    params: {
      size: pageSize,
      page: page,
      projectId: projectId,
    },
  });
}

// 볼륨 목록 조회 api
export async function getVolumeListByInstanceId(
  page: number,
  pageSize: number,
  instanceId: string
): Promise<AxiosResponse<ResponseType<VolumeType[]>>> {
  return instance.get(`${STORAGE_VOLUME_PREFIX}/instance/${instanceId}`, {
    params: {
      size: pageSize,
      page: page,
    },
  });
}

// 볼륨 목록 조회 by volumeSnapshotId api
export async function getVolumeListByVolumeSnapshotId(
  page: number,
  pageSize: number,
  volumeSnapshotId: string
): Promise<AxiosResponse<ResponseType<VolumeType[]>>> {
  return instance.get(
    `${STORAGE_VOLUME_PREFIX}/volume-snapshot/${volumeSnapshotId}`,
    {
      params: { size: pageSize, page: page },
    }
  );
}

// 볼륨 목록 조회 by 서버 연결 가능 api
export async function getVolumeListByAttachable(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<VolumeType[]>>> {
  return instance.get(`${STORAGE_VOLUME_PREFIX}/attach-server`, {
    params: { size: pageSize, page: page },
  });
}

// 볼륨 서버 연결 api
export async function attachVolume(
  volumeId: string,
  instanceId: string
): Promise<AxiosResponse<ResponseType<VolumeType[]>>> {
  return instance.post(
    `${STORAGE_VOLUME_PREFIX}/${volumeId}/server/${instanceId}/action/attach-server`
  );
}

// 볼륨 서버 연결 해제 api
export async function detachVolume(
  volumeId: string,
  volumeDetachType: VolumeDetachType
): Promise<AxiosResponse<ResponseType<VolumeType[]>>> {
  return instance.post(
    `${STORAGE_VOLUME_PREFIX}/${volumeId}/action/detach-server`,
    {
      volumeAction: {
        detachVolume: volumeDetachType,
      },
    }
  );
}
// 볼륨 상세 조회 api
export async function getVolumeDetail(
  volumeId: string
): Promise<AxiosResponse<ResponseType<VolumeDetailType>>> {
  return instance.get(`${STORAGE_VOLUME_PREFIX}/${volumeId}`);
}

// 볼륨 생성 api
export async function createVolume(
  volume: VolumeCreateType
): Promise<AxiosResponse<ResponseType<VolumeType>>> {
  return instance.post(`${STORAGE_VOLUME_PREFIX}`, {
    volume: volume,
  });
}

// 볼륨 수정 api
export async function updateVolume(
  volumeId: string,
  volumeUpdateType: VolumeUpdateType
): Promise<AxiosResponse<ResponseType<VolumeType>>> {
  return instance.put(
    `${STORAGE_VOLUME_PREFIX}/${volumeId}`,
    {
      volume: volumeUpdateType.volume,
    },
    {
      params: { bootable: volumeUpdateType.volume.bootable },
    }
  );
}

// 볼륨 삭제 api
export async function deleteVolume(
  volumeDeleteType: VolumeDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${STORAGE_VOLUME_PREFIX}`, {
    data: volumeDeleteType,
  });
}

// 볼륨 메타데이터 목록 조회 api
export async function getVolumeMetadataList(
  volumeId: string
): Promise<AxiosResponse<ResponseType<MetadataResponseType>>> {
  return instance.get(`${STORAGE_VOLUME_PREFIX}/${volumeId}/metadata`);
}

// 볼륨 메타데이터 생성 api
export async function createVolumeMetadata(
  volumeId: string,
  metadata: object
): Promise<AxiosResponse<ResponseType<VolumeType>>> {
  return instance.post(`${STORAGE_VOLUME_PREFIX}/${volumeId}/metadata`, {
    metadata: metadata,
  });
}

// 볼륨 메타데이터 수정 api
export async function updateVolumeMetadata(
  volumeId: string,
  metadataKey: string,
  metadata: object
): Promise<AxiosResponse<ResponseType<VolumeType>>> {
  return instance.put(
    `${STORAGE_VOLUME_PREFIX}/${volumeId}/metadata/${metadataKey}`,
    {
      // TODO: 데이터명
      meta: metadata,
    }
  );
}

// 볼륨 메타데이터 삭제 api
export async function deleteVolumeMetadata(
  volumeId: string,
  metadataDeleteType: MetadataDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${STORAGE_VOLUME_PREFIX}/${volumeId}/metadata`, {
    data: metadataDeleteType,
  });
}
