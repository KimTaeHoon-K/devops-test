import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { PortType } from '@/types/network/port/PortType';
import { PortDeleteType } from '@/types/network/port/PortDeleteType';
import { PortCreateType } from '@/types/network/port/PortCreateType';
import { PortUpdateType } from '@/types/network/port/PortUpdateType';

// prefix
const NETWORK_PORT_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/network/ports`;

// 포트 목록 조회 api
export async function getPortList(
  page: number,
  pageSize: number,
  networkId?: string,
  subnetId?: string,
  routerId?: string,
  instanceId?: string,
  floatingIpNetworkId?: string
): Promise<AxiosResponse<ResponseType<PortType[]>>> {
  return instance.get(`${NETWORK_PORT_PREFIX}`, {
    params: {
      size: pageSize,
      page: page,
      networkId: networkId,
      subnetId: subnetId,
      routerId: routerId,
      instanceId: instanceId,
      floatingIpNetworkId: floatingIpNetworkId,
    },
  });
}

// 포트 상세 조회 api
export async function getPortDetail(
  portId: string
): Promise<AxiosResponse<ResponseType<PortType>>> {
  return instance.get(`${NETWORK_PORT_PREFIX}/${portId}`);
}

// 포트 생성 api
export async function createPort(
  port: PortCreateType
): Promise<AxiosResponse<ResponseType<PortType>>> {
  return instance.post(`${NETWORK_PORT_PREFIX}`, {
    port: port,
  });
}

// 포트 수정 api
export async function updatePort(
  portId: string,
  portUpdateType: PortUpdateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(`${NETWORK_PORT_PREFIX}/${portId}`, {
    port: portUpdateType.port,
  });
}

// 포트 삭제 api
export async function deletePort(
  portDeleteType: PortDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${NETWORK_PORT_PREFIX}`, {
    data: portDeleteType,
  });
}
