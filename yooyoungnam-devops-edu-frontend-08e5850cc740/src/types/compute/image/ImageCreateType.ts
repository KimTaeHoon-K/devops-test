export interface ImageCreateType {
  name: string;
  description: string;
  diskFormat: string | undefined; // 포맷
  os: string | undefined;
  osVersion: string;
  minDisk: number; // GB
  minRam: number; // MB
  visibility: string; // public, private, shared, community
  protected: boolean;
  containerFormat: string;
  // filePath: string;
  projectId: string | undefined;
  // qemuGuestAgent: boolean;
  sharedProjectIds: string[];
}
