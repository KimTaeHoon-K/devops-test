import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { PoolDeleteType } from '@/types/network/load-balancer/pool/PoolDeleteType';
import { PoolUpdateType } from '@/types/network/load-balancer/pool/PoolUpdateType';
import { PoolType } from '@/types/network/load-balancer/pool/PoolListType';
import { PoolCreateType } from '@/types/network/load-balancer/pool/PoolCreateType';

// prefix
const NETWORK_LOAD_BALANCER_POOL_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/load-balancer/pools`;

// 풀 목록 조회 api
export async function getPoolList(
  page: number,
  pageSize: number,
  loadbalancerId: string
): Promise<AxiosResponse<ResponseType<PoolType[]>>> {
  return instance.get(`${NETWORK_LOAD_BALANCER_POOL_PREFIX}`, {
    params: {
      size: pageSize,
      page: page,
      loadbalancerId: loadbalancerId,
    },
  });
}

// 풀 상세 조회 api
export async function getPoolDetail(
  poolId: string
): Promise<AxiosResponse<ResponseType<PoolType>>> {
  return instance.get(`${NETWORK_LOAD_BALANCER_POOL_PREFIX}/${poolId}`);
}

// 풀 생성 api
export async function createPool(
  pool: PoolCreateType
): Promise<AxiosResponse<ResponseType<PoolType>>> {
  return instance.post(`${NETWORK_LOAD_BALANCER_POOL_PREFIX}`, {
    pool: pool,
  });
}

// 풀 수정 api
export async function updatePool(
  poolId: string,
  poolUpdateType: PoolUpdateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(`${NETWORK_LOAD_BALANCER_POOL_PREFIX}/${poolId}`, {
    pool: poolUpdateType.pool,
  });
}

// 풀 삭제 api
export async function deletePool(
  poolDeleteType: PoolDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${NETWORK_LOAD_BALANCER_POOL_PREFIX}`, {
    data: poolDeleteType,
  });
}
