// Hearth — router and wiring. Hash routes map to the views; every form
// and button on a page is handled here, then the page re-renders.
(function (global) {
  'use strict';

  var H = global.Hearth;
  var V = global.HearthViews;
  var main = document.getElementById('app');

  var ROUTES = {
    '': V.renderDashboard,
    'transactions': V.renderTransactions,
    'budget': V.renderBudget,
    'goals': V.renderGoals,
    'reports': V.renderReports,
    'bills': V.renderBills
  };

  function parseHash() {
    var raw = global.location.hash.replace(/^#\/?/, '');
    var parts = raw.split('?');
    var path = parts[0] || '';
    var query = new URLSearchParams(parts[1] || '');
    return { path: path, query: query };
  }

  function render() {
    var route = parseHash();
    var view = ROUTES[route.path];
    if (!view) {
      main.innerHTML = '<h1>Page not found</h1><p class="lede">That page does not exist. ' +
        '<a href="#/">Back to the dashboard</a>.</p>';
      setActive('');
      return;
    }
    main.innerHTML = view(route.query);
    setActive(route.path);
    wirePage(route.path);
    global.scrollTo(0, 0);
  }

  function setActive(path) {
    var links = document.querySelectorAll('.nav a');
    links.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var p = href.replace(/^#\/?/, '');
      if (p === path) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function wirePage(path) {
    if (path === 'transactions') wireTransactions();
    if (path === 'budget') wireBudget();
    if (path === 'goals') wireGoals();
    if (path === 'bills') wireBills();
  }

  function currentQuery() {
    return parseHash().query;
  }

  function applyFilters() {
    var q = document.getElementById('f-q').value;
    var cat = document.getElementById('f-cat').value;
    var type = document.getElementById('f-type').value;
    var month = document.getElementById('f-month').value;
    var params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat !== 'all') params.set('cat', cat);
    if (type !== 'all') params.set('type', type);
    if (month !== 'all') params.set('month', month);
    var suffix = params.toString() ? '?' + params.toString() : '';
    global.location.hash = '#/transactions' + suffix;
  }

  function wireTransactions() {
    ['f-q', 'f-cat', 'f-type', 'f-month'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', applyFilters);
    });
    var q = document.getElementById('f-q');
    if (q) q.addEventListener('input', function () {
      clearTimeout(q._t);
      q._t = setTimeout(applyFilters, 400);
    });

    var form = document.getElementById('tx-form');
    if (form) form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var amount = Number(data.get('amount'));
      if (!amount || amount <= 0) return;
      var patch = {
        date: String(data.get('date')),
        desc: String(data.get('desc')).trim(),
        category: String(data.get('category')),
        amount: Math.round(amount * 100) / 100,
        type: String(data.get('type'))
      };
      var editId = String(data.get('editId') || '');
      if (editId) H.editTransaction(editId, patch);
      else H.addTransaction(patch);
      global.location.hash = '#/transactions';
      render();
    });

    main.querySelectorAll('[data-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-delete');
        var row = main.querySelector('tr[data-id="' + id + '"]');
        var desc = row ? row.children[1].textContent : 'this transaction';
        if (global.confirm('Delete "' + desc + '"?')) {
          H.deleteTransaction(id);
          render();
        }
      });
    });

    main.querySelectorAll('[data-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-edit');
        var query = currentQuery();
        query.set('edit', id);
        global.location.hash = '#/transactions?' + query.toString();
        var form = document.getElementById('tx-form');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  function wireBudget() {
    main.querySelectorAll('.plan-form').forEach(function (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var amount = Number(new FormData(form).get('planned'));
        if (isNaN(amount) || amount < 0) return;
        H.setPlanned(form.getAttribute('data-cat'), Math.round(amount));
        render();
      });
    });
  }

  function wireGoals() {
    main.querySelectorAll('.goal-form').forEach(function (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var amount = Number(new FormData(form).get('amount'));
        if (!amount || amount <= 0) return;
        var available = H.summary().available;
        if (amount > available) {
          global.alert('Only ' + H.money(available) + ' is available to move this month.');
          return;
        }
        H.addToGoal(form.getAttribute('data-goal'), Math.round(amount * 100) / 100);
        render();
      });
    });
  }

  function wireBills() {
    main.querySelectorAll('[data-pay]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        H.payBill(btn.getAttribute('data-pay'));
        render();
      });
    });
    main.querySelectorAll('[data-unpay]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        H.unpayBill(btn.getAttribute('data-unpay'));
        render();
      });
    });
  }

  document.getElementById('reset-demo').addEventListener('click', function () {
    if (global.confirm('Reset Hearth to the original November data? Your own changes will be lost.')) {
      H.resetAll();
      render();
    }
  });

  global.addEventListener('hashchange', render);
  render();
})(window);
