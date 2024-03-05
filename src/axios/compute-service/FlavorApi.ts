import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { FlavorType } from '@/types/compute/flavor/FlavorListType';
import { FlavorCreateType } from '@/types/compute/flavor/FlavorCreateType';
import { FlavorUpdateType } from '@/types/compute/flavor/FlavorUpdateType';
import { FlavorDeleteType } from '@/types/compute/flavor/FlavorDeleteType';

// prefix
const COMPUTE_FLAVOR_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/compute/flavors`;

// 인스턴스 유형 목록 조회 api
export async function getFlavorList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<FlavorType[]>>> {
  return instance.get(`${COMPUTE_FLAVOR_PREFIX}`, {
    params: { size: pageSize, page: page },
  });
}

// 인스턴스 유형 상세 조회 api
export async function getFlavorDetail(
  flavorId: string
): Promise<AxiosResponse<ResponseType<FlavorType>>> {
  return instance.get(`${COMPUTE_FLAVOR_PREFIX}/${flavorId}`);
}

// 인스턴스 유형 생성 api
export async function createFlavor(
  flavor: FlavorCreateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.post(`${COMPUTE_FLAVOR_PREFIX}`, {
    flavor: flavor,
  });
}

// 인스턴스 유형 수정 api
export async function updateFlavor(
  flavorId: string,
  flavorUpdateType: FlavorUpdateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(`${COMPUTE_FLAVOR_PREFIX}/${flavorId}`, {
    flavor: flavorUpdateType.flavor,
  });
}

// 인스턴스 유형 삭제 api
export async function deleteFlavor(
  flavorDeleteType: FlavorDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${COMPUTE_FLAVOR_PREFIX}`, {
    data: flavorDeleteType,
  });
}
