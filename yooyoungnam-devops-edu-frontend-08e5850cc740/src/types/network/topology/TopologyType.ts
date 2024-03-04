import {
  ExternalGateWayInfoType,
  FixedIpType, HostRouteType,
} from '@/types/network/common/NetworkCommonType';

export interface TopologyType {
  servers: TopologyServerType[];
  networks: TopologyNetworkType[];
  ports: TopologyPortType[];
  routers: TopologyRouterType[];
}

interface TopologyServerType {
  name: string;
  status: string;
  originalStatus: string;
  task: string;
  id: string;
}

interface TopologyNetworkType {
  name: string;
  id: string;
  subnets: TopologyNetworkSubnetType[];
  status: string;
  originalStatus: string;
  routerExternal: boolean;
  providerNetworkType: string;
}
interface TopologyNetworkSubnetType {
  id: string;
  name: string;
  gatewayIp: string;
  cidr: string;
  status: string;
}

interface TopologyPortType {
  id: string;
  networkId: string;
  deviceId: string;
  fixedIps: FixedIpType[];
  deviceOwner: string;
  status: string;
  originalStatus: string;
}

interface TopologyRouterType {
  id: string;
  name: string;
  status: string;
  originalStatus: string;
  externalGatewayInfo: ExternalGateWayInfoType;
  routes: HostRouteType[];
}
