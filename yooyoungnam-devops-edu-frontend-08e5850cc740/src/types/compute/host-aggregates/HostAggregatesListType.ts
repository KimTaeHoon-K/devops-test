export interface HostAggregatesListType {
  aggregates: HostAggregatesType[];
}

export interface HostAggregatesType {
  deleted: boolean;
  id: string;
  name: string;
  hosts: [];
  availabilityZone: number;
  metadata: object;
  createdAt: string;
}
