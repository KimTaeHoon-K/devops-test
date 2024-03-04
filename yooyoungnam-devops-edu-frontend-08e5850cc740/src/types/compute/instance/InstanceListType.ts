export interface InstanceListType {
  servers: InstanceType[];
}

export interface InstanceType {
  id: string;
  name: string;
  tenantId: string;
  description: string;
  osExtStsPowerState: number;
  osExtStsTaskState?: string;
  status: string;
  hostId: string;
  image: string;
  created: string;
  updated: string;
  network: {
    addresses: InstanceNetworkType[];
  };
  flavor: {
    vcpus: number;
    ram: number;
    disk: number;
    ephemeral: number;
    swap: number;
    originalName: string;
  };
  locked: boolean;
}

export interface InstanceNetworkType {
  networkName: string;
  addr: string;
  serverId: string;
  ipsType: string;
  portId: string;
  portName: string;
  macAddress: string;
}
