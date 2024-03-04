export interface FloatingIpAssociateType {
  floatingNetworkId: string;
  floatingIpAddress: string | undefined;
  instanceId: string;
  portId: string;
  fixedIpAddress: string;
}
