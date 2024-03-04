import { ProjectType } from '@/types/identity/project/ProjectListType';

export interface ProviderListType {
  providers: ProviderType[];
}

// 일반 response 와 다르게 tree table 구조에 맞춰 children 으로 명명
export interface ProviderType {
  id: string;
  name: string;
  isProvider: boolean;
  children: ProjectType[];
}
