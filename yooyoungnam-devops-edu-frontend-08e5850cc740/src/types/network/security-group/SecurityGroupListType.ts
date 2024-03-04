export interface SecurityGroupListType {
  securityGroups: SecurityGroupType[];
}

export interface SecurityGroupType {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  createdAt: string;
}

// 인스턴스 상세 보안그룹 리스트
export interface InstanceDetailSecurityGroupListType {
  securityGroupRules: InstanceDetailSecurityGroupType[];
}

export interface InstanceDetailSecurityGroupType {
  id: string;
  direction: string;
  protocol: string | null;
  description: string | null;
  tenantId: string;
  securityGroupId: string;
  ethertype: string;
  portRangeMin: string | null;
  portRangeMax: string | null;
  remoteIpPrefix: string;
  remoteGroupId: string;
}
