export interface ImageListType {
  images: ImageType[];
}

export interface ImageType {
  id: string;
  name: string;
  owner: string;
  projectId: string;
  projectName: string;
  description: string;
  visibility: string;
  diskFormat: string;
  containerFormat: string;
  protected: boolean;
  minDisk: number; // GB
  minRam: number; // MB
  virtualSize: number; // bytes
  size: number; // bytes
  status: string;
  os: string; // 콘트라베이스 생성 os 컬럼
  osDistro: string; // 스카이라인 생성 os 컬럼
  osVersion: string;
  osHidden: boolean;
  osHashAlgo: string;
  osHashValue: string;
  tags: object;
  self: string;
  file: string;
  schema: string;
  checksum: string;
  createdAt: string;
  updatedAt: string;
  type?: string;
}
