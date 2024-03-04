import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Dashboard from '@/views/dashboard/Dashboard.vue';
import { ComputeRouter } from '@/router/compute';
import { StorageRouter } from '@/router/storage';
import { NetworkRouter } from '@/router/network';
import { ManagementRouter } from '@/router/management';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/contrabass',
    name: 'contrabass dashboard',
    component: Dashboard,
    meta: {
      title: 'menu.dashboard',
    },
  },
  ...ComputeRouter,
  ...StorageRouter,
  ...NetworkRouter,
  ...ManagementRouter,
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
