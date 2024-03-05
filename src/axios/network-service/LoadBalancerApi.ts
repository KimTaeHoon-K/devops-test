import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { LoadBalancerType } from '@/types/network/load-balancer/LoadBalancerListType';
import { LoadBalancerUpdateType } from '@/types/network/load-balancer/LoadBalancerUpdateType';
import { LoadBalancerDeleteType } from '@/types/network/load-balancer/LoadBalancerDeleteType';
import { LoadBalancerCreateType } from '@/types/network/load-balancer/LoadBalancerCreateType';

// prefix
const NETWORK_LOAD_BALANCER_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/load-balancer/loadbalancers`;

// 로드밸런서 목록 조회 api
export async function getLoadBalancerList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<LoadBalancerType[]>>> {
  return instance.get(`${NETWORK_LOAD_BALANCER_PREFIX}`, {
    params: {
      size: pageSize,
      page: page,
    },
  });
}

// 로드밸런서 상세 조회 api
export async function getLoadBalancerDetail(
  loadBalancerId: string
): Promise<AxiosResponse<ResponseType<LoadBalancerType>>> {
  return instance.get(`${NETWORK_LOAD_BALANCER_PREFIX}/${loadBalancerId}`);
}

// 로드밸런서 생성 api
export async function createLoadBalancer(
  loadBalancer: LoadBalancerCreateType
): Promise<AxiosResponse<ResponseType<LoadBalancerType>>> {
  return instance.post(`${NETWORK_LOAD_BALANCER_PREFIX}`, {
    loadbalancer: loadBalancer,
  });
}

// 로드밸런서 수정 api
export async function updateLoadBalancer(
  loadBalancerId: string,
  loadBalancerUpdateType: LoadBalancerUpdateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(`${NETWORK_LOAD_BALANCER_PREFIX}/${loadBalancerId}`, {
    loadbalancer: loadBalancerUpdateType.loadbalancer,
  });
}

// 로드밸런서 삭제 api
export async function deleteLoadBalancer(
  loadBalancerDeleteType: LoadBalancerDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${NETWORK_LOAD_BALANCER_PREFIX}`, {
    data: loadBalancerDeleteType,
  });
}
