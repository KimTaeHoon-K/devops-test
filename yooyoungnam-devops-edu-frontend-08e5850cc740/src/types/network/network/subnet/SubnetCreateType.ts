import {
  AllocationPoolType,
  HostRouteType,
} from '@/types/network/common/NetworkCommonType';

export interface SubnetCreateType {
  name: string;
  description: string;
  networkId: string;
  projectId: string | undefined;
  ipVersion: number;
  cidr: string;
  gatewayIp: string | undefined;
  enableDhcp: boolean;
  allocationPools: AllocationPoolType[];
  dnsNameservers: string[];
  hostRoutes: HostRouteType[];
}
