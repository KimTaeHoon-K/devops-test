export interface SecurityGroupRuleCreateType {
  ethertype: string | undefined;
  direction: string | undefined;
  protocol: string | undefined;
  description: string;
  tenantId: string;
  securityGroupId: string | undefined;
  portRangeMin: number | undefined;
  portRangeMax: number | undefined;
  remoteIpPrefix: string | undefined;
  remoteAddressGroupId: string;
  normalizedCidr: string;
  remoteGroupId: string;
  projectId: string;
}
