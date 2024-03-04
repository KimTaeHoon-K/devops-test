import { Router } from 'vue-router';

export function goToPageByName(
  router: Router,
  to: string,
  params?: any,
  query?: any
) {
  router.push({ name: to, params: params, query: query });
}

export function goToPageByPath(router: Router, to: string, query?: any) {
  router.push({ path: to, query: query });
}

export function goToPageByNumber(router: Router, to: number) {
  router.go(to);
}
