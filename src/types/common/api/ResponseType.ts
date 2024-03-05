export interface ResponseType<T = any> {
  returnCode: string;
  returnMessage: string;
  data: T;
  timestamp: string;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
}
