export interface FloatingIpListType {
  floatingIps: FloatingIpType[];
}

export interface FloatingIpType {
  id: string;
  description: string;
  fixedIpAddress: string;
  floatingNetworkId: string;
  floatingNetworkName: string;
  floatingIpAddress: string;
  projectId: string;
  status: string;
  portId: string;
  portDetails: PortDetailType;
  createdAt: string;
  projectName: string;
}

interface PortDetailType {
  adminStateUp: boolean;
  deviceId: string;
  deviceOwner: string;
  macAddress: string;
  name: string;
  projectId: string;
  status: string;
}
