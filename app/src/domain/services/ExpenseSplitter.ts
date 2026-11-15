import type { Expense, MemberId, Paise, Transfer } from "../models";

/** "Split expenses": who pays whom, in as few transfers as possible. */
export class ExpenseSplitter {
  balances(expenses: readonly Expense[]): Map<MemberId, Paise> {
    const bal = new Map<MemberId, Paise>();
    const add = (id: MemberId, amt: Paise) => bal.set(id, (bal.get(id) ?? 0) + amt);
    for (const e of expenses) {
      if (e.splitAmong.length === 0) continue;
      const share = Math.floor(e.amount / e.splitAmong.length);
      const remainder = e.amount - share * e.splitAmong.length;
      add(e.paidBy, e.amount);
      e.splitAmong.forEach((id, i) => add(id, -(share + (i === 0 ? remainder : 0))));
    }
    return bal;
  }

  settle(expenses: readonly Expense[]): Transfer[] {
    const entries = [...this.balances(expenses).entries()];
    const owed = entries.filter(([, v]) => v > 0).map(([id, v]) => ({ id, v })).sort((a, b) => b.v - a.v);
    const owing = entries.filter(([, v]) => v < 0).map(([id, v]) => ({ id, v: -v })).sort((a, b) => b.v - a.v);
    const transfers: Transfer[] = [];
    let i = 0;
    let j = 0;
    while (i < owing.length && j < owed.length) {
      const from = owing[i]!;
      const to = owed[j]!;
      const amount = Math.min(from.v, to.v);
      if (amount > 0) transfers.push({ from: from.id, to: to.id, amount });
      from.v -= amount;
      to.v -= amount;
      if (from.v === 0) i++;
      if (to.v === 0) j++;
    }
    return transfers;
  }
}
