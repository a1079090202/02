// 业务错误：带 HTTP 状态码，路由层只负责把它转成响应
class ServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = ServiceError;
