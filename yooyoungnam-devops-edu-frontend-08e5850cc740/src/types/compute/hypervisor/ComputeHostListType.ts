export interface ComputeHostListType {
  hypervisors: ComputeHostType[];
}

export interface ComputeHostType {
  hypervisorHostName: string;
  state: string;
  status: string;
  service: object;
  hypervisorId: number;
}
