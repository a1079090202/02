const { esc, layout } = require('./layout');

function eventDetail(event, totals, registrations) {
  const rows = registrations
    .map(
      (r) => `
      <tr>
        <td>${esc(r.name)}</td>
        <td>${esc(r.phone)}</td>
        <td>${esc(r.department)}</td>
        <td>${r.source === 'walkin' ? '现场补录' : '线上报名'}</td>
        <td>${r.checked_in ? `✅ ${esc(r.checked_in_at)}` : '未签到'}</td>
      </tr>`
    )
    .join('');

  return layout(
    event.name,
    `
    <h1>${esc(event.name)}</h1>
    <p class="muted">时间：${esc(event.event_time)} ｜ 地点：${esc(event.location)} ｜ 上限：${event.capacity} 人</p>
    <div class="stats">
      <div class="stat"><b>${totals.total}</b><span>已报名</span></div>
      <div class="stat"><b>${totals.checked_in}</b><span>已签到</span></div>
      <div class="stat"><b>${totals.not_checked_in}</b><span>未签到</span></div>
      <div class="stat"><b>${totals.walkin}</b><span>现场补录</span></div>
    </div>
    <p class="actions">
      <a class="btn" href="/events/${event.id}/register">线上报名页</a>
      <a class="btn" href="/events/${event.id}/checkin">签到台</a>
      <a class="btn" href="/events/${event.id}/summary">汇总</a>
      <a class="btn" href="/events/${event.id}/export.csv">导出 CSV</a>
    </p>
    <h2>名单</h2>
    ${
      registrations.length
        ? `<table>
            <thead><tr><th>姓名</th><th>手机号</th><th>部门</th><th>渠道</th><th>签到</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`
        : '<p class="muted">还没有人报名。</p>'
    }`
  );
}

module.exports = eventDetail;
