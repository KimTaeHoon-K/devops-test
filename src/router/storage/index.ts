import { RouteRecordRaw } from 'vue-router';

import VolumeList from '@/views/storage/volume/VolumeList.vue';
import VolumeTypeList from '@/views/storage/volume-type/VolumeTypeList.vue';
import VolumeCreate from '@/views/storage/volume/VolumeCreate.vue';
import VolumeSnapshotList from '@/views/storage/volume-snapshot/VolumeSnapshotList.vue';
import VolumeDetail from '@/views/storage/volume/VolumeDetail.vue';
import VolumeSnapshotDetail from '@/views/storage/volume-snapshot/VolumeSnapshotDetail.vue';
import QosSpecsManagement from '@/views/storage/volume-type/QosSpecsManagement.vue';
import VolumeTypeDetail from '@/views/storage/volume-type/VolumeTypeDetail.vue';

export const StorageRouter: Array<RouteRecordRaw> = [
  {
    // Storage
    path: '/storage',
    name: 'contrabass storage',
    meta: {
      title: 'menu.storage.main',
    },
    props: true,
    children: [
      {
        // Volume
        path: '/storage/volume',
        name: 'volume',
        component: VolumeList,
        meta: {
          title: 'menu.storage.volume.main',
        },
      },
      {
        // Volume
        path: '/storage/volume/create',
        name: 'volume create',
        component: VolumeCreate,
        meta: {
          title: 'menu.storage.volume.create',
        },
      },
      {
        // Volume
        path: '/storage/volume/:id',
        name: 'volume detail',
        component: VolumeDetail,
        meta: {
          title: 'menu.storage.volume.detail',
        },
      },
      {
        // Volume Backup
        path: '/storage/volume-backup',
        name: 'volume backup',
        component: VolumeList,
        meta: {
          title: 'menu.storage.volume-backup.main',
        },
      },
      {
        // Volume Snapshot
        path: '/storage/volume-snapshot',
        name: 'volume snapshot',
        component: VolumeSnapshotList,
        meta: {
          title: 'menu.storage.volume-snapshot.main',
        },
      },
      {
        // Volume
        path: '/storage/volume-snapshot/:id',
        name: 'volume snapshot detail',
        component: VolumeSnapshotDetail,
        meta: {
          title: 'menu.storage.volume-snapshot.detail',
        },
      },
      {
        // Volume Type
        path: '/storage/volume-type',
        name: 'volume type',
        component: VolumeTypeList,
        meta: {
          title: 'menu.storage.volume-type.main',
        },
      },
      {
        // Volume Type
        path: '/storage/volume-type/:id',
        name: 'volume type detail',
        component: VolumeTypeDetail,
        meta: {
          title: 'menu.storage.volume-type.detail',
        },
      },
      {
        // Volume Type
        path: '/storage/volume-type/:id/qos-specs-mgmt',
        name: 'qos specs mgmt',
        component: QosSpecsManagement,
        meta: {
          title: 'menu.storage.volume-type.qos-specs-management',
        },
      },
    ],
  },
];
