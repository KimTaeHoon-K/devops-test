import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { ProjectType } from '@/types/identity/project/ProjectListType';
import { ProjectCreateType } from '@/types/identity/project/ProjectCreateType';
import { ProjectDeleteType } from '@/types/identity/project/ProjectDeleteType';

// prefix
const IDENTITY_PROJECT_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/identity/projects`;

// 프로젝트 목록 조회 api
export async function getProjectList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<ProjectType[]>>> {
  return instance.get(`${IDENTITY_PROJECT_PREFIX}`, {
    params: { size: pageSize, page: page },
  });
}

// 프로젝트 상세 조회 api

// 프로젝트 생성 api
export async function createProject(
  providerId: string,
  project: ProjectCreateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.post(
    `${IDENTITY_PROJECT_PREFIX}`,
    {
      project: project,
    },
    { params: { providerId: providerId } }
  );
}
// 프로젝트 수정 api

// 프로젝트 삭제 api
export async function deleteProject(
  projectDeleteType: ProjectDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${IDENTITY_PROJECT_PREFIX}`, {
    data: projectDeleteType,
  });
}
