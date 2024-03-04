import {
  AllocationPoolType,
  HostRouteType,
} from '@/types/network/common/NetworkCommonType';

export interface SubnetUpdateType {
  subnet: SubnetUpdateFormType;
}

export interface SubnetUpdateFormType {
  id: string;
  name: string;
  description: string;
  enableDhcp: boolean;
  dnsNameservers: string[];
  allocationPools: AllocationPoolType[];
  hostRoutes: HostRouteType[];
  ipVersion: number;
  gatewayIp: string | undefined;
}
