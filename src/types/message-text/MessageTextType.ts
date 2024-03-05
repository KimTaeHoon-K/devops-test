export default interface MessageTextType {
  role: {
    access: {
      nonAuthorized: string;
      unauthorized: string;
    };
  };
  server: {
    notFound: string;
    error: string;
  };
  serviceRequestAdmin: {
    approve: {
      success: string;
      fail: string;
    };
    wait: {
      success: string;
      fail: string;
    };
    selectAll: {
      fail: string;
    };
  };
}
