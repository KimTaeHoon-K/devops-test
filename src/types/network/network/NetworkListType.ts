export interface NetworkListType {
  networks: NetworkType[];
}

export interface NetworkType {
  id: string;
  mtu: number;
  name: string;
  projectId: string;
  routerExternal: boolean;
  shared: boolean;
  subnets: string[];
  status: string;
  description: string;
  tags: string[];
  projectName: string;
  adminStateUp: boolean;
  availabilityZoneHints: string[];
  availabilityZones: string[];
  createdAt: string;
  dnsDomain: string;
  ipv4AddressScope: string;
  ipv6AddressScope: string;
  l2Adjacency: boolean;
  portSecurityEnabled: boolean;
  providerNetworkType: string;
  providerPhysicalNetwork: string;
  providerSegmentationId: number;
  qosPolicyId: string;
  revisionNumber: number;
  tenantId: string;
  updatedAt: string;
  isDefault: boolean;
  vlanTransparent: boolean;
}

export interface NetworkFilterType {
  routerExternal: boolean;
  shared: boolean;
}
