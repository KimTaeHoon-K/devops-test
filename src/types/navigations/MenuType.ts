export interface MenuType {
  key: string;
  name: string;
  link?: string;
  subMenuItems?: MenuType[];
  meta?: object;
}
