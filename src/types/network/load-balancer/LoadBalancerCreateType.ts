import { AllocationPoolType } from '@/types/network/common/NetworkCommonType';

export interface LoadBalancerCreateType {
  name: string;
  description: string;
  projectId: string;
  adminStateUp: boolean;
  vipNetworkId: string;
  vipSubnetId: string;
  vipAddress?: string;
  listeners: LBListenerCreateType[];
}

export interface LBListenerCreateType {
  name: string;
  description: string;
  protocol: string;
  adminStateUp: boolean;
  protocolPort: number;
  connectionLimit: number;
  timeoutClientData: number;
  timeoutTcpInspect: number;
  timeoutMemberConnect: number;
  timeoutMemberData: number;
  allowedCidrs?: string[];
  insertHeaders: any;
  defaultPool: LBPoolCreateType;
}

export interface LBPoolCreateType {
  name: string;
  description: string;
  lbAlgorithm: string;
  protocol: string;
  sessionPersistence?: {
    type: string;
  };
  tlsEnabled: boolean;
  adminStateUp: boolean;
  members: LBPoolMemberCreateType[];
  healthMonitor: LBHealthCheckCreateType;
}

export interface LBPoolMemberCreateType {
  address: string;
  protocolPort: number;
  weight: number;
}

export interface LBHealthCheckCreateType {
  name: string;
  type: string;
  maxRetries: number;
  maxRetriesDown: number;
  delay: number;
  timeout: number;
}

//
export interface LoadBalancerInfoType {
  name: string;
  description: string;
  projectId?: string;
  projectName: string;
  adminStateUp: boolean;
  networkId?: string;
  networkName: string;
  subnetId?: string;
  subnetName: string;
  allocationPools?: AllocationPoolType[];
  address?: string;
}

export interface ListenerInfoType {
  name: string;
  description: string;
  protocol: string;
  adminStateUp: boolean;
  protocolPort?: number;
  connectionLimit: number;
  timeoutClientData: number;
  timeoutTcpInspect: number;
  timeoutMemberConnect: number;
  timeoutMemberData: number;
  allowedCidrs: string;
  insertHeaders: any;
}

export interface PoolInfoType {
  name: string;
  description: string;
  protocol: string;
  algorithm: string;
  sessionPersistence?: string;
  tls: boolean;
  adminStateUp: boolean;
}

export interface PoolMemberInfoType {
  name: string;
  fixedIp: string;
  port: number;
  weight: number;
}

export interface HealthCheckInfoType {
  name: string;
  type: string;
  adminStateUp: boolean;
  maxRetries: number;
  maxRetriesDown: number;
  delay: number;
  timeout: number;
}

export interface LoadBalancerReviewInfoType {
  // step 1 : 로드밸런서
  loadBalancerName: string;
  loadBalancerDescription: string;
  projectName: string;
  projectId: string;
  subnetName: string;
  allocationPools?: AllocationPoolType[];
  address?: string;
  // step 2 : 리스너
  listenerName: string;
  listenerProtocol: string;
  protocolPort: number;
  connectionLimit: number; // 연결 제한
  // step 3 : 풀
  poolName: string;
  algorithm: string;
  sessionPersistence?: string;
  // step 4 : 풀 멤버
  poolMembers: LoadBalancerReviewInfoPoolMemberType[];
  // step 5 : 헬스 체크
  healthCheckName: string;
  healthCheckType: string;
  maxRetries: number;
  maxRetriesDown: number;
  delay: number;
  timeout: number;
}
export interface LoadBalancerReviewInfoPoolMemberType {
  portName: string;
  fixedIp: string;
  port: number;
  weight: number; // 가중치
}
