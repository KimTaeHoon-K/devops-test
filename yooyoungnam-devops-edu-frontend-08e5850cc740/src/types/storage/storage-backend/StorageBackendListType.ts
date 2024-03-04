export interface StorageBackendListType {
  storageBackend: StorageBackendType;
}

export interface StorageBackendType {
  name: string;
  capabilities: StorageBackendCapabilitiesType;
}

interface StorageBackendCapabilitiesType {
  multiattach: boolean;
  timestamp: string;
  vendorName: string;
  driverVersion: string;
  storageProtocol: string;
  totalCapacityGb: number;
  freeCapacityGb: number;
  reservedPercentage: number;
  thinProvisioningSupport: boolean;
  maxOverSubscriptionRatio: string;
  locationInfo: string;
  backendState: string;
  volumeBackendName: string;
  replicationEnabled: boolean;
  allocatedCapacityGb: number;
  filterFunction: string;
  goodnessFunction: string;
}
