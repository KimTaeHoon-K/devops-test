import type MessageTextType from '@/types/message-text/MessageTextType';

const messageText: MessageTextType = {
  role: {
    access: {
      nonAuthorized: '접근권한이 없습니다.',
      unauthorized: '접근 권한이 없습니다. 관리자에게 권한을 요청하세요.',
    },
  },
  server: {
    notFound: '요청 주소를 찾을 수 없습니다.',
    error: '서버 에러 입니다.',
  },
  serviceRequestAdmin: {
    approve: {
      success: 'SR 승인이 완료 되었습니다.',
      fail: 'SR 승인이 실패 되었습니다. ',
    },
    wait: {
      success: '반려가 완료 되었습니다.',
      fail: '반려가 실패 되었습니다. ',
    },
    selectAll: {
      fail: 'SR 목록 조회가 실패 되었습니다.',
    },
  },
};
export default messageText;
