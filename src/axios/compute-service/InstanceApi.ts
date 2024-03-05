import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { InstanceType } from '@/types/compute/instance/InstanceListType';
import { InstanceCreateType } from '@/types/compute/instance/InstanceCreateType';
import { InstanceDeleteType } from '@/types/compute/instance/InstanceDeleteType';
import { InstanceDetailType } from '@/types/compute/instance/InstanceDetailType';
import { InstanceUpdateType } from '@/types/compute/instance/InstanceUpdateType';
import { InstanceActionType } from '@/types/compute/instance/InstanceActionType';
import { InstanceDetailMonitoringType } from '@/types/compute/instance/InstanceDetailMonitoringType';

// prefix
const COMPUTE_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/compute`;

// 인스턴스 목록 조회 api
export async function getInstanceList(
  page: number,
  pageSize: number,
  projectId?: string
): Promise<AxiosResponse<ResponseType<InstanceType[]>>> {
  return instance.get(`${COMPUTE_PREFIX}/servers`, {
    params: { size: pageSize, page: page, projectId: projectId },
  });
}

// 인스턴스 상세 조회 api
export async function getInstanceDetail(
  instanceId: string
): Promise<AxiosResponse<ResponseType<InstanceDetailType>>> {
  return instance.get(`${COMPUTE_PREFIX}/servers/${instanceId}`);
}

// 인스턴스 삭제 api
export async function deleteInstance(
  instanceIdList: InstanceDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${COMPUTE_PREFIX}/instances`, {
    data: instanceIdList,
  });
}

// 인스턴스 생성 api
export async function createInstance(
  instanceForm: InstanceCreateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.post(`${COMPUTE_PREFIX}/instances`, {
    server: instanceForm.server,
    projectId: instanceForm.projectId,
  });
}

// 인스턴스 수정 api
export async function updateInstance(
  serverId: string,
  instanceUpdateType: InstanceUpdateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(`${COMPUTE_PREFIX}/instances/${serverId}`, {
    server: instanceUpdateType.server,
    projectId: instanceUpdateType.projectId,
  });
}

// 인스턴스 상태 변경 api (-> 정지)
export async function stopInstance(
  serverId: string
): Promise<AxiosResponse<ResponseType>> {
  return instance.post(`${COMPUTE_PREFIX}/servers/${serverId}/action/stop`, {
    serverId: serverId,
  });
}

// 인스턴스 상태 변경 api (-> 시작)
export async function startInstance(
  serverId: string
): Promise<AxiosResponse<ResponseType>> {
  return instance.post(`${COMPUTE_PREFIX}/servers/${serverId}/action/start`, {
    serverId: serverId,
  });
}

// 인스턴스 상태 변경 api (-> 소프트 리부트)
export async function softRebootInstance(
  serverId: string
): Promise<AxiosResponse<ResponseType>> {
  return instance.post(
    `${COMPUTE_PREFIX}/servers/${serverId}/action/reboot/soft`,
    {
      serverId: serverId,
    }
  );
}

// 인스턴스 상태 변경 api (-> 하드 리부트)
export async function hardRebootInstance(
  serverId: string
): Promise<AxiosResponse<ResponseType>> {
  return instance.post(
    `${COMPUTE_PREFIX}/servers/${serverId}/action/reboot/hard`,
    {
      serverId: serverId,
    }
  );
}

// 인스턴스 작업 이력 조회 api
export async function getInstanceActionList(
  page: number,
  pageSize: number,
  serverId: string
): Promise<AxiosResponse<ResponseType<InstanceActionType[]>>> {
  return instance.get(
    `${COMPUTE_PREFIX}/servers/${serverId}/os-instance-actions`,
    {
      params: { size: pageSize, page: page },
    }
  );
}

// 인스턴스 모니터링 조회
export async function getInstanceMonitoring(
  serverId: string,
  providerId: string
): Promise<AxiosResponse<ResponseType<InstanceDetailMonitoringType>>> {
  return instance.get(`${COMPUTE_PREFIX}/servers/${serverId}/monitor`, {
    params: { providerId: providerId },
  });
}
