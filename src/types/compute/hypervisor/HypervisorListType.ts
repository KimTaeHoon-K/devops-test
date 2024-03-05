export interface HypervisorListType {
  hypervisors: HypervisorType[];
}

export interface HypervisorType {
  hypervisorId: number;
  hypervisorHostName: string;
  hypervisorType: string;
  vcpus: number;
  vcpusUsed: number;
  memoryMb: number;
  memoryMbUsed: number;
  runningVms: number;
}
