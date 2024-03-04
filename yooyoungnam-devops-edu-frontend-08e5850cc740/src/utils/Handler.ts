// 모든페이지에서 공통 적으로 사용 할수 있는 함수의 정의
import { AxiosError } from 'axios';

export function apiErrorHandler(customApiErrorHandler: any, error: AxiosError) {
  if (
    error.status != 500 &&
    error.status != 404 &&
    error.status != 401 &&
    error.status != 403 &&
    error.status != 404
  ) {
    customApiErrorHandler();
  }
}
