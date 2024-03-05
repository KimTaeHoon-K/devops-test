import { ExternalGateWayInfoType } from '@/types/network/common/NetworkCommonType';

export interface RouterCreateType {
  name: string;
  description: string;
  projectId: string | undefined;
  routerExternal: boolean;
  externalGatewayInfo?: ExternalGateWayInfoType;
  availabilityZoneHints: string[];
}
