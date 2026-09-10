// 签到台：查人 + 签到，原生 fetch，无框架
(function () {
  const eventId = location.pathname.split('/')[2];
  const form = document.getElementById('lookup-form');
  const results = document.getElementById('results');
  const msgBox = document.getElementById('lookup-msg');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function showMsg(text, isError) {
    msgBox.innerHTML = text
      ? '<div class="flash ' + (isError ? 'flash-error' : 'flash-ok') + '">' + esc(text) + '</div>'
      : '';
  }

  function maskPhone(p) {
    return p.length === 11 ? p.slice(0, 3) + '****' + p.slice(7) : p;
  }

  function refreshStats() {
    fetch('/api/events/' + eventId + '/summary')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        document.getElementById('stat-total').textContent = data.totals.total;
        document.getElementById('stat-checked').textContent = data.totals.checked_in;
        document.getElementById('stat-not').textContent = data.totals.not_checked_in;
        document.getElementById('stat-walkin').textContent = data.totals.walkin;
      });
  }

  function renderResults(list) {
    if (!list.length) {
      results.innerHTML = '<p class="muted">没查到，确认后四位和首字，或用下方「现场补录」。</p>';
      return;
    }
    results.innerHTML = list
      .map(function (r) {
        const who = esc(r.name) + '（' + esc(r.department || '未填部门') + '）' + esc(maskPhone(r.phone));
        const action = r.checked_in
          ? '<span class="tag done">已签到 ' + esc(r.checked_in_at) + '</span>'
          : '<button type="button" data-phone="' + esc(r.phone) + '">签到</button>';
        return '<div class="match"><span>' + who + '</span>' + action + '</div>';
      })
      .join('');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showMsg('');
    const params = new URLSearchParams({
      last4: form.last4.value.trim(),
      initial: form.initial.value.trim(),
    });
    fetch('/api/events/' + eventId + '/lookup?' + params)
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) { showMsg(res.d.error || '查询失败', true); return; }
        renderResults(res.d.matches);
      });
  });

  results.addEventListener('click', function (e) {
    const btn = e.target.closest('button[data-phone]');
    if (!btn) return;
    btn.disabled = true;
    fetch('/api/events/' + eventId + '/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: btn.dataset.phone }),
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) { showMsg(res.d.error || '签到失败', true); btn.disabled = false; return; }
        const d = res.d;
        showMsg(d.status === 'already'
          ? d.registration.name + ' 此前已签到过，不重复计数'
          : '签到成功：' + d.registration.name);
        form.requestSubmit(); // 重新查询，刷新按钮状态
        refreshStats();
      });
  });

  refreshStats();
})();
