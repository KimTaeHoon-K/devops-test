import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { HostAggregatesType } from '@/types/compute/host-aggregates/HostAggregatesListType';
import { AvailabilityZoneType } from '@/types/compute/host-aggregates/AvailabilityZoneListType';

// prefix
const COMPUTE_HOST_AGGREGATES_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/compute/hosts`;
const COMPUTE_AVAILABILITY_ZONE_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/compute/availability-zones`;

// 호스트 집합 목록 조회 api
export async function getHostAggregatesList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<HostAggregatesType[]>>> {
  return instance.get(`${COMPUTE_HOST_AGGREGATES_PREFIX}`, {
    params: { size: pageSize, page: page },
  });
}

// 호스트 집합 삭제 api
export async function deleteHostAggregates(
  hostAggregatesList: string | string[] | undefined
): Promise<AxiosResponse<ResponseType>> {
  return instance.post(`${COMPUTE_HOST_AGGREGATES_PREFIX}/delete`, {
    hostAggregatesList: hostAggregatesList,
  });
}

// 가용존 목록 조회 api
export async function getAvailabilityZoneList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<AvailabilityZoneType[]>>> {
  return instance.get(`${COMPUTE_AVAILABILITY_ZONE_PREFIX}`, {
    params: { size: pageSize, page: page },
  });
}

// 가용존 목록 조회 api
export async function getAvailabilityZoneSummaryList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<AvailabilityZoneType[]>>> {
  return instance.get(`${COMPUTE_AVAILABILITY_ZONE_PREFIX}/summary`, {
    params: { size: pageSize, page: page },
  });
}
