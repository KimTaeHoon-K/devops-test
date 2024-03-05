import { InstanceType } from '@/types/compute/instance/InstanceListType';

export interface InstanceUpdateType {
  server: InstanceType | InstanceUpdateFormType;
  projectId: string;
}

export interface InstanceUpdateFormType {
  id: string;
  name: string;
  description: string;
}
