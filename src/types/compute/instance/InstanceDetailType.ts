export interface InstanceDetailType {
  server: InstanceServerType;
}

export interface InstanceServerType {
  id: string;
  name: string;
  status: string;
  hostId: string;
  projectName: string;
  image: ImageType | null;
  flavor: {
    id: string;
    links: [];
  };
  storage: StorageType[];
  network: {
    addresses: NetworkType[];
  };
  created: string;
  updated: string;
  description: string;
  tenantId: string;
  userId: string;
  osDcfDiskConfig: string;
  osExtAzAvailabilityZone: string;
  configDrive: string;
  keyName: string;
  securityGroups: SecurityGroupType[];
  osExtSrvAttrHost: string;
  osExtSrvAttrInstanceName: string;
  osExtSrvAttrHypervisorHostname: string;
  osExtStsVmState: string;
  osExtStsPowerState: number;
  osExtendedVolumesVolumesAttached: OsExtendedVolumesVolumesAttachedType[];
}

interface ImageType {
  name: string;
  type: string;
  size: number;
  status: string;
  id: string;
  diskFormat: string;
  protected: string;
  createdAt: string;
}

export interface StorageType {
  systemDisks: DiskType[] | null;
  dataDisks: DiskType[] | null;
}

interface DiskType {
  name: string;
  type: string;
  size: number;
  instanceSourceType?: string;
}
export interface SecurityGroupType {
  name: string;
}

export interface OsExtendedVolumesVolumesAttachedType {
  id: string;
}

interface NetworkType {
  networkName: string;
  addr: string;
  ipsType: string;
}

export interface InstanceDetailNetworkType {
  networksName: string;
  subnetsAddr: string;
}

export interface InstanceDetailSecurityType {
  securityGroups: string;
  keyName: string;
}
