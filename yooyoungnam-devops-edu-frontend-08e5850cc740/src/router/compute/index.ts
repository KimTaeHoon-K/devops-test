import { RouteRecordRaw } from 'vue-router';

import InstanceList from '@/views/compute/instance/InstanceList.vue';
import InstanceDetail from '@/views/compute/instance/InstanceDetail.vue';
import InstanceSnapshotList from '@/views/compute/instance-snapshot/InstanceSnapshotList.vue';
import FlavorList from '@/views/compute/flavor/FlavorList.vue';
import ServerGroupList from '@/views/compute/server-group/ServerGroupList.vue';
import ImageList from '@/views/compute/image/ImageList.vue';
import ImageDetail from '@/views/compute/image/ImageDetail.vue';
import KeyPairList from '@/views/compute/key-pair/KeyPairList.vue';
import InstanceCreate from '@/views/compute/instance/InstanceCreate.vue';
import FlavorCreate from '@/views/compute/flavor/FlavorCreate.vue';
import ImageCreate from '@/views/compute/image/ImageCreate.vue';
import FlavorDetail from '@/views/compute/flavor/FlavorDetail.vue';
import InstanceSnapshotDetail from '@/views/compute/instance-snapshot/InstanceSnapshotDetail.vue';

export const ComputeRouter: Array<RouteRecordRaw> = [
  {
    // Compute
    path: '/compute',
    name: 'contrabass compute',
    meta: {
      title: 'menu.compute.main',
    },
    children: [
      {
        // Instance
        path: '/compute/instance',
        name: 'instance',
        component: InstanceList,
        meta: {
          title: 'menu.compute.instance.main',
        },
      },
      {
        // Instance Create
        path: '/compute/instance/create',
        name: 'instance create',
        component: InstanceCreate,
        meta: {
          title: 'menu.compute.instance.create',
        },
      },
      {
        // Instance Detail
        path: '/compute/instance/:id',
        name: 'instance detail',
        component: InstanceDetail,
        meta: {
          title: 'menu.compute.instance.detail',
        },
      },
      {
        // Instance Snapshot
        path: '/compute/instance-snapshot',
        name: 'instance snapshot',
        component: InstanceSnapshotList,
        meta: {
          title: 'menu.compute.instance-snapshot.main',
        },
      },
      {
        // Instance Snapshot
        path: '/compute/instance-snapshot/:id',
        name: 'instance snapshot detail',
        component: InstanceSnapshotDetail,
        meta: {
          title: 'menu.compute.instance-snapshot.detail',
        },
      },
      {
        // Flavor
        path: '/compute/flavor',
        name: 'flavor',
        component: FlavorList,
        meta: {
          title: 'menu.compute.flavor.main',
        },
      },
      {
        // Instance Create
        path: '/compute/flavor/create',
        name: 'flavor create',
        component: FlavorCreate,
        meta: {
          title: 'menu.compute.flavor.create',
        },
      },
      {
        // Flavor
        path: '/compute/flavor/:id',
        name: 'flavor detail',
        component: FlavorDetail,
        meta: {
          title: 'menu.compute.flavor.detail',
        },
      },
      {
        // Server Group
        path: '/compute/server-group',
        name: 'server group',
        component: ServerGroupList,
        meta: {
          title: 'menu.compute.server-group.main',
        },
      },
      {
        // Image
        path: '/compute/image',
        name: 'image',
        component: ImageList,
        meta: {
          title: 'menu.compute.image.main',
        },
      },
      {
        path: '/compute/image/create',
        name: 'image create',
        component: ImageCreate,
        meta: {
          title: 'menu.compute.image.create',
        },
      },
      {
        path: '/compute/image/:imageId',
        name: 'image detail',
        component: ImageDetail,
        props: true,
        meta: {
          title: 'menu.compute.image.detail',
        },
      },
      {
        path: '/compute/image/:id/edit',
        name: 'image edit',
        component: ImageDetail,
        props: true,
        meta: {
          title: 'menu.compute.image.detail',
        },
      },
      {
        // Key Pair
        path: '/compute/key-pair',
        name: 'key pair',
        component: KeyPairList,
        meta: {
          title: 'menu.compute.key-pair.main',
        },
      },
    ],
  },
];
