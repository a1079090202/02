const { esc, layout } = require('./layout');

function summary(event, data, currentDept) {
  const { totals, byDepartment, departments, registrations } = data;

  const deptOptions = ['<option value="">全部部门</option>']
    .concat(
      departments.map(
        (d) =>
          `<option value="${esc(d)}" ${d === currentDept ? 'selected' : ''}>${esc(d || '（未填部门）')}</option>`
      )
    )
    .join('');

  const deptRows = byDepartment
    .map(
      (d) => `
      <tr>
        <td>${esc(d.department || '（未填部门）')}</td>
        <td>${d.total}</td>
        <td>${d.checked_in}</td>
        <td>${d.not_checked_in}</td>
        <td>${d.walkin}</td>
      </tr>`
    )
    .join('');

  const regRows = registrations
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
    `汇总 · ${event.name}`,
    `
    <h1>汇总：${esc(event.name)}</h1>
    <p class="muted">时间：${esc(event.event_time)} ｜ 地点：${esc(event.location)}</p>
    <div class="stats">
      <div class="stat"><b>${totals.total}</b><span>已报名</span></div>
      <div class="stat"><b>${totals.checked_in}</b><span>已签到</span></div>
      <div class="stat"><b>${totals.not_checked_in}</b><span>未签到</span></div>
      <div class="stat"><b>${totals.walkin}</b><span>现场补录</span></div>
    </div>
    <p class="actions">
      <a class="btn" href="/events/${event.id}/export.csv">导出 CSV</a>
      <a class="btn" href="/events/${event.id}/checkin">回签到台</a>
    </p>

    <h2>按部门</h2>
    <table>
      <thead><tr><th>部门</th><th>已报名</th><th>已签到</th><th>未签到</th><th>现场补录</th></tr></thead>
      <tbody>${deptRows}</tbody>
    </table>

    <h2>名单</h2>
    <form method="get" action="/events/${event.id}/summary" class="form inline">
      <label>部门筛选
        <select name="department" onchange="this.form.submit()">${deptOptions}</select>
      </label>
      <noscript><button type="submit">筛选</button></noscript>
    </form>
    ${
      registrations.length
        ? `<table>
            <thead><tr><th>姓名</th><th>手机号</th><th>部门</th><th>渠道</th><th>签到</th></tr></thead>
            <tbody>${regRows}</tbody>
          </table>`
        : '<p class="muted">该部门暂无报名记录。</p>'
    }`
  );
}

module.exports = summary;
