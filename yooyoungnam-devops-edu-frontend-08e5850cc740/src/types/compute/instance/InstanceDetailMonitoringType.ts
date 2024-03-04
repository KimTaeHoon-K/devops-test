export interface InstanceDetailMonitoringType {
  cpu: ResourceUsageGraphType;
  memory: ResourceUsageGraphType;
  network: ResourceUsageGraphType;
  networkError: ResourceUsageGraphType;
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
