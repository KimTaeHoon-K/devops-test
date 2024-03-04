import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import {
  InfraResourceCurrentType,
  ProjectQuotaUsageType,
  ProviderResourceUsageGraphType,
  ResourceUsageListType,
  ServiceStatusType,
  WorkspaceConnectionInfoType,
} from '@/types/dashboard/DashboardType';

// prefix
const DASHBOARD_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/dashboard`;

// 공급자 워크스페이스 연동 정보 조회 api
export async function getWorkspaceConnectionInfoList(
  providerId: string
): Promise<AxiosResponse<ResponseType<WorkspaceConnectionInfoType>>> {
  return instance.get(
    `${DASHBOARD_PREFIX}/connected-project-list/provider/${providerId}`
  );
}

// 자원 사용량
export async function getProviderStatistic(
  providerId: string
): Promise<AxiosResponse<ResponseType<ResourceUsageListType>>> {
  return instance.get(`${DASHBOARD_PREFIX}/provider-statistics`, {
    params: { providerId: providerId },
  });
}

// 인프라 자원 현황 조회 api
export async function getInfraStatistic(): Promise<
  AxiosResponse<ResponseType<InfraResourceCurrentType>>
> {
  return instance.get(`${DASHBOARD_PREFIX}/infra-statistics`);
}

// 서비스 현황 조회 api
export async function getServiceStatusList(
  providerId: string
): Promise<AxiosResponse<ResponseType<ServiceStatusType[]>>> {
  return instance.get(`${DASHBOARD_PREFIX}/prometheus/service-status`, {
    params: { providerId: providerId },
  });
}

// 공급자 자원별 사용량 차트 조회 api
export async function getProviderResourceUsage(
  providerId: string
): Promise<AxiosResponse<ResponseType<ProviderResourceUsageGraphType>>> {
  return instance.get(
    `${DASHBOARD_PREFIX}/prometheus/provider-resource-usage-graph`,
    {
      params: { providerId: providerId },
    }
  );
}

// 프로젝트별 쿼터 사용량
export async function getProjectQuotaUsageList(
  providerId: string
): Promise<AxiosResponse<ResponseType<ProjectQuotaUsageType[]>>> {
  return instance.get(`${DASHBOARD_PREFIX}/projects-quota`, {
    params: { providerId: providerId },
  });
}
