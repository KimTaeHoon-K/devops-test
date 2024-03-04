export interface VolumeTypeListType {
  volumeTypes: VolumeTypeType[];
}

export interface VolumeTypeType {
  id: string;
  name: string;
  description: string;
  publicIs: boolean; // isPublic
  qosSpecsId: string;
  extraSpecs: object; // Examples include capabilities, capacity, compression, and so on, depending on the storage driver in use.
}
