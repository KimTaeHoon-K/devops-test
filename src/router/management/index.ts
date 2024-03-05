import { RouteRecordRaw } from 'vue-router';
import ProjectList from '@/views/management/project/ProjectList.vue';
import UserList from '@/views/management/user/UserList.vue';
import HypervisorList from '@/views/management/hypervisor/HypervisorList.vue';
import HostAggregatesList from '@/views/management/host-aggregates/HostAggregatesList.vue';
import ProjectCreate from '@/views/management/project/ProjectCreate.vue';
import StorageBackendList from '@/views/management/storage-backend/StorageBackendList.vue';

export const ManagementRouter: Array<RouteRecordRaw> = [
  {
    // Management
    path: '/management',
    name: 'contrabass management',
    meta: {
      title: 'menu.management.main',
    },
    children: [
      {
        // Project
        path: '/management/project',
        name: 'project',
        component: ProjectList,
        meta: {
          title: 'menu.management.project.main',
        },
      },
      {
        // Project
        path: '/management/project/create',
        name: 'project create',
        component: ProjectCreate,
        meta: {
          title: 'menu.management.project.create',
        },
      },
      {
        // User
        path: '/management/user',
        name: 'user',
        component: UserList,
        meta: {
          title: 'menu.management.user',
        },
      },
      {
        // User Group
        path: '/management/user-group',
        name: 'user group',
        component: ProjectList,
        meta: {
          title: 'menu.management.user-group',
        },
      },
      {
        // Role
        path: '/management/role',
        name: 'role',
        component: ProjectList,
        meta: {
          title: 'menu.management.role',
        },
      },
      {
        // Hypervisor
        path: '/management/hypervisor',
        name: 'hypervisor',
        component: HypervisorList,
        meta: {
          title: 'menu.management.hypervisor',
        },
      },
      {
        // Host Aggregates
        path: '/management/host-aggregates',
        name: 'host aggregates',
        component: HostAggregatesList,
        meta: {
          title: 'menu.management.host-aggregates',
        },
      },
      {
        // Storage Backend
        path: '/management/storage-backend',
        name: 'storage backend',
        component: StorageBackendList,
        meta: {
          title: 'menu.management.storage-backend.main',
        },
      },
    ],
  },
];
