import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { UserType } from '@/types/identity/user/UserListType';

// prefix
const IDENTITY_USER_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/identity/users`;

// 사용자 목록 조회 api
export async function getUserList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<UserType[]>>> {
  return instance.get(`${IDENTITY_USER_PREFIX}`, {
    params: { size: pageSize, page: page },
  });
}

// 사용자 상세 조회 api

// 사용자 할당 api자

// 사용자 수정 api

// 사용자 해제 api
