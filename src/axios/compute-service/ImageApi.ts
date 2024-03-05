import instance from '@/axios/instance';
import { AxiosResponse } from 'axios';
import { ResponseType } from '@/types/common/api/ResponseType';
import { ImageType } from '@/types/compute/image/ImageListType';
import { ImageCreateType } from '@/types/compute/image/ImageCreateType';
import { ImageDeleteType } from '@/types/compute/image/ImageDeleteType';

// prefix
const COMPUTE_IMAGE_PREFIX = `${process.env.VUE_APP_ADMIN_API_CONTRABASS_ENDPOINT_PREFIX}/compute/images`;

// 이미지 목록 조회 api
export async function getImageList(
  page: number,
  pageSize: number
): Promise<AxiosResponse<ResponseType<ImageType[]>>> {
  return instance.get(`${COMPUTE_IMAGE_PREFIX}`, {
    params: { size: pageSize, page: page },
  });
}

// 이미지 상세 조회 api
export async function getImageDetail(
  imageId: string
): Promise<AxiosResponse<ResponseType<ImageType>>> {
  return instance.get(`${COMPUTE_IMAGE_PREFIX}/${imageId}`);
}

// 이미지 생성 api
export async function createImage(
  image: ImageCreateType
): Promise<AxiosResponse<ResponseType<ImageType>>> {
  return instance.post(`${COMPUTE_IMAGE_PREFIX}`, {
    image: image,
  });
}

export async function uploadImageFile(
  imageId: string,
  formData: FormData
): Promise<AxiosResponse<ResponseType>> {
  return instance.put(`${COMPUTE_IMAGE_PREFIX}/${imageId}/file`, formData);
}

// 이미지 수정 api

// 이미지 삭제 api
export async function deleteImage(
  imageDeleteType: ImageDeleteType
): Promise<AxiosResponse<ResponseType>> {
  return instance.delete(`${COMPUTE_IMAGE_PREFIX}`, {
    data: imageDeleteType,
  });
}
