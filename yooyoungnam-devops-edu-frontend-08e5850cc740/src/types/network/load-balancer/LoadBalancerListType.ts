import { ListenerType } from '@/types/network/load-balancer/listener/ListenerListType';
import { PoolType } from '@/types/network/load-balancer/pool/PoolListType';

export interface LoadBalancerListType {
  loadbalancers: LoadBalancerType[];
}

export interface LoadBalancerType {
  description: string;
  listeners: ListenerType[];
  id: string;
  name: string;
  pools: PoolType[];
  projectName: string;
  provider: string;
  tags: string[];
  additionalVips: AdditionalVipType[];
  adminStateUp: boolean;
  availabilityZone: string;
  flavorId: string;
  operatingStatus: string;
  projectId: string;
  provisioningStatus: string;
  vipAddress: string;
  vipNetworkId: string;
  vipPortId: string;
  vipQosPolicyId: string;
  vipSubnetId: string;
  createdAt: string;
  updatedAt: string;
}

interface AdditionalVipType {
  subnetId: string;
  ipAddress: string;
}
