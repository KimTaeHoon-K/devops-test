// TODO: types/flavor 하위로 이동
export interface FlavorListType {
  flavors: FlavorType[];
}

export interface FlavorType {
  id: string;
  name: string;
  description: string;
  ram: number; // MiB
  rootDisk: number; // GiB
  osFlvEstDataEphemeral: number; // GiB
  osFlavorAccessIsPublic: boolean;
  vcpu: number;
}
