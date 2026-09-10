const { esc, layout, msgHtml } = require('./layout');

function checkin(event, totals, { msg, error } = {}) {
  return layout(
    `签到台 · ${event.name}`,
    `
    <h1>签到台：${esc(event.name)}</h1>
    <div class="stats" id="stats">
      <div class="stat"><b id="stat-total">${totals.total}</b><span>已报名</span></div>
      <div class="stat"><b id="stat-checked">${totals.checked_in}</b><span>已签到</span></div>
      <div class="stat"><b id="stat-not">${totals.not_checked_in}</b><span>未签到</span></div>
      <div class="stat"><b id="stat-walkin">${totals.walkin}</b><span>现场补录</span></div>
    </div>
    ${msgHtml(msg, false)}
    ${msgHtml(error, true)}

    <section class="card">
      <h2>查人签到</h2>
      <form id="lookup-form" class="form inline">
        <label>手机号后四位 <input name="last4" required pattern="\\d{4}" maxlength="4" inputmode="numeric"></label>
        <label>姓名首字/首字母 <input name="initial" maxlength="1" placeholder="选填"></label>
        <button type="submit">查询</button>
      </form>
      <div id="lookup-msg"></div>
      <div id="results"></div>
    </section>

    <section class="card">
      <h2>现场补录</h2>
      <form method="post" action="/events/${event.id}/walkin" class="form inline">
        <label>姓名 <input name="name" required maxlength="50"></label>
        <label>手机号 <input name="phone" required maxlength="13"></label>
        <label>部门 <input name="department" maxlength="50"></label>
        <label class="checkbox"><input type="checkbox" name="checkin" value="1" checked> 补录后立即签到</label>
        <button type="submit">补录</button>
      </form>
    </section>

    <p class="actions"><a class="btn" href="/events/${event.id}/summary">看汇总</a></p>
    <script src="/checkin.js"></script>`
  );
}

module.exports = checkin;
