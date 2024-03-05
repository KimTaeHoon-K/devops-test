import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { RouterType } from '@/types/network/router/RouterListType';
import { RouterDeleteType } from '@/types/network/router/RouterDeleteType';
import { RouterUpdateType } from '@/types/network/router/RouterUpdateType';
import { RouterCreateType } from '@/types/network/router/RouterCreateType';

// prefix
const NETWORK_ROUTER_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/network/routers`;

// 라우터 목록 조회 api
export async function getRouterList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<RouterType[]>>> {
  return instance.get(`${NETWORK_ROUTER_PREFIX}`, {
    params: { size: pageSize, page: page },
  });
}

// 라우터 상세 조회 api
export async function getRouterDetail(
  routerId: string
): Promise<AxiosResponse<ResponseType<RouterType>>> {
  return instance.get(`${NETWORK_ROUTER_PREFIX}/${routerId}`);
}

// 라우터 생성 api
export async function createRouter(
  router: RouterCreateType
): Promise<AxiosResponse<ResponseType<RouterType>>> {
  return instance.post(`${NETWORK_ROUTER_PREFIX}`, {
    router: router,
  });
}

// 라우터 수정 api
export async function updateRouter(
  routerId: string,
  routerUpdateType: RouterUpdateType
): Promise<AxiosResponse<ResponseType<RouterType>>> {
  return instance.put(`${NETWORK_ROUTER_PREFIX}/${routerId}`, {
    router: routerUpdateType.router,
  });
}

// 라우터 삭제 api
export async function deleteRouter(
  routerDeleteType: RouterDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${NETWORK_ROUTER_PREFIX}`, {
    data: routerDeleteType,
  });
}

// 라우터 서브넷 추가 api
export async function addRouterInterface(
  routerId: string,
  subnetId: string
): Promise<AxiosResponse<ResponseType<RouterType>>> {
  return instance.put(
    `${NETWORK_ROUTER_PREFIX}/${routerId}/add-router-interface`,
    {
      subnetId: subnetId,
    }
  );
}

// 라우터 서브넷 제거 api
export async function removeRouterInterface(
  routerId: string,
  subnetId: string
): Promise<AxiosResponse<ResponseType<RouterType>>> {
  return instance.put(
    `${NETWORK_ROUTER_PREFIX}/${routerId}/remove-router-interface`,
    {
      subnetId: subnetId,
    }
  );
}

// 라우터 정적 경로 생성 api
export async function createRouterStaticRoute(
  routerId: string,
  routerUpdateType: RouterUpdateType
): Promise<AxiosResponse<ResponseType<RouterType>>> {
  return instance.put(`${NETWORK_ROUTER_PREFIX}/${routerId}/add-extraroutes`, {
    router: routerUpdateType.router,
  });
}

// 라우터 정적 경로 삭제 api
export async function deleteRouterStaticRoute(
  routerId: string,
  routerUpdateType: RouterUpdateType
): Promise<AxiosResponse<ResponseType<RouterType>>> {
  return instance.put(
    `${NETWORK_ROUTER_PREFIX}/${routerId}/remove-extraroutes`,
    {
      router: routerUpdateType.router,
    }
  );
}
