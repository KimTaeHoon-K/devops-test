import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { VolumeTypeType } from '@/types/storage/volume-type/VolumeTypeListType';
import { VolumeTypeDeleteType } from '@/types/storage/volume-type/VolumeTypeDeleteType';
import { QosSpecsType } from '@/types/storage/volume-type/QosSpecsListType';
import { QosSpecsDeleteType } from '@/types/storage/volume-type/QosSpecsDeleteType';
import { VolumeTypeCreateType } from '@/types/storage/volume-type/VolumeTypeCreateType';
import { QosSpecsCreateType } from '@/types/storage/volume-type/QosSpecsCreateType';
import { VolumeTypeUpdateType } from '@/types/storage/volume-type/VolumeTypeUpdateType';
import { VolumeTypeMetadataResponseType } from '@/types/common/MetadataResponseType';
import { MetadataDeleteType } from '@/types/common/MetadataDeleteType';

// prefix
const STORAGE_VOLUME_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/block-storage/volumes`;

// 볼륨 타입 목록 조회 api
export async function getVolumeTypeList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<VolumeTypeType[]>>> {
  return instance.get(`${STORAGE_VOLUME_PREFIX}/volume-type`, {
    params: { size: pageSize, page: page },
  });
}

// 볼륨 타입 상세 조회 api
export async function getVolumeTypeDetail(
  volumeTypeId: string
): Promise<AxiosResponse<ResponseType<VolumeTypeType>>> {
  return instance.get(`${STORAGE_VOLUME_PREFIX}/volume-type/${volumeTypeId}`);
}

// 볼륨 타입 생성 api
export async function createVolumeType(
  volumeType: VolumeTypeCreateType
): Promise<AxiosResponse<ResponseType<VolumeTypeType>>> {
  return instance.post(`${STORAGE_VOLUME_PREFIX}/volume-type`, {
    volumeType: volumeType,
  });
}

// 볼륨 타입 수정 api
export async function updateVolumeType(
  volumeTypeId: string,
  volumeTypeUpdateType: VolumeTypeUpdateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(`${STORAGE_VOLUME_PREFIX}/volume-type`, {
    volumeTypeId: volumeTypeId,
    volumeType: volumeTypeUpdateType.volumeType,
  });
}

// 볼륨 타입 삭제 api
export async function deleteVolumeType(
  volumeTypeDeleteType: VolumeTypeDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${STORAGE_VOLUME_PREFIX}/volume-type`, {
    data: volumeTypeDeleteType,
  });
}

// 볼륨 타입 메타데이터 목록 조회 api
export async function getVolumeTypeMetadataList(
  volumeTypeId: string
): Promise<AxiosResponse<ResponseType<VolumeTypeMetadataResponseType>>> {
  return instance.get(
    `${STORAGE_VOLUME_PREFIX}/volume-type/${volumeTypeId}/extra-specs`
  );
}

// 볼륨 타입 메타데이터 생성 api
export async function createVolumeTypeMetadata(
  volumeTypeId: string,
  metadata: object
): Promise<AxiosResponse<ResponseType<VolumeTypeType>>> {
  return instance.post(`${STORAGE_VOLUME_PREFIX}/volume-type-extra`, {
    volumeTypeId: volumeTypeId,
    extraSpecs: metadata,
  });
}

// 볼륨 타입 메타데이터 수정 api
export async function updateVolumeTypeMetadata(
  volumeTypeId: string,
  metadataKey: string,
  metadata: object
): Promise<AxiosResponse<ResponseType<VolumeTypeType>>> {
  return instance.put(`${STORAGE_VOLUME_PREFIX}/volume-type-extra`, {
    volumeTypeId: volumeTypeId,
    key: metadataKey,
    extraSpecs: metadata,
  });
}

// 볼륨 타입 메타데이터 삭제 api
export async function deleteVolumeTypeMetadata(
  volumeTypeId: string,
  metadataDeleteType: MetadataDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${STORAGE_VOLUME_PREFIX}/volume-type-extra`, {
    data: {
      volumeTypeId: volumeTypeId,
      keys: metadataDeleteType.keyNames,
    },
  });
}

// 볼륨 타입 QoS Specs 목록 조회 api
export async function getQosSpecsList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<QosSpecsType[]>>> {
  return instance.get(`${STORAGE_VOLUME_PREFIX}/volume-type-qos`, {
    params: { size: pageSize, page: page },
  });
}

// 볼륨 타입 QoS Specs 상세 조회 api

// 볼륨 타입 QoS Specs 생성 api
export async function createQosSpecs(
  qosSpecs: QosSpecsCreateType
): Promise<AxiosResponse<ResponseType<QosSpecsType>>> {
  return instance.post(`${STORAGE_VOLUME_PREFIX}/volume-type-qos`, {
    qos_specs: qosSpecs, // TODO: 카멜 케이스
  });
}

// 볼륨 타입 QoS Specs 수정 api

// 볼륨 타입 QoS Specs 삭제 api
export async function deleteQosSpecs(
  qosSpecsDeleteType: QosSpecsDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${STORAGE_VOLUME_PREFIX}/volume-type-qos`, {
    data: qosSpecsDeleteType,
  });
}

// 볼륨 타입 QoS Specs 연결 api
export async function associateQosSpecs(
  qosSpecsId: string,
  volumeTypeId: string
): Promise<AxiosResponse<ResponseType<VolumeTypeType>>> {
  return instance.get(
    `${STORAGE_VOLUME_PREFIX}/volume-type-qos/${qosSpecsId}/associate`,
    {
      params: { volumeTypeId: volumeTypeId },
    }
  );
}

// 볼륨 타입 QoS Specs 해제 api
export async function disassociateQosSpecs(
  qosSpecsId: string,
  volumeTypeId: string
): Promise<AxiosResponse<ResponseType<VolumeTypeType>>> {
  return instance.get(
    `${STORAGE_VOLUME_PREFIX}/volume-type-qos/${qosSpecsId}/disassociate`,
    {
      params: { volumeTypeId: volumeTypeId },
    }
  );
}
