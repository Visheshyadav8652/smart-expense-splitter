export const computeBalances = ({ group, expenses }) => {
  const balances = new Map();
  group.members.forEach((member) => {
    balances.set(member._id.toString(), {
      memberId: member._id.toString(),
      name: member.name,
      paid: 0,
      owed: 0,
      net: 0,
    });
  });

  expenses.forEach((expense) => {
    const payerId = expense.payerMemberId.toString();
    const payer = balances.get(payerId);
    if (payer) {
      payer.paid += expense.amount;
    }

    const participants = expense.splitAmongMemberIds.map((id) => id.toString());
    const count = participants.length || 1;
    const baseShare = Math.floor(expense.amount / count);
    const remainder = expense.amount - baseShare * count;

    participants.forEach((memberId) => {
      const entry = balances.get(memberId);
      if (entry) {
        entry.owed += baseShare;
      }
    });

    if (remainder > 0 && payer) {
      payer.owed += remainder;
    }
  });

  balances.forEach((entry) => {
    entry.net = entry.paid - entry.owed;
  });

  return Array.from(balances.values());
};
