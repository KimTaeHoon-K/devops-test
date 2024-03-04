export interface AvailabilityZoneListType {
  availabilityZoneInfo: AvailabilityZoneType[];
}

export interface AvailabilityZoneType {
  zoneName: string;
  zoneState: {
    available: boolean;
  };
}
