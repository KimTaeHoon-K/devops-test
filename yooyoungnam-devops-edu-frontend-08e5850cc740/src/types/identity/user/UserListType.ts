export interface UserListType {
  users: UserType[];
}

export interface UserType {
  id: string;
  name: string;
  domainId: string;
  enabled: boolean;
}
