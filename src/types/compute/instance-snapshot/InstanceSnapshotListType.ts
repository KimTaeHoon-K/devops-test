export interface InstanceSnapshotListType {
  snapshots: InstanceSnapshotType[];
}

export interface InstanceSnapshotType {
  id: string;
  name: string;
  owner: string;
  projectId: string;
  ownerProjectName: string;
  instanceUuid: string;
  instanceName: string;
  visibility: string;
  diskFormat: string;
  containerFormat: string;
  protected: boolean;
  minDisk: number;
  minRam: number;
  virtualSize: number;
  size: number;
  status: string;
  osHidden: boolean;
  osHashAlgo: string;
  osHashValue: string;
  tags: object;
  self: string;
  file: string;
  schema: string;
  createdAt: string;
  updatedAt: string;
}
