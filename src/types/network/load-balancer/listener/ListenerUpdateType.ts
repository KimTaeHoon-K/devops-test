export interface ListenerUpdateType {
  listener: ListenerUpdateFormType;
}

export interface ListenerUpdateFormType {
  id: string;
  name: string;
  description: string;
  protocol: string;
  adminStateUp: boolean;
  protocolPort: number;
  connectionLimit: number;
  timeoutClientData: number;
  timeoutTcpInspect: number;
  timeoutMemberConnect: number;
  timeoutMemberData: number;
  allowedCidrs?: string[];
  insertHeaders?: object;
}
