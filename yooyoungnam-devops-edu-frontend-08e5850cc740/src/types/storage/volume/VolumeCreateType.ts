export interface VolumeCreateType {
  name: string;
  description: string;
  ownerProjectId: string | undefined;
  availabilityZone: string | undefined;
  size: number;
  bootable: boolean;
  multiattach: boolean;
  volumeTypeId: string | undefined;
  snapshotId?: string;
  imageId?: string;
}
