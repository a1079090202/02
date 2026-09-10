const { esc, layout } = require('./layout');

function eventList(events) {
  const rows = events
    .map(
      (e) => `
      <tr>
        <td><a href="/events/${e.id}">${esc(e.name)}</a></td>
        <td>${esc(e.event_time)}</td>
        <td>${esc(e.location)}</td>
        <td>${e.capacity}</td>
        <td class="actions">
          <a href="/events/${e.id}/register">报名</a>
          <a href="/events/${e.id}/checkin">签到台</a>
          <a href="/events/${e.id}/summary">汇总</a>
        </td>
      </tr>`
    )
    .join('');

  return layout(
    '活动列表',
    `
    <h1>活动列表</h1>
    ${
      events.length
        ? `<table>
            <thead><tr><th>名称</th><th>时间</th><th>地点</th><th>上限</th><th>操作</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`
        : '<p class="muted">还没有活动，<a href="/events/new">建一个</a>。</p>'
    }`
  );
}

module.exports = eventList;
