const ExpenseList = ({ expenses, members }) => {
  if (expenses.length === 0) {
    return <div className="notice">No expenses recorded yet.</div>;
  }

  const memberMap = new Map(members.map((member) => [member._id, member.name]));

  return (
    <div className="card">
      <h3 className="card-title">Expense history</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Payer</th>
            <th>Amount</th>
            <th>Split among</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense._id}>
              <td>{expense.description}</td>
              <td>{memberMap.get(expense.payerMemberId) || "Unknown"}</td>
              <td>{expense.amount}</td>
              <td>
                {expense.splitAmongMemberIds
                  .map((id) => memberMap.get(id) || "Unknown")
                  .join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;
