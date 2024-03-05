import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { FloatingIpType } from '@/types/network/floating-ip/FloatingIpListType';
import { FloatingIpCreateType } from '@/types/network/floating-ip/FloatingIpCreateType';
import { FloatingIpDeleteType } from '@/types/network/floating-ip/FloatingIpDeleteType';
import { FloatingIpUpdateType } from '@/types/network/floating-ip/FloatingIpUpdateType';
import { FloatingIpAssociateType } from '@/types/network/floating-ip/FloatingIpAssociateType';

// prefix
const NETWORK_FLOATING_IP_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/network/floating-ips`;

// 유동 IP 목록 조회 api
export async function getFloatingIpList(
  page: number,
  pageSize: number,
  floatingIpIds?: object | null,
  instanceId?: string,
  networkId?: string
): Promise<AxiosResponse<ResponseType<FloatingIpType[]>>> {
  let url = `${NETWORK_FLOATING_IP_PREFIX}`;
  if (floatingIpIds) {
    url = `${NETWORK_FLOATING_IP_PREFIX}/filter-by-id`;
  } else if (instanceId) {
    url = `${NETWORK_FLOATING_IP_PREFIX}/instance/${instanceId}`;
  }
  return instance.get(url, {
    params: {
      size: pageSize,
      page: page,
      floatingIpIds: floatingIpIds,
      floatingNetworkId: networkId,
    },
  });
}

// 유동 IP 상세 조회 api
export async function getFloatingIpDetail(
  floatingIpId: string
): Promise<AxiosResponse<ResponseType<FloatingIpType>>> {
  return instance.get(`${NETWORK_FLOATING_IP_PREFIX}/${floatingIpId}`);
}

// 유동 IP 생성 api
export async function createFloatingIp(
  floatingIp: FloatingIpCreateType
): Promise<AxiosResponse<ResponseType<FloatingIpType>>> {
  return instance.post(`${NETWORK_FLOATING_IP_PREFIX}`, {
    floatingIp: floatingIp,
  });
}

// 유동 IP 수정 api
export async function updateFloatingIp(
  floatingIpId: string,
  floatingIpUpdateType: FloatingIpUpdateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(`${NETWORK_FLOATING_IP_PREFIX}/${floatingIpId}/modify`, {
    floatingIp: floatingIpUpdateType.floatingIp,
  });
}

// 유동 IP 삭제 api
export async function deleteFloatingIp(
  floatingIpDeleteType: FloatingIpDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${NETWORK_FLOATING_IP_PREFIX}`, {
    data: floatingIpDeleteType,
  });
}

// 유동 IP 자원 연동 api
export async function associateFloatingIp(
  floatingIpId: string,
  floatingIpAssociateType: FloatingIpAssociateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(`${NETWORK_FLOATING_IP_PREFIX}/${floatingIpId}/connect`, {
    floatingIp: floatingIpAssociateType,
  });
}

// 유동 IP 자원 연동 해제 api
export async function disassociateFloatingIp(
  floatingIpId: string
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(
    `${NETWORK_FLOATING_IP_PREFIX}/${floatingIpId}/disassociate`
  );
}
