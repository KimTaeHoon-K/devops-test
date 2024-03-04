export interface VolumeTypeCreateType {
  name: string;
  description: string;
  is_public: boolean;
  extraSpecs?: object;
}
