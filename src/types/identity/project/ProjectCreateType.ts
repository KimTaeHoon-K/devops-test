export interface ProjectCreateType {
  domainId: string;
  name: string;
  description: string;
  enabled: boolean;
}

//
export interface ProjectBasicInfoType {
  name: string;
  description: string;
  enabled: boolean;
}

export interface QuotaInfoType {
  // 컴퓨트
  computeInstance: number;
  computeVcpus: number;
  computeMemory: number;
  computeRam: number;
  computeServerGroup: number;
  computeServerGroupMaxMember: number;
  computeKeyPair: number;
  // 스토리지
  storageVolume: number;
  storageVolumeSize: number;
  storageVolumeSnapshot: number;
  // 네트워크
  networkNetwork: number;
  networkRouter: number;
  networkPort: number;
  networkSubnet: number;
  networkSubnetPool: number;
  networkFloatingIp: number;
  networkSecurityGroup: number;
  networkSecurityGroupRule: number;
  // 공유
  share: number;
  shareSize: number;
  shareSnapshot: number;
  shareSnapshotSize: number;
  shareNetwork: number;
}

export interface ProjectReviewInfoType {
  // step 1 : 기본 정보
  basicInfo: ProjectBasicInfoType;
  // step 2 : 쿼터
  quotaInfo: QuotaInfoType;
}
