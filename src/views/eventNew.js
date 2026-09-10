const { esc, layout, msgHtml } = require('./layout');

function eventNew({ error } = {}) {
  return layout(
    '建活动',
    `
    <h1>建活动</h1>
    ${msgHtml(error, true)}
    <form method="post" action="/events" class="card form">
      <label>活动名称 <input name="name" required maxlength="100"></label>
      <label>时间 <input name="event_time" type="datetime-local" required></label>
      <label>地点 <input name="location" required maxlength="100"></label>
      <label>报名上限 <input name="capacity" type="number" min="1" value="100" required></label>
      <button type="submit">创建</button>
    </form>`
  );
}

module.exports = eventNew;
