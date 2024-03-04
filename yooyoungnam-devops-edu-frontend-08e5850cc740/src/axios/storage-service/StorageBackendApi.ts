import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { StorageBackendType } from '@/types/storage/storage-backend/StorageBackendListType';

// prefix
const STORAGE_VOLUME_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/block-storage/storage-back-end`;

// 스토리지 백엔드 목록 조회 api
export async function getStorageBackendList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<StorageBackendType[]>>> {
  return instance.get(`${STORAGE_VOLUME_PREFIX}`, {
    params: { size: pageSize, page: page },
  });
}

// 스토리지 백엔드 상세 조회 api

// 스토리지 백엔드 생성 api
// 스토리지 백엔드 수정 api

// 스토리지 백엔드 삭제 api
