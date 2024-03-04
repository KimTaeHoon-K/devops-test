import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { ListenerDeleteType } from '@/types/network/load-balancer/listener/ListenerDeleteType';
import { ListenerUpdateType } from '@/types/network/load-balancer/listener/ListenerUpdateType';
import { ListenerCreateType } from '@/types/network/load-balancer/listener/ListenerCreateType';
import { ListenerType } from '@/types/network/load-balancer/listener/ListenerListType';

// prefix
const NETWORK_LOAD_BALANCER_LISTENER_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/load-balancer/listeners`;

// 리스너 목록 조회 api
export async function getListenerList(
  page: number,
  pageSize: number,
  loadbalancerId: string
): Promise<AxiosResponse<ResponseType<ListenerType[]>>> {
  return instance.get(`${NETWORK_LOAD_BALANCER_LISTENER_PREFIX}`, {
    params: {
      size: pageSize,
      page: page,
      loadbalancerId: loadbalancerId,
    },
  });
}

// 리스너 상세 조회 api
export async function getListenerDetail(
  listenerId: string
): Promise<AxiosResponse<ResponseType<ListenerType>>> {
  return instance.get(`${NETWORK_LOAD_BALANCER_LISTENER_PREFIX}/${listenerId}`);
}

// 리스너 생성 api
export async function createListener(
  listener: ListenerCreateType
): Promise<AxiosResponse<ResponseType<ListenerType>>> {
  return instance.post(`${NETWORK_LOAD_BALANCER_LISTENER_PREFIX}`, {
    listener: listener,
  });
}

// 리스너 수정 api
export async function updateListener(
  listenerId: string,
  listenerUpdateType: ListenerUpdateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(
    `${NETWORK_LOAD_BALANCER_LISTENER_PREFIX}/${listenerId}`,
    {
      listener: listenerUpdateType.listener,
    }
  );
}

// 리스너 삭제 api
export async function deleteListener(
  listenerDeleteType: ListenerDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${NETWORK_LOAD_BALANCER_LISTENER_PREFIX}`, {
    data: listenerDeleteType,
  });
}
