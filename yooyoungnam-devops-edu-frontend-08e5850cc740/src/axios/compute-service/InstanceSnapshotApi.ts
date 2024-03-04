import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { InstanceSnapshotType } from '@/types/compute/instance-snapshot/InstanceSnapshotListType';
import { InstanceSnapshotDeleteType } from '@/types/compute/instance-snapshot/InstanceSnapshotDeleteType';
import { InstanceSnapshotUpdateType } from '@/types/compute/instance-snapshot/InstanceSnapshotUpdateType';
import { InstanceSnapshotCreateType } from '@/types/compute/instance-snapshot/InstanceSnapshotCreateType';

// prefix
const COMPUTE_INSTANCE_SNAPSHOT_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/compute/servers/snapshots`;

// 인스턴스 스냅샷 목록 조회 api
export async function getInstanceSnapshotList(
  page: number,
  pageSize: number,
  instanceId?: string
): Promise<AxiosResponse<ResponseType<InstanceSnapshotType[]>>> {
  if (instanceId) {
    return instance.get(`${COMPUTE_INSTANCE_SNAPSHOT_PREFIX}`, {
      params: { size: pageSize, page: page, instanceId: instanceId },
      paramsSerializer: function (paramObj) {
        const params = new URLSearchParams();
        for (const key in paramObj) {
          params.append(key, paramObj[key]);
        }
        return params.toString();
      },
    });
  } else {
    return instance.get(`${COMPUTE_INSTANCE_SNAPSHOT_PREFIX}`, {
      params: { size: pageSize, page: page },
    });
  }
}

// 인스턴스 스냅샷 상세 조회 api
export async function getInstanceSnapshotDetail(
  instanceSnapshotId?: string
): Promise<AxiosResponse<ResponseType<InstanceSnapshotType>>> {
  return instance.get(
    `${COMPUTE_INSTANCE_SNAPSHOT_PREFIX}/${instanceSnapshotId}`
  );
}

// 인스턴스 스냅샷 생성 api
export async function createInstanceSnapshot(
  instanceSnapshotCreateType: InstanceSnapshotCreateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.post(`${COMPUTE_INSTANCE_SNAPSHOT_PREFIX}`, {
    snapshot: instanceSnapshotCreateType.snapshot,
    serverId: instanceSnapshotCreateType.serverId,
  });
}

// 인스턴스 스냅샷 수정 api
export async function updateInstanceSnapshot(
  instanceSnapshotId: string,
  instanceSnapshotUpdateType: InstanceSnapshotUpdateType
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(
    `${COMPUTE_INSTANCE_SNAPSHOT_PREFIX}/${instanceSnapshotId}`,
    {
      snapshot: instanceSnapshotUpdateType.snapshot,
    }
  );
}

// 인스턴스 스냅샷 삭제 api
export async function deleteInstanceSnapshot(
  instanceSnapshotDeleteType: InstanceSnapshotDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${COMPUTE_INSTANCE_SNAPSHOT_PREFIX}`, {
    data: instanceSnapshotDeleteType,
  });
}
