// Hearth — seed data for the Alvarez household, November 2026.
// Every figure on every page is derived from these records, so the
// dashboard, budget bars, goals and reports always agree with each other.
(function (global) {
  'use strict';

  var SEED = {
    household: {
      name: 'The Alvarez Family',
      members: '2 adults + 2 kids',
      month: 'November 2026',
      monthLabel: 'November 2026',
      currency: 'USD',
      savingsTarget: 750,
      monthStart: '2026-11-01',
      today: '2026-11-26'
    },

    // Planned monthly budget per category. Needs / wants follow the
    // 50/30/20 rule groups; the split is computed live on the Budget page.
    categories: [
      { id: 'housing',       name: 'Housing',       planned: 1950, group: 'needs', color: '#1e5631' },
      { id: 'groceries',    name: 'Groceries',     planned: 780,  group: 'needs', color: '#2f7d4f' },
      { id: 'utilities',    name: 'Utilities',     planned: 340,  group: 'needs', color: '#4a90a4' },
      { id: 'transport',    name: 'Transport',     planned: 450,  group: 'needs', color: '#6b7fa3' },
      { id: 'kids',         name: 'Kids & School', planned: 520,  group: 'needs', color: '#8a6fb8' },
      { id: 'health',       name: 'Health',        planned: 280,  group: 'needs', color: '#b85c7a' },
      { id: 'dining',       name: 'Dining Out',    planned: 320,  group: 'wants', color: '#c2410c' },
      { id: 'fun',          name: 'Fun',           planned: 310,  group: 'wants', color: '#d97706' },
      { id: 'subscriptions',name: 'Subscriptions', planned: 150,  group: 'wants', color: '#78716c' }
    ],

    // Real November transactions, newest last. Amounts are dollars;
    // type is 'income' or 'expense'. Category ids match `categories`.
    transactions: [
      { id: 't01', date: '2026-11-01', desc: 'Salary — Maya Alvarez', category: 'income', amount: 2600, type: 'income' },
      { id: 't02', date: '2026-11-01', desc: 'Rent — Maple Court Apt 4B', category: 'housing', amount: 1850, type: 'expense' },
      { id: 't03', date: '2026-11-01', desc: 'Monthly transit pass', category: 'transport', amount: 120, type: 'expense' },
      { id: 't04', date: '2026-11-02', desc: 'Vitamins & first aid', category: 'health', amount: 28.40, type: 'expense' },
      { id: 't05', date: '2026-11-02', desc: 'Weekly shop — GreenMart', category: 'groceries', amount: 96.40, type: 'expense' },
      { id: 't06', date: '2026-11-03', desc: 'Fuel — Shell Station', category: 'transport', amount: 52.40, type: 'expense' },
      { id: 't07', date: '2026-11-03', desc: 'Music streaming — TuneWave', category: 'subscriptions', amount: 10.99, type: 'expense' },
      { id: 't08', date: '2026-11-04', desc: 'School fees — Lincoln Elementary', category: 'kids', amount: 280, type: 'expense' },
      { id: 't09', date: '2026-11-05', desc: 'Electric bill — City Power', category: 'utilities', amount: 142.18, type: 'expense' },
      { id: 't10', date: '2026-11-05', desc: 'Meal planning app — CookBook Pro', category: 'subscriptions', amount: 9.99, type: 'expense' },
      { id: 't11', date: '2026-11-06', desc: 'Weekly shop — GreenMart', category: 'groceries', amount: 128.75, type: 'expense' },
      { id: 't12', date: '2026-11-06', desc: 'Cloud storage — CloudBox', category: 'subscriptions', amount: 9.99, type: 'expense' },
      { id: 't13', date: '2026-11-07', desc: 'Pharmacy — City Drugstore', category: 'health', amount: 44.80, type: 'expense' },
      { id: 't14', date: '2026-11-07', desc: 'Pizza night — Tony’s', category: 'dining', amount: 38.50, type: 'expense' },
      { id: 't15', date: '2026-11-08', desc: 'School supplies — Office Depot', category: 'kids', amount: 74.60, type: 'expense' },
      { id: 't16', date: '2026-11-08', desc: 'Movie night — Cinema City', category: 'fun', amount: 46, type: 'expense' },
      { id: 't17', date: '2026-11-09', desc: 'Lunch — Corner Deli', category: 'dining', amount: 18.90, type: 'expense' },
      { id: 't18', date: '2026-11-09', desc: 'News subscription — Daily Post', category: 'subscriptions', amount: 12, type: 'expense' },
      { id: 't19', date: '2026-11-10', desc: 'Weekly shop — GreenMart', category: 'groceries', amount: 84.20, type: 'expense' },
      { id: 't20', date: '2026-11-10', desc: 'Internet — Northbeam Fiber', category: 'utilities', amount: 89, type: 'expense' },
      { id: 't21', date: '2026-11-11', desc: 'Fuel — Shell Station', category: 'transport', amount: 48.75, type: 'expense' },
      { id: 't22', date: '2026-11-12', desc: 'Water bill — City Water', category: 'utilities', amount: 67.45, type: 'expense' },
      { id: 't23', date: '2026-11-12', desc: 'Board game — Toy Barn', category: 'fun', amount: 32.50, type: 'expense' },
      { id: 't24', date: '2026-11-13', desc: 'Dentist check-up — Dr. Patel', category: 'health', amount: 120, type: 'expense' },
      { id: 't25', date: '2026-11-13', desc: 'Sushi dinner — Sakura House', category: 'dining', amount: 64.20, type: 'expense' },
      { id: 't26', date: '2026-11-14', desc: 'Weekly shop — GreenMart', category: 'groceries', amount: 142.60, type: 'expense' },
      { id: 't27', date: '2026-11-14', desc: 'Home repair — leaking tap', category: 'housing', amount: 64, type: 'expense' },
      { id: 't28', date: '2026-11-14', desc: 'Fitness app — FitTrack', category: 'subscriptions', amount: 14.99, type: 'expense' },
      { id: 't29', date: '2026-11-15', desc: 'Salary — Daniel Alvarez', category: 'income', amount: 2600, type: 'income' },
      { id: 't30', date: '2026-11-15', desc: 'Sunday brunch — The Garden Café', category: 'dining', amount: 52.75, type: 'expense' },
      { id: 't31', date: '2026-11-15', desc: 'Parking — downtown garage', category: 'transport', amount: 36, type: 'expense' },
      { id: 't32', date: '2026-11-16', desc: 'Soccer club fees — Mia', category: 'kids', amount: 120, type: 'expense' },
      { id: 't33', date: '2026-11-17', desc: 'Concert tickets — The Rivals', category: 'fun', amount: 110, type: 'expense' },
      { id: 't34', date: '2026-11-17', desc: 'Photo backup — SnapVault', category: 'subscriptions', amount: 4.99, type: 'expense' },
      { id: 't35', date: '2026-11-18', desc: 'Weekly shop — GreenMart', category: 'groceries', amount: 76.90, type: 'expense' },
      { id: 't36', date: '2026-11-19', desc: 'Gas bill — City Gas', category: 'utilities', amount: 38.60, type: 'expense' },
      { id: 't37', date: '2026-11-19', desc: 'Takeout Thai — Bangkok Kitchen', category: 'dining', amount: 41.60, type: 'expense' },
      { id: 't38', date: '2026-11-20', desc: 'Freelance design — logo project', category: 'income', amount: 650, type: 'income' },
      { id: 't39', date: '2026-11-20', desc: 'Fuel — Shell Station', category: 'transport', amount: 55.20, type: 'expense' },
      { id: 't40', date: '2026-11-20', desc: 'File storage — StoreIt', category: 'subscriptions', amount: 6.99, type: 'expense' },
      { id: 't41', date: '2026-11-21', desc: 'School books — Leo', category: 'kids', amount: 42.30, type: 'expense' },
      { id: 't42', date: '2026-11-21', desc: 'Taco truck — family dinner', category: 'dining', amount: 29.40, type: 'expense' },
      { id: 't43', date: '2026-11-22', desc: 'Weekly shop — GreenMart', category: 'groceries', amount: 118.35, type: 'expense' },
      { id: 't44', date: '2026-11-22', desc: 'Movie rental — StreamPlus', category: 'fun', amount: 12.99, type: 'expense' },
      { id: 't45', date: '2026-11-23', desc: 'Antivirus — SafeNet', category: 'subscriptions', amount: 8.99, type: 'expense' },
      { id: 't46', date: '2026-11-23', desc: 'Date night — Bistro Verde', category: 'dining', amount: 86, type: 'expense' },
      { id: 't47', date: '2026-11-24', desc: 'Car wash — Sparkle Auto', category: 'transport', amount: 18, type: 'expense' },
      { id: 't48', date: '2026-11-24', desc: 'Mini golf — family outing', category: 'fun', amount: 38, type: 'expense' },
      { id: 't49', date: '2026-11-25', desc: 'Weekly shop — GreenMart', category: 'groceries', amount: 54.80, type: 'expense' },
      { id: 't50', date: '2026-11-25', desc: 'Coffee & pastries — Bean House', category: 'dining', amount: 24.80, type: 'expense' },
      { id: 't51', date: '2026-11-26', desc: 'Arcade afternoon — Leo & Mia', category: 'fun', amount: 24.50, type: 'expense' },
      { id: 't52', date: '2026-11-26', desc: 'Kids learning app — BrightKids', category: 'subscriptions', amount: 19.99, type: 'expense' }
    ],

    // Savings goals. `saved` is the lifetime balance in the goal;
    // `targetDate` drives the monthly-contribution figure on the Goals page.
    goals: [
      { id: 'emergency', name: 'Emergency fund', saved: 4200, target: 6000, targetDate: '2027-03-31', note: 'Six months of essential costs, for the unexpected.' },
      { id: 'holiday',   name: 'Family holiday', saved: 1150, target: 2000, targetDate: '2027-06-30', note: 'A week by the coast next summer — flights, stay and food.' },
      { id: 'fridge',    name: 'New fridge',     saved: 380,  target: 900,  targetDate: '2027-01-31', note: 'The old one hums louder every month. Time to replace it.' }
    ],

    // Bills. Paid ones match a transaction above; unpaid ones can be
    // marked paid, which records the matching transaction dated today.
    bills: [
      { id: 'b01', name: 'Rent — Maple Court Apt 4B', amount: 1850, due: '2026-11-01', paid: true,  category: 'housing', txId: 't02' },
      { id: 'b02', name: 'Electric — City Power', amount: 142.18, due: '2026-11-05', paid: true, category: 'utilities', txId: 't09' },
      { id: 'b03', name: 'Internet — Northbeam Fiber', amount: 89, due: '2026-11-10', paid: true, category: 'utilities', txId: 't20' },
      { id: 'b04', name: 'Water — City Water', amount: 67.45, due: '2026-11-12', paid: true, category: 'utilities', txId: 't22' },
      { id: 'b05', name: 'Phone — Mobile plan', amount: 64, due: '2026-11-18', paid: false, category: 'utilities', txId: null },
      { id: 'b06', name: 'Car insurance — SafeDrive', amount: 132.50, due: '2026-11-22', paid: false, category: 'transport', txId: null },
      { id: 'b07', name: 'Gym — FitLife', amount: 55, due: '2026-11-25', paid: false, category: 'health', txId: null },
      { id: 'b08', name: 'Streaming — StreamPlus', amount: 15.99, due: '2026-11-28', paid: false, category: 'subscriptions', txId: null },
      { id: 'b09', name: 'Credit card — minimum payment', amount: 210, due: '2026-11-30', paid: false, category: 'housing', txId: null }
    ],

    // October totals, for the Reports comparison (no per-transaction
    // history is kept for October — the comparison uses these totals).
    october: {
      income: 5800,
      spentByCategory: {
        housing: 1925, groceries: 745, utilities: 318, transport: 402,
        kids: 488, health: 265, dining: 342, fun: 228, subscriptions: 148
      }
    }
  };

  global.HEARTH_SEED = SEED;
})(window);
