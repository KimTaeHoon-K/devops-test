export interface InstanceActionType {
  servers: InstanceActionType[];
}

export interface InstanceActionType {
  action: string;
  instanceUuid: string;
  requestId: string;
  userId: string;
  projectId: string;
  startTime: number;
  updatedAt: number;
}
