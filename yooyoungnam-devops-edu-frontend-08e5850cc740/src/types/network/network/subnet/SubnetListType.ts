import {
  AllocationPoolType,
  HostRouteType,
} from '@/types/network/common/NetworkCommonType';

export interface SubnetListType {
  subnets: SubnetType[];
}

export interface SubnetType {
  id: string;
  name: string;
  cidr: string;
  description: string;
  tags: string[];
  enableDhcp: boolean;
  networkId: string;
  segmentId: string;
  projectId: string;
  projectName: string;
  tenantId: string;
  dnsNameservers: string[];
  dnsPublishFixedIp: boolean;
  allocationPools: AllocationPoolType[];
  hostRoutes: HostRouteType[];
  ipVersion: number;
  gatewayIp: string;
  createdAt: string;
  ipv6AddressMode: string;
  ipv6RaMode: string;
  revisionNumber: 0;
  serviceTypes: string[];
  subnetpoolId: string;
  updatedAt: string;
  networkIpAvailability: NetworkIpAvailabilityType;
}

interface NetworkIpAvailabilityType {
  networkName: string;
  projectId: string;
  totalIps: number;
  usedIps: number;
  subnetIpAvailability: SubnetIpAvailabilityType;
}

interface SubnetIpAvailabilityType {
  cidr: string;
  subnetId: string;
  subnetName: string;
  ipVersion: string;
  totalIps: number;
  usedIps: number;
}
