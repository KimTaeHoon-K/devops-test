import { FixedIpType } from '@/types/network/common/NetworkCommonType';

export interface PortCreateType {
  name: string;
  description: string;
  bindingVnicType: string;
  macAddress: string | undefined;
  portSecurityEnabled: boolean;
  securityGroups: string[];
  networkId: string | undefined;
  projectId: string | undefined;
  fixedIps?: FixedIpType[];
}
