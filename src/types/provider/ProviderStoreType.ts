import { ProjectType } from '@/types/identity/project/ProjectListType';

export interface ProviderStoreType {
  id: string;
  name: string;
  isProvider: boolean;
  // endPoint: string;
  children: ProjectType[];
}
