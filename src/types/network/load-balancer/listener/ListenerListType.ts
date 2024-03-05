export interface ListenerListType {
  listeners: ListenerType[];
}
export interface ListenerType {
  id: string;
  name: string;
  description: string;
  protocol: string;
  l7policies: object;
  loadBalancers: [
    {
      id: string;
    }
  ];
  tags: string[];
  provisioningStatus: string;
  operatingStatus: string;
  adminStateUp: boolean;
  protocolPort: number;
  connectionLimit: number;
  defaultTlsContainerRef: string;
  sniContainerRefs: object;
  projectId: string;
  defaultPoolId: string;
  insertHeaders: object;
  createdAt: string;
  updatedAt: string;
  timeoutClientData: number;
  timeoutMemberConnect: number;
  timeoutMemberData: number;
  timeoutTcpInspect: number;
  clientCaTlsContainerRef: object;
  clientAuthentication: object;
  clientCrlContainerRef: object;
  allowedCidrs: string;
  tlsCiphers: object;
  tlsVersions: object;
  alpnProtocols: object;
  tenantId: string;
}
