import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { VolumeSnapshotType } from '@/types/storage/volume-snapshot/VolumeSnapshotListType';
import { VolumeSnapshotDeleteType } from '@/types/storage/volume-snapshot/VolumeSnapshotDeleteType';
import { VolumeSnapshotCreateType } from '@/types/storage/volume-snapshot/VolumeSnapshotCreateType';
import { VolumeSnapshotUpdateType } from '@/types/storage/volume-snapshot/VolumeSnapshotUpdateType';
import { VolumeSnapshotDetailType } from '@/types/storage/volume-snapshot/VolumeSnapshotDetailType';

// prefix
const STORAGE_VOLUME_SNAPSHOT_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/block-storage/volumes/snapshots`;

// 볼륨 스냅샷 목록 조회 api
export async function getVolumeSnapshotList(
  page: number,
  pageSize: number,
  volumeId?: string,
  projectId?: string
): Promise<AxiosResponse<ResponseType<VolumeSnapshotType[]>>> {
  return instance.get(`${STORAGE_VOLUME_SNAPSHOT_PREFIX}`, {
    params: {
      size: pageSize,
      page: page,
      volumeId: volumeId,
      projectId: projectId,
    },
  });
}

// 볼륨 스냅샷 상세 조회 api
export async function getVolumeSnapshotDetail(
  volumeSnapshotId: string
): Promise<AxiosResponse<ResponseType<VolumeSnapshotDetailType>>> {
  return instance.get(`${STORAGE_VOLUME_SNAPSHOT_PREFIX}/${volumeSnapshotId}`);
}

// 볼륨 스냅샷 생성 api
export async function createVolumeSnapshot(
  volumeSnapshot: VolumeSnapshotCreateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.post(`${STORAGE_VOLUME_SNAPSHOT_PREFIX}`, {
    snapshot: volumeSnapshot,
  });
}

// 볼륨 스냅샷 수정 api
export async function updateVolumeSnapshot(
  volumeSnapshotId: string,
  volumeSnapshotUpdateType: VolumeSnapshotUpdateType
): Promise<AxiosResponse<ResponseType<VolumeSnapshotType>>> {
  return instance.put(`${STORAGE_VOLUME_SNAPSHOT_PREFIX}/${volumeSnapshotId}`, {
    snapshot: volumeSnapshotUpdateType.volumeSnapshot,
  });
}

// 볼륨 스냅샷 삭제 api
export async function deleteVolumeSnapshot(
  volumeSnapshotDeleteType: VolumeSnapshotDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${STORAGE_VOLUME_SNAPSHOT_PREFIX}`, {
    data: volumeSnapshotDeleteType,
  });
}
