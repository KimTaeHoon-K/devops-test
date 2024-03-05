export interface PoolListType {
  listeners: PoolType[];
}
export interface PoolType {
  id: string;
  adminStateUp: boolean;
  alpnProtocols: string;
  createdAt: string;
  description: string;
  healthMonitorId: string;
  lbAlgorithm: string;
  listeners: string;
  loadbalancers: string;
  members: string;
  name: string;
  operatingStatus: string;
  projectId: string;
  protocol: string;
  provisioningStatus: string;
  sessionPersistence: string;
  tags: string;
  tlsEnabled: string;
  tlsVersions: string;
  updatedAt: string;
}
