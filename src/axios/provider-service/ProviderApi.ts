import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { ProviderListType } from '@/types/provider/ProviderListType';

// prefix
const PROVIDER_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/provider/projects`;

// 공급자 목록 조회 api
export async function getProviderList(): Promise<
  AxiosResponse<ResponseType<ProviderListType[]>>
> {
  return instance.get(`${PROVIDER_PREFIX}`);
}
