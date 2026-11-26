// Hearth — page renderers. Each route renders its page from the store,
// so every figure on screen is computed from the same transactions.
(function (global) {
  'use strict';

  var H = global.Hearth;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function pctBar(pct, over) {
    var w = Math.min(100, Math.max(0, pct));
    return '<div class="bar"><div class="bar-fill' + (over ? ' over' : '') +
      '" style="width:' + w + '%"></div></div>';
  }

  function catChip(catId) {
    var cat = H.categoryById(catId);
    if (!cat) return '<span class="chip">Income</span>';
    return '<span class="chip" style="--chip:' + cat.color + '">' + esc(cat.name) + '</span>';
  }

  function savingsRing(saved, target) {
    var pct = target > 0 ? saved / target : 0;
    var shown = Math.min(1, pct);
    var r = 52, c = 2 * Math.PI * r;
    var dash = (shown * c).toFixed(1);
    return '<svg class="ring" viewBox="0 0 130 130" role="img" aria-label="Savings progress ' +
      Math.round(pct * 100) + ' percent">' +
      '<circle cx="65" cy="65" r="' + r + '" fill="none" stroke="#e7dfcf" stroke-width="11"/>' +
      '<circle cx="65" cy="65" r="' + r + '" fill="none" stroke="#1e5631" stroke-width="11" ' +
      'stroke-linecap="round" stroke-dasharray="' + dash + ' ' + c.toFixed(1) + '" ' +
      'transform="rotate(-90 65 65)"/>' +
      '<text x="65" y="60" text-anchor="middle" class="ring-pct">' + Math.round(pct * 100) + '%</text>' +
      '<text x="65" y="80" text-anchor="middle" class="ring-sub">of target</text></svg>';
  }

  // ---- Dashboard ------------------------------------------------------

  function renderDashboard() {
    var s = H.summary();
    var seed = H.seed;
    var list = H.transactions();
    var recent = list.slice().reverse().slice(0, 8);
    var unpaid = H.bills().filter(function (b) { return !b.paid; })
      .sort(function (a, b) { return a.due < b.due ? -1 : 1; });
    var plan = H.planned();

    var alerts = seed.categories.map(function (cat) {
      var spent = s.byCat[cat.id];
      var p = plan[cat.id] > 0 ? spent / plan[cat.id] : 0;
      return { cat: cat, spent: spent, pct: p };
    }).filter(function (a) { return a.pct >= 0.8; })
      .sort(function (a, b) { return b.pct - a.pct; });

    var bars = seed.categories.map(function (cat) {
      var spent = s.byCat[cat.id];
      var p = plan[cat.id] > 0 ? spent / plan[cat.id] : 0;
      var over = spent > plan[cat.id];
      return '<div class="cat-row">' +
        '<div class="cat-label"><span class="dot" style="background:' + cat.color + '"></span>' +
        esc(cat.name) + '</div>' +
        '<div class="cat-bar">' + pctBar(p * 100, over) + '</div>' +
        '<div class="cat-nums"><strong>' + H.money(spent) + '</strong> of ' + H.money(plan[cat.id]) + '</div>' +
        '</div>';
    }).join('');

    var alertHtml = alerts.length === 0
      ? '<p class="muted">Every category is comfortably within budget. Nice work.</p>'
      : alerts.map(function (a) {
          var over = a.spent > plan[a.cat.id];
          var text = over
            ? 'Over budget by ' + H.money(a.spent - plan[a.cat.id]) + ' — worth a look before the month ends.'
            : Math.round(a.pct * 100) + '% of its budget used, with 4 days left in the month.';
          return '<li class="' + (over ? 'alert-over' : '') + '"><strong>' + esc(a.cat.name) +
            '</strong> — ' + text + '</li>';
        }).join('');

    var billHtml = unpaid.slice(0, 4).map(function (b) {
      var overdue = b.due < seed.household.today;
      return '<li><span>' + esc(b.name) + ' <em>' + (overdue ? 'overdue, due ' : 'due ') +
        H.formatDateShort(b.due) + '</em></span><strong>' + H.money(b.amount) + '</strong></li>';
    }).join('');

    var txHtml = recent.map(function (t) {
      var sign = t.type === 'income' ? '+' : '−';
      return '<li><span class="tx-date">' + H.formatDateShort(t.date) + '</span>' +
        '<span class="tx-desc">' + esc(t.desc) + '</span>' + catChip(t.category) +
        '<strong class="' + t.type + '">' + sign + H.money(t.amount) + '</strong></li>';
    }).join('');

    return '<section class="hero">' +
      '<div><p class="eyebrow">' + esc(seed.household.monthLabel) + ' · ' + esc(seed.household.members) + '</p>' +
      '<h1>November at a glance</h1>' +
      '<p class="lede">The Alvarez household has ' + H.money(s.left) + ' left from ' + H.money(s.income) +
      ' of income, with ' + H.money(s.plannedLeft) + ' of the plan still unspent.</p></div>' +
      '<div class="ring-wrap">' + savingsRing(s.saved, s.savingsTarget) +
      '<p><strong>' + H.money(s.saved) + ' saved</strong><br>November target ' + H.money(s.savingsTarget) +
      (s.saved >= s.savingsTarget ? ' — target reached.' : '.') + '</p></div></section>' +

      '<section class="stat-grid">' +
      '<div class="stat"><span>Income</span><strong>' + H.money(s.income) + '</strong><em>Salaries $5,200 + freelance $650</em></div>' +
      '<div class="stat"><span>Spent so far</span><strong>' + H.money(s.spent) + '</strong><em>' +
      Math.round(s.spent / s.plannedTotal * 100) + '% of the ' + H.money(s.plannedTotal) + ' plan</em></div>' +
      '<div class="stat"><span>Left</span><strong>' + H.money(s.left) + '</strong><em>' +
      H.money(s.plannedLeft) + ' of planned spending remains</em></div>' +
      '<div class="stat"><span>Set aside for goals</span><strong>' + H.money(s.setAside) + '</strong><em>' +
      H.money(s.available) + ' still available to move</em></div></section>' +

      '<div class="two-col"><section class="card"><h2>Spending by category</h2>' + bars +
      '<p class="card-link"><a href="#/budget">See the full budget →</a></p></section>' +

      '<section class="card"><h2>Budget alerts</h2><ul class="alerts">' + alertHtml + '</ul>' +
      '<h2 class="subhead">Upcoming bills</h2><ul class="bills-mini">' + billHtml + '</ul>' +
      '<p class="card-link"><a href="#/bills">All bills →</a></p></section></div>' +

      '<section class="card"><h2>Recent transactions</h2><ul class="tx-list">' + txHtml + '</ul>' +
      '<p class="card-link"><a href="#/transactions">All transactions →</a></p></section>';
  }

  // ---- Transactions ---------------------------------------------------

  function txRow(t) {
    var sign = t.type === 'income' ? '+' : '−';
    return '<tr data-id="' + esc(t.id) + '">' +
      '<td>' + H.formatDate(t.date) + '</td>' +
      '<td>' + esc(t.desc) + '</td>' +
      '<td>' + catChip(t.category) + '</td>' +
      '<td class="num ' + t.type + '">' + sign + H.money(t.amount) + '</td>' +
      '<td class="num">' + H.money(t.balance) + '</td>' +
      '<td class="row-actions"><button type="button" class="btn-small" data-edit="' + esc(t.id) + '">Edit</button> ' +
      '<button type="button" class="btn-small danger" data-delete="' + esc(t.id) + '">Delete</button></td></tr>';
  }

  function renderTransactions(query) {
    var all = H.withBalance(H.transactions());
    var q = (query.get('q') || '').trim().toLowerCase();
    var cat = query.get('cat') || 'all';
    var type = query.get('type') || 'all';
    var month = query.get('month') || 'all';

    var filtered = all.filter(function (t) {
      if (q && t.desc.toLowerCase().indexOf(q) === -1 &&
          (H.categoryById(t.category) || { name: 'Income' }).name.toLowerCase().indexOf(q) === -1) return false;
      if (cat !== 'all' && t.category !== cat) return false;
      if (type !== 'all' && t.type !== type) return false;
      if (month !== 'all' && t.date.slice(0, 7) !== month) return false;
      return true;
    }).reverse();

    var rows = filtered.length === 0
      ? '<tr><td colspan="6" class="empty">No transactions match these filters. Try clearing the search.</td></tr>'
      : filtered.map(txRow).join('');

    var options = H.seed.categories.map(function (c) {
      return '<option value="' + c.id + '"' + (cat === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>';
    }).join('');

    var editId = query.get('edit') || '';
    var editing = editId ? all.find(function (t) { return t.id === editId; }) : null;

    var form = '<form id="tx-form" class="form-card">' +
      '<h3>' + (editing ? 'Edit transaction' : 'Add a transaction') + '</h3>' +
      '<input type="hidden" name="editId" value="' + esc(editId) + '">' +
      '<label>Date <input type="date" name="date" required value="' + (editing ? editing.date : H.seed.household.today) + '"></label>' +
      '<label>Description <input type="text" name="desc" required maxlength="80" placeholder="e.g. Weekly shop — GreenMart" value="' + (editing ? esc(editing.desc) : '') + '"></label>' +
      '<label>Category <select name="category">' +
      H.seed.categories.map(function (c) {
        return '<option value="' + c.id + '"' + (editing && editing.category === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>';
      }).join('') + '</select></label>' +
      '<label>Amount (USD) <input type="number" name="amount" required min="0.01" step="0.01" placeholder="0.00" value="' + (editing ? editing.amount : '') + '"></label>' +
      '<label>Type <select name="type">' +
      '<option value="expense"' + (!editing || editing.type === 'expense' ? ' selected' : '') + '>Expense</option>' +
      '<option value="income"' + (editing && editing.type === 'income' ? ' selected' : '') + '>Income</option>' +
      '</select></label>' +
      '<div class="form-actions"><button type="submit" class="btn">' + (editing ? 'Save changes' : 'Add transaction') + '</button>' +
      (editing ? ' <a class="btn ghost" href="#/transactions">Cancel</a>' : '') + '</div></form>';

    return '<h1>Transactions</h1>' +
      '<p class="lede">Every dollar in and out in November. Add, edit or delete a row — the dashboard, budget and reports update at once.</p>' +
      '<section class="filters">' +
      '<label>Search <input type="search" id="f-q" placeholder="Search description or category" value="' + esc(query.get('q') || '') + '"></label>' +
      '<label>Category <select id="f-cat"><option value="all">All categories</option>' + options + '</select></label>' +
      '<label>Type <select id="f-type"><option value="all"' + (type === 'all' ? ' selected' : '') + '>All</option>' +
      '<option value="income"' + (type === 'income' ? ' selected' : '') + '>Income</option>' +
      '<option value="expense"' + (type === 'expense' ? ' selected' : '') + '>Expense</option></select></label>' +
      '<label>Month <select id="f-month"><option value="all">All months</option>' +
      '<option value="2026-11"' + (month === '2026-11' ? ' selected' : '') + '>November 2026</option></select></label>' +
      '</section>' +
      '<p class="result-count">' + filtered.length + ' of ' + all.length + ' transactions</p>' +
      '<div class="table-wrap"><table class="tx-table"><thead><tr>' +
      '<th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th class="num">Balance</th><th></th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' + form;
  }

  // ---- Budget ---------------------------------------------------------

  function renderBudget() {
    var s = H.summary();
    var plan = H.planned();
    var cards = H.seed.categories.map(function (cat) {
      var spent = s.byCat[cat.id];
      var p = plan[cat.id] > 0 ? spent / plan[cat.id] : 0;
      var over = spent > plan[cat.id];
      var remaining = plan[cat.id] - spent;
      var label = over
        ? 'Over by ' + H.money(-remaining)
        : H.money(remaining) + ' left';
      return '<article class="budget-card' + (over ? ' over' : '') + '">' +
        '<header><span class="dot" style="background:' + cat.color + '"></span><h3>' + esc(cat.name) + '</h3>' +
        '<span class="pct">' + Math.round(p * 100) + '%</span></header>' +
        pctBar(p * 100, over) +
        '<p class="budget-nums"><strong>' + H.money(spent) + '</strong> spent of ' + H.money(plan[cat.id]) + ' planned</p>' +
        '<p class="budget-left ' + (over ? 'over-text' : '') + '">' + label + '</p>' +
        '<form class="plan-form" data-cat="' + cat.id + '">' +
        '<label>Planned <input type="number" name="planned" min="0" step="1" value="' + plan[cat.id] + '" aria-label="Planned amount for ' + esc(cat.name) + '"> <button type="submit" class="btn-small">Save</button></label>' +
        '</form></article>';
    }).join('');

    var needs = 0, wants = 0;
    H.seed.categories.forEach(function (cat) {
      if (cat.group === 'needs') needs += plan[cat.id];
      else wants += plan[cat.id];
    });
    var income = s.income;
    var needsPct = income ? Math.round(needs / income * 100) : 0;
    var wantsPct = income ? Math.round(wants / income * 100) : 0;
    var savePct = income ? Math.round(H.seed.household.savingsTarget / income * 100) : 0;
    var ruleNote = needsPct > 50
      ? 'Needs run above the 50% guideline, mostly because housing is ' + H.money(plan.housing) +
        ' of ' + H.money(income) + ' income. That leaves less room for wants — the household keeps wants tight at ' +
        wantsPct + '% instead of cutting essentials.'
      : 'Needs sit inside the 50% guideline, which leaves comfortable room for wants and saving.';

    return '<h1>Budget — November 2026</h1>' +
      '<p class="lede">Planned spending ' + H.money(s.plannedTotal) + ' against ' + H.money(s.income) +
      ' of income, leaving ' + H.money(s.savingsTarget) + ' for saving. Edit any planned amount — it sticks.</p>' +
      '<div class="budget-grid">' + cards + '</div>' +
      '<section class="card rule"><h2>The 50/30/20 rule, for this household</h2>' +
      '<p>A common guideline splits take-home pay into 50% needs, 30% wants and 20% saving. ' +
      'Here is how the Alvarez plan actually splits ' + H.money(income) + ' of November income:</p>' +
      '<div class="split-bar" role="img" aria-label="Needs ' + needsPct + ' percent, wants ' + wantsPct + ' percent, saving ' + savePct + ' percent">' +
      '<div class="split-needs" style="width:' + needsPct + '%"></div>' +
      '<div class="split-wants" style="width:' + wantsPct + '%"></div>' +
      '<div class="split-save" style="width:' + savePct + '%"></div></div>' +
      '<ul class="split-legend">' +
      '<li><span class="dot" style="background:#1e5631"></span>Needs — ' + H.money(needs) + ' (' + needsPct + '%)</li>' +
      '<li><span class="dot" style="background:#d97706"></span>Wants — ' + H.money(wants) + ' (' + wantsPct + '%)</li>' +
      '<li><span class="dot" style="background:#4a90a4"></span>Saving — ' + H.money(H.seed.household.savingsTarget) + ' (' + savePct + '%)</li></ul>' +
      '<p>' + ruleNote + '</p></section>';
  }

  // ---- Goals ------------------------------------------------------------

  function renderGoals() {
    var s = H.summary();
    var cards = H.goals().map(function (g) {
      var pct = g.target > 0 ? g.saved / g.target : 0;
      var months = H.monthsBetween(H.seed.household.today, g.targetDate);
      var monthly = Math.max(0, (g.target - g.saved) / months);
      return '<article class="goal-card"><h3>' + esc(g.name) + '</h3>' +
        '<p class="muted">' + esc(g.note) + '</p>' +
        '<p class="goal-nums"><strong>' + H.money(g.saved) + '</strong> of ' + H.money(g.target) +
        ' <span class="pct">' + Math.round(pct * 100) + '%</span></p>' +
        pctBar(pct * 100, false) +
        '<p class="goal-meta">Target date ' + H.formatDate(g.targetDate) + ' · ' +
        (g.saved >= g.target ? 'Goal reached — nicely done.'
          : 'Save <strong>' + H.money(monthly) + ' / month</strong> to reach it on time.') + '</p>' +
        '<form class="goal-form" data-goal="' + g.id + '">' +
        '<label>Add money <input type="number" name="amount" min="1" step="1" placeholder="25" required aria-label="Amount to add to ' + esc(g.name) + '"> <button type="submit" class="btn-small">Add to goal</button></label>' +
        '</form></article>';
    }).join('');

    var totalSaved = H.goals().reduce(function (sum, g) { return sum + g.saved; }, 0);
    var totalTarget = H.goals().reduce(function (sum, g) { return sum + g.target; }, 0);

    return '<h1>Savings goals</h1>' +
      '<p class="lede">' + H.money(totalSaved) + ' saved across ' + H.goals().length + ' goals, of ' +
      H.money(totalTarget) + ' in total. Adding money moves it out of the ' + H.money(s.available) +
      ' available this month and into the goal.</p>' +
      '<div class="goal-grid">' + cards + '</div>' +
      '<section class="card"><h2>How adding money works</h2>' +
      '<p>Money added to a goal comes from November’s leftover cash — income minus spending, ' +
      H.money(s.left) + ' right now, of which ' + H.money(s.setAside) + ' is already set aside. ' +
      'The dashboard’s “set aside for goals” figure moves with every addition, and the goals keep their ' +
      'balances even if you close the page.</p></section>';
  }

  // ---- Reports ----------------------------------------------------------

  function weeklyChart(weeks) {
    var max = Math.max.apply(null, weeks.map(function (w) { return w.total; }).concat([1]));
    var width = 640, height = 220, base = 190, top = 20;
    var bw = 90, gap = (width - bw * weeks.length) / (weeks.length + 1);
    var bars = weeks.map(function (w, i) {
      var h = Math.max(2, (w.total / max) * (base - top));
      var x = gap + i * (bw + gap);
      var y = base - h;
      return '<rect x="' + x.toFixed(0) + '" y="' + y.toFixed(0) + '" width="' + bw + '" height="' + h.toFixed(0) +
        '" rx="6" fill="#1e5631"/>' +
        '<text x="' + (x + bw / 2).toFixed(0) + '" y="' + (y - 8).toFixed(0) + '" text-anchor="middle" class="chart-val">' +
        H.money0(w.total) + '</text>' +
        '<text x="' + (x + bw / 2).toFixed(0) + '" y="' + (base + 20).toFixed(0) + '" text-anchor="middle" class="chart-label">' +
        esc(w.label) + '</text>';
    }).join('');
    return '<svg class="chart" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Spending per week bar chart">' + bars + '</svg>';
  }

  function renderReports() {
    var s = H.summary();
    var seed = H.seed;
    var list = H.transactions().filter(function (t) { return t.type === 'expense'; });

    var weeks = [
      { label: 'Nov 1–7', from: '2026-11-01', to: '2026-11-07', total: 0 },
      { label: 'Nov 8–14', from: '2026-11-08', to: '2026-11-14', total: 0 },
      { label: 'Nov 15–21', from: '2026-11-15', to: '2026-11-21', total: 0 },
      { label: 'Nov 22–26', from: '2026-11-22', to: '2026-11-26', total: 0 }
    ];
    list.forEach(function (t) {
      weeks.forEach(function (w) {
        if (t.date >= w.from && t.date <= w.to) w.total += t.amount;
      });
    });

    var rows = seed.categories.map(function (cat) {
      var nov = s.byCat[cat.id];
      var oct = seed.october.spentByCategory[cat.id] || 0;
      var diff = nov - oct;
      var cls = diff > 0 ? 'up' : 'down';
      var arrow = diff > 0 ? '▲' : (diff < 0 ? '▼' : '—');
      return '<tr><td>' + esc(cat.name) + '</td><td class="num">' + H.money(nov) + '</td>' +
        '<td class="num">' + H.money(oct) + '</td>' +
        '<td class="num ' + cls + '">' + arrow + ' ' + H.money(Math.abs(diff)) + '</td></tr>';
    }).join('');

    var octTotal = Object.keys(seed.october.spentByCategory).reduce(function (sum, k) { return sum + seed.october.spentByCategory[k]; }, 0);
    var totalDiff = s.spent - octTotal;

    var biggest = list.slice().sort(function (a, b) { return b.amount - a.amount; }).slice(0, 5);
    var biggestHtml = biggest.map(function (t) {
      return '<li><span>' + esc(t.desc) + ' <em>' + H.formatDateShort(t.date) + '</em></span><strong>' + H.money(t.amount) + '</strong></li>';
    }).join('');

    var share = seed.categories.map(function (cat) {
      var sharePct = s.spent > 0 ? s.byCat[cat.id] / s.spent * 100 : 0;
      return { cat: cat, pct: sharePct };
    }).sort(function (a, b) { return b.pct - a.pct; }).slice(0, 5);
    var shareHtml = share.map(function (x) {
      return '<div class="cat-row"><div class="cat-label"><span class="dot" style="background:' + x.cat.color + '"></span>' +
        esc(x.cat.name) + '</div><div class="cat-bar">' + pctBar(x.pct, false) + '</div>' +
        '<div class="cat-nums"><strong>' + x.pct.toFixed(1) + '%</strong></div></div>';
    }).join('');

    // Tips computed from the data, not written by hand.
    var tips = [];
    var over = seed.categories.filter(function (cat) { return s.byCat[cat.id] > H.planned()[cat.id]; });
    if (over.length > 0) {
      var worst = over.sort(function (a, b) { return (s.byCat[b.id] - H.planned()[b.id]) - (s.byCat[a.id] - H.planned()[a.id]); })[0];
      tips.push('Dining Out is ' + H.money(s.byCat[worst.id] - H.planned()[worst.id]) + ' over its ' +
        H.money(H.planned()[worst.id]) + ' plan. Cooking two more dinners at home this week would bring it back inside the plan.');
    }
    var topCat = share[0];
    tips.push('Housing is the biggest slice at ' + topCat.pct.toFixed(0) + '% of spending — ' +
      'it is fixed for now, so the quickest wins are in the flexible categories below it.');
    if (totalDiff < 0) {
      tips.push('November spending is ' + H.money(-totalDiff) + ' below October. Keep the gap: ' +
        'moving even ' + H.money(50) + ' of it to the emergency fund would put that goal a month ahead.');
    } else {
      tips.push('November spending is ' + H.money(totalDiff) + ' above October. The Budget page shows exactly which categories moved.');
    }
    var tipsHtml = tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');

    return '<h1>Reports — November vs October</h1>' +
      '<p class="lede">November spending so far is <strong>' + H.money(s.spent) + '</strong>, against ' +
      H.money(octTotal) + ' in all of October — ' + (totalDiff < 0 ? H.money(-totalDiff) + ' less' : H.money(totalDiff) + ' more') +
      ' with four days of the month still to go.</p>' +
      '<section class="card"><h2>Spending per week</h2>' + weeklyChart(weeks) +
      '<p class="muted">Week 1 carries the rent payment, which is why it towers over the rest.</p></section>' +
      '<div class="two-col"><section class="card"><h2>November vs October</h2>' +
      '<div class="table-wrap"><table class="tx-table"><thead><tr><th>Category</th><th class="num">Nov</th><th class="num">Oct</th><th class="num">Change</th></tr></thead>' +
      '<tbody>' + rows + '<tr class="total-row"><td><strong>Total</strong></td><td class="num"><strong>' + H.money(s.spent) +
      '</strong></td><td class="num"><strong>' + H.money(octTotal) + '</strong></td>' +
      '<td class="num ' + (totalDiff > 0 ? 'up' : 'down') + '"><strong>' + (totalDiff > 0 ? '▲ ' : '▼ ') + H.money(Math.abs(totalDiff)) + '</strong></td></tr>' +
      '</tbody></table></div></section>' +
      '<section class="card"><h2>Biggest expenses</h2><ul class="bills-mini">' + biggestHtml + '</ul>' +
      '<h2 class="subhead">Where the money went</h2>' + shareHtml + '</section></div>' +
      '<section class="card"><h2>Where the money went, in plain words</h2>' +
      '<p>Most of November’s money went on the fixed costs of running the house: rent, groceries and the school ' +
      'fees together are more than half of everything spent. The flexible spending — eating out, fun and ' +
      'subscriptions — is a much smaller slice, which is why a small change there moves the total only a little, ' +
      'while one big fixed cost moves it a lot.</p><ol class="tips">' + tipsHtml + '</ol></section>';
  }

  // ---- Bills ------------------------------------------------------------

  function renderBills() {
    var seed = H.seed;
    var all = H.bills().slice().sort(function (a, b) { return a.due < b.due ? -1 : 1; });
    var unpaid = all.filter(function (b) { return !b.paid; });
    var paid = all.filter(function (b) { return b.paid; });
    var unpaidTotal = unpaid.reduce(function (sum, b) { return sum + b.amount; }, 0);

    function billItem(b) {
      var overdue = !b.paid && b.due < seed.household.today;
      return '<li class="' + (overdue ? 'overdue' : '') + '"><div><strong>' + esc(b.name) + '</strong>' +
        '<em>' + (overdue ? 'Overdue — was due ' : 'Due ') + H.formatDate(b.due) + '</em></div>' +
        '<strong>' + H.money(b.amount) + '</strong>' +
        (b.paid
          ? '<button type="button" class="btn-small ghost" data-unpay="' + b.id + '">Mark unpaid</button>'
          : '<button type="button" class="btn-small" data-pay="' + b.id + '">Mark paid</button>') +
        '</li>';
    }

    return '<h1>Bills</h1>' +
      '<p class="lede">' + H.money(unpaidTotal) + ' still to pay in November, across ' + unpaid.length +
      ' bills. Marking one paid records the payment as a transaction, so the totals stay honest.</p>' +
      '<section class="card"><h2>Still to pay</h2>' +
      (unpaid.length === 0
        ? '<p class="muted">Everything is paid for November. Enjoy the quiet.</p>'
        : '<ul class="bill-list">' + unpaid.map(billItem).join('') + '</ul>') + '</section>' +
      '<section class="card"><h2>Paid</h2>' +
      '<ul class="bill-list">' + paid.map(billItem).join('') + '</ul></section>';
  }

  global.HearthViews = {
    renderDashboard: renderDashboard,
    renderTransactions: renderTransactions,
    renderBudget: renderBudget,
    renderGoals: renderGoals,
    renderReports: renderReports,
    renderBills: renderBills,
    esc: esc
  };
})(window);
