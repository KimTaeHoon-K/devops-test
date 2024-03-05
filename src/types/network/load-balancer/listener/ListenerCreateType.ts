export interface ListenerCreateType {
  loadbalancerId: string;
  name: string;
  description: string;
  protocol: string;
  adminStateUp: boolean;
  protocolPort: number | undefined;
  connectionLimit: number;
  timeoutClientData: number;
  timeoutTcpInspect: number;
  timeoutMemberConnect: number;
  timeoutMemberData: number;
  allowedCidrs?: string[];
  insertHeaders: any;
}
