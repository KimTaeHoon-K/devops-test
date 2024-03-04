export interface InfoColumnType {
  title: string;
  dataType: string;
  dataIndex?: string;
  dataFormat?: string;
  isCopyable?: boolean;
  isTag?: boolean;
  isObject?: boolean;
  convertFunc?: object;
}
