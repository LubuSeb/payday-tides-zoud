export function billWindow(bill, move) {
  return move?.changeWindow?.bill === bill.id
    ? { first: move.changeWindow.first, last: move.changeWindow.last }
    : { first: bill.first, last: bill.last };
}

export function initialPlan(level) {
  return {
    schedule: Object.fromEntries(level.bills.map((bill) => [bill.id, bill.defaultDay])),
    moveId: level.moves[0].id,
  };
}

export function evaluate(level, plan, stress = false) {
  const move = level.moves.find((item) => item.id === plan.moveId);
  if (!move) throw new Error('Choose a listed move.');
  const entries = Array.from({ length: level.days + 1 }, (_, day) => ({ day, transactions: [], balance: null }));
  const violations = [];
  const add = (day, amount, label, kind) => {
    if (!Number.isInteger(day) || day < 1 || day > level.days || !Number.isFinite(amount)) {
      throw new Error('Invalid game transaction.');
    }
    entries[day].transactions.push({ amount, label, kind });
  };

  for (const item of level.income) {
    add(item.day, stress && Number.isFinite(item.stressAmount) ? item.stressAmount : item.amount, item.label, 'income');
  }
  for (const bill of level.bills) {
    const day = Number(plan.schedule[bill.id]);
    const window = billWindow(bill, move);
    if (!Number.isInteger(day) || day < window.first || day > window.last) {
      violations.push(`${bill.label} must be paid on day ${window.first}${window.first === window.last ? '' : `–${window.last}`}.`);
      continue;
    }
    add(day, -bill.amount, bill.label, 'bill');
  }
  for (const effect of move.effects) add(effect.day, effect.amount, effect.label, 'move');

  let balance = level.opening;
  let lowest = balance;
  const shortDays = [];
  for (let day = 1; day <= level.days; day += 1) {
    // Deposits clear before same-day payments. This rule is visible in the game.
    entries[day].transactions.sort((a, b) => b.amount - a.amount);
    for (const transaction of entries[day].transactions) balance += transaction.amount;
    entries[day].balance = balance;
    lowest = Math.min(lowest, balance);
    if (balance < 0) shortDays.push(day);
  }
  return {
    entries: entries.slice(1),
    opening: level.opening,
    closing: balance,
    lowest,
    shortDays,
    violations,
    fee: move.fee ?? 0,
    tradeoff: move.tradeoff ?? null,
    success: violations.length === 0 && shortDays.length === 0,
  };
}

export function grade(normal, stress) {
  if (!normal.success || !stress.success) return 0;
  if (stress.fee === 0 && !stress.tradeoff && stress.lowest >= 10) return 3;
  if (stress.fee === 0) return 2;
  return 1;
}
