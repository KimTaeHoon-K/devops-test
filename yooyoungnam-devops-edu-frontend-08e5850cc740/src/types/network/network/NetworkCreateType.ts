export interface NetworkCreateType {
  name: string;
  description: string;
  projectId: string | undefined;
  providerNetworkType: string | undefined;
  providerPhysicalNetwork: string | undefined;
  // providerSegmentationId: number | undefined;
  shared: boolean;
  routerExternal: boolean;
  portSecurityEnabled: boolean;
  mtu: number | undefined;
  availabilityZoneHints: string[];
}
