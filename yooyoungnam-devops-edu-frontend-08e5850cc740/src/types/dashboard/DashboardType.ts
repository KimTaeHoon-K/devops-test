export interface ResourceUsageListType {
  resources: ResourceUsageType;
}
export interface ResourceUsageType {
  cpu: UsageType;
  ram: UsageType;
  disk: UsageType;
}
export interface UsageType {
  total: number;
  used: number;
  available: number;
}

// 서비스 현황
export interface ServiceStatusType {
  serviceName: string;
  up: number;
  down: number;
}

// 공급자/프로젝트-워크스페이스
export interface WorkspaceConnectionInfoType {
  providerId: string;
  providerName: string;
  totalProject: number;
  connectedCount: number;
  unconnectedCount: number;
  projectList: ProjectType[];
}
interface ProjectType {
  projectId: string;
  projectName: string;
  workspaceId: string;
  workspaceName: string;
}

// 인프라 자원 현황
export interface InfraResourceCurrentType {
  instanceStatistics: InfraResourceType<InfraResourceInstanceStatusType>;
  networkStatistics: InfraResourceType<InfraResourceNetworkStatusType>;
  volumeStatistics: InfraResourceType<InfraResourceVolumeStatusType>;
}
export interface InfraResourceType<T> {
  totalCount: number;
  status: T;
}
export interface InfraResourceInstanceStatusType {
  error: number;
  active: number;
  stopped: number;
  paused: number;
}
export interface InfraResourceNetworkStatusType {
  error: number;
  active: number;
  down: number;
  build: number;
}
export interface InfraResourceVolumeStatusType {
  error: number;
  available: number;
  inUse: number;
  deleting: number;
}

// 최근 로그
export interface LatestLogType {
  title: string;
  type: string;
}

// 공급자 자원별 사용량 차트
export interface ProviderResourceUsageGraphType {
  cpu: ResourceUsageGraphType;
  memory: ResourceUsageGraphType;
  networkReceive: ResourceUsageGraphType;
  networkTransmit: ResourceUsageGraphType;
  disk: ResourceUsageGraphType;
}
export interface ResourceUsageGraphType {
  resultType: string;
  result: ResourceUsageGraphResultType[];
}
interface ResourceUsageGraphResultType {
  metric: ResourceUsageGraphMetricType;
  values: object[][];
}
interface ResourceUsageGraphMetricType {
  device?: string;
  mode?: string;
  instance: string;
  job: string;
}

// 프로젝트 쿼터 사용량
export interface ProjectQuotaUsageType {
  projectId: string;
  projectName: string;
  cpu: QuotaUsageType;
  ram: QuotaUsageType;
  disk: QuotaUsageType;
}
export interface QuotaUsageType {
  total: number;
  used: number;
  available: number;
}
