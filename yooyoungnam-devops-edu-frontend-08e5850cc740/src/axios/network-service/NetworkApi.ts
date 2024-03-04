import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { NetworkType } from '@/types/network/network/NetworkListType';
import { NetworkCreateType } from '@/types/network/network/NetworkCreateType';
import { NetworkDeleteType } from '@/types/network/network/NetworkDeleteType';
import { NetworkUpdateType } from '@/types/network/network/NetworkUpdateType';

// prefix
const NETWORK_NETWORK_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/network/networks`;

// 네트워크 목록 조회 api
export async function getNetworkList(
  page: number,
  pageSize: number,
  projectId?: string,
  routerExternal?: boolean
): Promise<AxiosResponse<ResponseType<NetworkType[]>>> {
  let url = `${NETWORK_NETWORK_PREFIX}`;
  if (projectId) {
    url = `${NETWORK_NETWORK_PREFIX}/instance`;
  }
  return instance.get(url, {
    params: {
      size: pageSize,
      page: page,
      projectId: projectId,
      routerExternal: routerExternal,
    },
  });
}

// 네트워크 상세 조회 api
export async function getNetworkDetail(
  networkId: string
): Promise<AxiosResponse<ResponseType<NetworkType>>> {
  return instance.get(`${NETWORK_NETWORK_PREFIX}/${networkId}`);
}

// 네트워크 생성 api
export async function createNetwork(
  network: NetworkCreateType
): Promise<AxiosResponse<ResponseType<NetworkType>>> {
  return instance.post(`${NETWORK_NETWORK_PREFIX}`, {
    network: network,
  });
}

// 네트워크 수정 api
export async function updateNetwork(
  networkId: string,
  networkUpdateType: NetworkUpdateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(`${NETWORK_NETWORK_PREFIX}/${networkId}`, {
    network: networkUpdateType.network,
  });
}

// 네트워크 삭제 api
export async function deleteNetwork(
  networkDeleteType: NetworkDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${NETWORK_NETWORK_PREFIX}`, {
    data: networkDeleteType,
  });
}
