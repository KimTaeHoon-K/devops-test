import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { KeyPairType } from '@/types/compute/key-pair/KeyPairListType';
import { ResponseType } from '@/types/common/api/ResponseType';

// prefix
const COMPUTE_KEY_PAIR_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/compute/keypairs`;

// 키페어 목록 조회 api
export async function getKeyPairList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<KeyPairType[]>>> {
  return instance.get(`${COMPUTE_KEY_PAIR_PREFIX}`, {
    params: { size: pageSize, page: page },
  });
}

// 키페어 삭제 api
export async function deleteKeyPair(
  keypairIdList: string | string[] | undefined
): Promise<AxiosResponse<ResponseType>> {
  return instance.post(`${COMPUTE_KEY_PAIR_PREFIX}/delete`, {
    keypairIdList: keypairIdList,
  });
}
