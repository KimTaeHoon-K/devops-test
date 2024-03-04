import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axios, { AxiosError } from 'axios';
import { ProviderStore } from '@/stores/provider/ProviderStore';
import { ResponseType } from '@/types/common/api/ResponseType';

const instance: AxiosInstance = axios.create({
  // baseURL:
  //   process.env.NODE_ENV === 'localhost'
  //     ? process.env.VUE_APP_REMOTE_LOCAL_API_HOST
  //     : '',
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const providerStore = ProviderStore();
    // 공급자 별 토큰 발급을 위한 헤더 추가
    config.headers['X-Project-Id'] = providerStore.getSelectedProjectId;
    // file 업로드 API : headers Content-type 추가
    if (config.url && config.url.includes('/file')) {
      config.headers['Content-type'] = 'multipart/form-data';
    }
    // API 페이지네이션 0부터 시작.
    if (config.params?.page) {
      config.params.page -= 1;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response: AxiosResponse<ResponseType>) => {
    // TODO: 오픈스택 에러 코드로 강제 AxiosError 발생 > 에러 코드 확인 필요.
    if (!response.data.returnCode.startsWith('20')) {
      return Promise.reject(
        new AxiosError(response.data.returnMessage, response.data.returnCode)
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    // if (error && error.response) {
    //   switch (error.response.status) {
    //     case 401:
    //       message.error(messageText.role.access.unauthorized);
    //       break;
    //     case 403:
    //       message.error(messageText.role.access.unauthorized);
    //       break;
    //     case 404:
    //       message.error(messageText.server.notFound);
    //       break;
    //     case 500:
    //       message.error(messageText.server.error);
    //       break;
    //   }
    return Promise.reject(error);
    // }
  }
);

// instance.defaults.paramsSerializer = function (paramObj) {
//   const params = new URLSearchParams();
//   for (const key in paramObj) {
//     params.append(key, paramObj[key]);
//   }
//   return params.toString();
// };

export default instance;
