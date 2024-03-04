import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { TopologyType } from '@/types/network/topology/TopologyType';

// prefix
const NETWORK_TOPOLOGY_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/network-topology`;

// 네트워크 토폴로지 목록 조회 api
export async function getTopologyData(): Promise<
  AxiosResponse<ResponseType<TopologyType>>
> {
  return instance.get(`${NETWORK_TOPOLOGY_PREFIX}`);
}
