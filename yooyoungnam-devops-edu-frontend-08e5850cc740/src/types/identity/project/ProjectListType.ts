export interface ProjectListType {
  projects: ProjectType[];
}

export interface ProjectType {
  id: string;
  name: string;
  domain?: boolean;
  isDomain?: boolean;
  description?: string;
  domainId?: string;
  enabled?: boolean;
  parentId?: string;
  tags?: object;
}
