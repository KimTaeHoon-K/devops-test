import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { HypervisorType } from '@/types/compute/hypervisor/HypervisorListType';
import { ComputeHostType } from '@/types/compute/hypervisor/ComputeHostListType';

// prefix
const COMPUTE_HYPERVISOR_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/compute/hypervisors`;

// 하이퍼바이저 목록 조회 api
export async function getHypervisorList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<HypervisorType[]>>> {
  return instance.get(`${COMPUTE_HYPERVISOR_PREFIX}`, {
    params: { size: pageSize, page: page },
  });
}

// 하이퍼바이저 삭제 api
export async function deleteComputeHypervisor(
  hypervisorIdList: string[]
): Promise<AxiosResponse<ResponseType>> {
  return instance.post(`${COMPUTE_HYPERVISOR_PREFIX}/delete`, {
    hypervisorIdList: hypervisorIdList,
  });
}

// 컴퓨트 호스트 목록 조회 api
export async function getComputeHostList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<ComputeHostType[]>>> {
  return instance.get(`${COMPUTE_HYPERVISOR_PREFIX}/compute-hosts`, {
    params: { size: pageSize, page: page },
  });
}
