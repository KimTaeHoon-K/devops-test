import { FixedIpType } from '@/types/network/common/NetworkCommonType';

export interface PortType {
  description: string;
  hints: object;
  id: string;
  name: string;
  status: string;
  tags: string[];
  adminStateUp: boolean;
  allowedAddressPairs: AllowedAddressPairType[];
  bindingHostId: string;
  bindingProfile: object;
  bindingVifDetails: object;
  bindingVifType: string;
  bindingVnicType: string;
  createdAt: string;
  dataPlaneStatus: string;
  deviceId: string;
  deviceOwner: string;
  dnsAssignment: object;
  dnsDomain: string;
  dnsName: string;
  extraDhcpOpts: ExtraDhcpOptType[];
  fixedIps: FixedIpType[];
  ipAllocation: string;
  macAddress: string;
  networkId: string;
  numaAffinityPolicy: string;
  portSecurityEnabled: boolean;
  projectId: string;
  qosNetworkPolicyId: string;
  qosPolicyId: string;
  revisionNumber: number;
  resourceRequest: object;
  securityGroups: string[];
  tenantId: string;
  updatedAt: string;
  propagateUplinkStatus: boolean;
  macLearningEnabled: boolean;
  floatingIpAttachable: boolean;
  floatingIpAttachableReason: string;
}

interface AllowedAddressPairType {
  ipAddress: string;
  macAddress: string;
}

interface ExtraDhcpOptType {
  optValue: string;
  optName: string;
}
