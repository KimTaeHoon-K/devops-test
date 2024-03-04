export interface AllocationPoolType {
  start: string;
  end: string;
}

export interface HostRouteType {
  id?: string;
  destination: string; // cidr
  nexthop: string;
}

export interface ExternalGateWayInfoType {
  enableSnat: boolean;
  externalFixedIps: FixedIpType[];
  networkId: string | undefined;
  networkName?: string;
}
export interface FixedIpType {
  ipAddress: string;
  subnetId: string;
}
