const { esc, layout, msgHtml } = require('./layout');

function register(event, { msg, error } = {}) {
  return layout(
    `报名 · ${event.name}`,
    `
    <h1>线上报名：${esc(event.name)}</h1>
    <p class="muted">时间：${esc(event.event_time)} ｜ 地点：${esc(event.location)} ｜ 上限：${event.capacity} 人</p>
    ${msgHtml(msg, false)}
    ${msgHtml(error, true)}
    <form method="post" action="/events/${event.id}/register" class="card form">
      <label>姓名 <input name="name" required maxlength="50"></label>
      <label>手机号 <input name="phone" required maxlength="13" placeholder="11 位手机号"></label>
      <label>部门 <input name="department" maxlength="50" placeholder="选填"></label>
      <button type="submit">提交报名</button>
    </form>`
  );
}

module.exports = register;
