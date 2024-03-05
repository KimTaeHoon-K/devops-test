export interface FloatingIpCreateType {
  tenantId: string | undefined;
  description: string;
  floatingNetworkId: string;
  subnetId: string | undefined;
  floatingIpAddress: string | undefined;
}
