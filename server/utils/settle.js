export const settleBalances = (balances) => {
  const creditors = [];
  const debtors = [];

  balances.forEach((entry) => {
    if (entry.net > 0) {
      creditors.push({ ...entry });
    } else if (entry.net < 0) {
      debtors.push({ ...entry, net: Math.abs(entry.net) });
    }
  });

  const transactions = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.net, creditor.net);

    transactions.push({
      from: debtor.name,
      to: creditor.name,
      amount,
    });

    debtor.net -= amount;
    creditor.net -= amount;

    if (debtor.net === 0) i += 1;
    if (creditor.net === 0) j += 1;
  }

  return transactions;
};
