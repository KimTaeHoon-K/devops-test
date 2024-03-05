export interface PaginationType {
  currentPage: number;
  pageSize: number;
  totalCount?: number;
  totalPage?: number;
  pageSizeOptions?: number[];
}
