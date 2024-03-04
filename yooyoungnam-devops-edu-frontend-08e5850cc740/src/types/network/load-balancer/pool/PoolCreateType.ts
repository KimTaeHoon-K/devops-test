export interface PoolCreateType {
  name: string;
  description: string;
  protocol?: string;
  members: PoolMemberCreateType[];
  lbAlgorithm: string;
  adminStateUp: boolean;
  sessionPersistence?: {
    type: string;
  };
  loadbalancerId: string;
  listenerId: string;
  tlsEnabled: boolean;
  tlsCiphers: string;
}

export interface PoolMemberCreateType {
  address: string;
  weight: number;
  protocolPort: number;
}
