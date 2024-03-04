export interface VolumeSnapshotListType {
  volumeSnapshots: VolumeSnapshotType[];
}

export interface VolumeSnapshotType {
  id: string;
  name: string;
  description: string;
  volumeId: string;
  status: string;
  size: number;
  projectId: string;
  projectName: string;
  progress: string;
  volumeType: string;
  createdAt: string;
  updatedAt: string;
  metadata: object;
}
