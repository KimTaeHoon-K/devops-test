import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { NetworkUpdateType } from '@/types/network/network/NetworkUpdateType';
import { SubnetCreateType } from '@/types/network/network/subnet/SubnetCreateType';
import { SubnetType } from '@/types/network/network/subnet/SubnetListType';
import { SubnetDeleteType } from '@/types/network/network/subnet/SubnetDeleteType';
import { SubnetUpdateType } from '@/types/network/network/subnet/SubnetUpdateType';

// prefix
const NETWORK_SUBNET_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/network/subnets`;

// 서브넷 목록 조회 api
export async function getSubnetList(
  page: number,
  pageSize: number,
  networkId: string
): Promise<AxiosResponse<ResponseType<SubnetType[]>>> {
  return instance.get(`${NETWORK_SUBNET_PREFIX}`, {
    params: {
      size: pageSize,
      page: page,
      networkId: networkId,
    },
  });
}

// 서브넷 상세 조회 api
export async function getSubnetDetail(
  subnetId: string
): Promise<AxiosResponse<ResponseType<SubnetType>>> {
  return instance.get(`${NETWORK_SUBNET_PREFIX}/${subnetId}`);
}

// 서브넷 생성 api
export async function createSubnet(
  subnet: SubnetCreateType
): Promise<AxiosResponse<ResponseType<SubnetType>>> {
  return instance.post(`${NETWORK_SUBNET_PREFIX}`, {
    subnet: subnet,
  });
}

// 서브넷 수정 api
export async function updateSubnet(
  subnetId: string,
  subnetUpdateType: SubnetUpdateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(`${NETWORK_SUBNET_PREFIX}/${subnetId}`, {
    subnet: subnetUpdateType.subnet,
  });
}

// 서브넷 삭제 api
export async function deleteSubnet(
  subnetDeleteType: SubnetDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${NETWORK_SUBNET_PREFIX}`, {
    data: subnetDeleteType,
  });
}
