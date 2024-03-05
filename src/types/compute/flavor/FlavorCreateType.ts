export interface FlavorCreateType {
  name: string;
  description: string;
  vcpus: number; // > 0
  ram: number; // MiB > 0
  disk: number; // GiB
  'os-flavor-access:is_public'?: boolean;
}
