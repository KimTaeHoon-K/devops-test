import {
  ExternalGateWayInfoType,
  HostRouteType,
} from '@/types/network/common/NetworkCommonType';

export interface RouterListType {
  routers: RouterType[];
}

export interface RouterType {
  id: string;
  name: string;
  description: string;
  projectId: string | undefined;
  projectName: string;
  status: string;
  routes: HostRouteType[];
  distributed: boolean;
  ha: boolean;
  tags: string[];
  tenantId: string;
  adminStateUp: boolean;
  externalGatewayInfo?: ExternalGateWayInfoType;
  revisionNumber: 0;
  availabilityZoneHints: string[];
  availabilityZones: string[];
  flavorId: string;
  createdAt: string;
  updatedAt: string;
}
