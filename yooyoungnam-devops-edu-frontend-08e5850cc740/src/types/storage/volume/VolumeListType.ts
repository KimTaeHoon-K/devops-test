export interface VolumeListType {
  volumes: VolumeType[];
}

export interface VolumeDetailType {
  volume: VolumeType;
}

export interface VolumeType {
  id: string;
  name: string;
  description: string;
  size: number;
  volumeType: string;
  multiattach: boolean; // 공유
  attachments: VolumeAttachmentType[];
  bootable: boolean;
  // sharedTargets: boolean;
  status: string;
  volumeImageMetadata?: VolumeSourceImageType;
  metadata: object;
  createdAt: string;
}

interface VolumeSourceImageType {
  imageId: string;
  imageName: string;
}

interface VolumeAttachmentType {
  attachmentId: string;
  id: string;
  volumeId: string;
  device: string;
  serverId: string;
  serverName: string;
  hostName: string;
  attachedAt: string;
}
