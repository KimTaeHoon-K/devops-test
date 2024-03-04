export interface PortUpdateType {
  port: PortUpdateFormType;
}

export interface PortUpdateFormType {
  id: string;
  name: string;
  description: string;
  macAddress: string | undefined;
  bindingVnicType: string;
}
