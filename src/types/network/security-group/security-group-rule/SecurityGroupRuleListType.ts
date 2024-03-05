export interface SecurityGroupRuleListType {
  securityGroupRules: SecurityGroupRuleType[];
}

export interface SecurityGroupRuleType {
  id: string;
  description: string;
  direction: string;
  ethertype: string;
  normalizedCidr: string;
  portRangeMax: string;
  portRangeMin: string;
  projectId: string;
  protocol: string;
  remoteAddressGroupId: string;
  remoteGroupId: string;
  remoteIpPrefix: string;
  revisionNumber: number;
  securityGroupId: string;
  standardAttrId: number;
  tags: object;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}
