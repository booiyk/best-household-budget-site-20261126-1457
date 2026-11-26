// Hearth — state and derived figures.
// Loads the seed from data.js, layers the household's own edits on top
// (kept in localStorage under one key), and derives every total the pages
// show, so all pages always agree.
(function (global) {
  'use strict';

  var KEY = 'hearth-state-v1';
  var seed = global.HEARTH_SEED;

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function loadOverrides() {
    try {
      var raw = global.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  var overrides = loadOverrides();

  function saveOverrides() {
    try { global.localStorage.setItem(KEY, JSON.stringify(overrides)); } catch (e) { /* storage full or blocked */ }
  }

  // ---- current state -------------------------------------------------

  function transactions() {
    var list = clone(seed.transactions);
    (overrides.addedTx || []).forEach(function (tx) { list.push(tx); });
    (overrides.deletedTxIds || []).forEach(function (id) {
      var i = list.findIndex(function (t) { return t.id === id; });
      if (i !== -1) list.splice(i, 1);
    });
    (overrides.editedTx || []).forEach(function (edit) {
      var tx = list.find(function (t) { return t.id === edit.id; });
      if (tx) Object.assign(tx, edit.patch);
    });
    list.sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.id < b.id ? -1 : 1;
    });
    return list;
  }

  function planned() {
    var out = {};
    seed.categories.forEach(function (c) { out[c.id] = c.planned; });
    Object.assign(out, overrides.planned || {});
    return out;
  }

  function goals() {
    var list = clone(seed.goals);
    (overrides.goalAdds || []).forEach(function (add) {
      var g = list.find(function (x) { return x.id === add.id; });
      if (g) g.saved = Math.round((g.saved + add.amount) * 100) / 100;
    });
    return list;
  }

  function bills() {
    var list = clone(seed.bills);
    (overrides.billPaid || []).forEach(function (bp) {
      var b = list.find(function (x) { return x.id === bp.id; });
      if (b) { b.paid = true; b.txId = bp.txId; }
    });
    (overrides.billUnpaid || []).forEach(function (id) {
      var b = list.find(function (x) { return x.id === id; });
      if (b) { b.paid = false; b.txId = null; }
    });
    return list;
  }

  // ---- derived figures ------------------------------------------------

  function money(n) {
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function money0(n) {
    return '$' + Math.round(Number(n)).toLocaleString('en-US');
  }

  function totalIncome(list) {
    return list.reduce(function (s, t) { return t.type === 'income' ? s + t.amount : s; }, 0);
  }

  function totalSpent(list) {
    return list.reduce(function (s, t) { return t.type === 'expense' ? s + t.amount : s; }, 0);
  }

  function spentByCategory(list) {
    var out = {};
    seed.categories.forEach(function (c) { out[c.id] = 0; });
    list.forEach(function (t) {
      if (t.type === 'expense' && out[t.category] !== undefined) out[t.category] += t.amount;
    });
    return out;
  }

  function categoryById(id) {
    return seed.categories.find(function (c) { return c.id === id; }) || null;
  }

  function summary() {
    var list = transactions();
    var income = totalIncome(list);
    var spent = totalSpent(list);
    var byCat = spentByCategory(list);
    var plan = planned();
    var plannedTotal = Object.keys(plan).reduce(function (s, k) { return s + plan[k]; }, 0);
    var setAside = (overrides.goalAdds || []).reduce(function (s, a) { return s + a.amount; }, 0);
    return {
      income: income,
      spent: spent,
      left: income - spent,
      plannedTotal: plannedTotal,
      plannedLeft: plannedTotal - spent,
      byCat: byCat,
      saved: income - spent,
      savingsTarget: seed.household.savingsTarget,
      available: income - spent - setAside,
      setAside: setAside
    };
  }

  // Running balance per transaction, in date order (oldest first).
  function withBalance(list) {
    var bal = 0;
    return list.map(function (t) {
      bal += t.type === 'income' ? t.amount : -t.amount;
      var copy = clone(t);
      copy.balance = Math.round(bal * 100) / 100;
      return copy;
    });
  }

  function monthsBetween(fromDate, toDate) {
    var from = new Date(fromDate + 'T00:00:00');
    var to = new Date(toDate + 'T00:00:00');
    var months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    return Math.max(1, months);
  }

  function formatDate(iso) {
    var parts = iso.split('-');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[Number(parts[1]) - 1] + ' ' + Number(parts[2]) + ', ' + parts[0];
  }

  function formatDateShort(iso) {
    var parts = iso.split('-');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[Number(parts[1]) - 1] + ' ' + Number(parts[2]);
  }

  // ---- mutations (all persist to localStorage) ------------------------

  function nextTxId() {
    var n = (overrides.txCounter || 100) + 1;
    overrides.txCounter = n;
    return 'u' + n;
  }

  function addTransaction(tx) {
    tx.id = nextTxId();
    overrides.addedTx = overrides.addedTx || [];
    overrides.addedTx.push(tx);
    saveOverrides();
    return tx.id;
  }

  function deleteTransaction(id) {
    var seedTx = seed.transactions.some(function (t) { return t.id === id; });
    if (seedTx) {
      overrides.deletedTxIds = overrides.deletedTxIds || [];
      if (overrides.deletedTxIds.indexOf(id) === -1) overrides.deletedTxIds.push(id);
    } else {
      overrides.addedTx = (overrides.addedTx || []).filter(function (t) { return t.id !== id; });
    }
    // A bill paid by this transaction goes back to unpaid.
    overrides.billPaid = (overrides.billPaid || []).filter(function (bp) { return bp.txId !== id; });
    overrides.billUnpaid = overrides.billUnpaid || [];
    seed.bills.forEach(function (b) {
      if (b.txId === id && overrides.billUnpaid.indexOf(b.id) === -1) overrides.billUnpaid.push(b.id);
    });
    saveOverrides();
  }

  function editTransaction(id, patch) {
    var added = (overrides.addedTx || []).find(function (t) { return t.id === id; });
    if (added) { Object.assign(added, patch); saveOverrides(); return; }
    overrides.editedTx = overrides.editedTx || [];
    var existing = overrides.editedTx.find(function (e) { return e.id === id; });
    if (existing) Object.assign(existing.patch, patch);
    else overrides.editedTx.push({ id: id, patch: patch });
    saveOverrides();
  }

  function setPlanned(categoryId, amount) {
    overrides.planned = overrides.planned || {};
    overrides.planned[categoryId] = amount;
    saveOverrides();
  }

  function addToGoal(goalId, amount) {
    overrides.goalAdds = overrides.goalAdds || [];
    overrides.goalAdds.push({ id: goalId, amount: amount });
    saveOverrides();
  }

  function payBill(billId) {
    var bill = bills().find(function (b) { return b.id === billId; });
    if (!bill || bill.paid) return null;
    var tx = {
      date: seed.household.today,
      desc: bill.name + ' — paid',
      category: bill.category,
      amount: bill.amount,
      type: 'expense'
    };
    var txId = addTransaction(tx);
    overrides.billPaid = overrides.billPaid || [];
    overrides.billPaid.push({ id: billId, txId: txId });
    overrides.billUnpaid = (overrides.billUnpaid || []).filter(function (id) { return id !== billId; });
    saveOverrides();
    return txId;
  }

  function unpayBill(billId) {
    var bill = bills().find(function (b) { return b.id === billId; });
    if (!bill || !bill.paid) return;
    if (bill.txId) deleteTransaction(bill.txId);
    var wasSeedPaid = seed.bills.some(function (b) { return b.id === billId && b.paid; });
    if (!wasSeedPaid) {
      overrides.billUnpaid = overrides.billUnpaid || [];
      if (overrides.billUnpaid.indexOf(billId) === -1) overrides.billUnpaid.push(billId);
    }
    overrides.billPaid = (overrides.billPaid || []).filter(function (bp) { return bp.id !== billId; });
    saveOverrides();
  }

  function resetAll() {
    overrides = {};
    try { global.localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  global.Hearth = {
    seed: seed,
    transactions: transactions,
    planned: planned,
    goals: goals,
    bills: bills,
    summary: summary,
    withBalance: withBalance,
    categoryById: categoryById,
    monthsBetween: monthsBetween,
    formatDate: formatDate,
    formatDateShort: formatDateShort,
    money: money,
    money0: money0,
    addTransaction: addTransaction,
    deleteTransaction: deleteTransaction,
    editTransaction: editTransaction,
    setPlanned: setPlanned,
    addToGoal: addToGoal,
    payBill: payBill,
    unpayBill: unpayBill,
    resetAll: resetAll
  };
})(window);
