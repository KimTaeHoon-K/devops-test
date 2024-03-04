export interface InstanceCreateType {
  server: InstanceServerCreateType;
  projectId: string;
  volume?: InstanceVolumeCreateType;
}

export interface InstanceServerCreateType {
  name: string;
  description: string;
  availabilityZone?: string;
  imageRef: string;
  flavorRef: string;
  networks: NetworkType[];
  osDcfDiskConfig: string;
  blockDeviceMappingV2: BlockDeviceMappingType[];
  securityGroups: SecurityGroupType[];
  keyName: string;
}

export interface InstanceVolumeCreateType {
  size: number;
  deleteOnTermination: boolean;
}

export interface NetworkType {
  uuid: string;
}
export interface BlockDeviceMappingType {
  bootIndex: number;
  description?: string;
  uuid: string;
  sourceType: string;
  volumeSize: number;
  destinationType: string;
  deleteOnTermination: boolean;
  volumeType?: string;
}

export interface SecurityGroupType {
  name: string;
}

export interface InstanceReviewInfoType {
  // step 1 : 기본 정보
  instanceName: string;
  instanceDescription: string;
  projectName: string;
  projectId: string;
  // step 2 : 인스턴스 소스
  imageName: string;
  imageSize: number;
  imageVisibility: string;
  volumeSize: number;
  deleteOnTermination: boolean;
  // step 3 : 인스턴스 유형
  flavorName: string;
  flavorVCPU: string;
  flavorRootDisk: number;
  // step 4 : 스토리지
  systemDiskName: string;
  systemDiskSize: number;
  dataDiskName: string;
  dataDiskSize: number;
  // step 5 : 네트워크
  networkName: string;
  subnetCount: number;
  routerExternal: boolean;
  // step 6 : 보안
  securityGroupNames: string[];
  keypairName: string;
}
