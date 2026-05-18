const BalanceList = ({ balances }) => {
  if (balances.length === 0) {
    return <div className="notice">No balances yet.</div>;
  }

  return (
    <div className="card">
      <h3 className="card-title">Balances</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Paid</th>
            <th>Owed</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((balance) => (
            <tr key={balance.memberId}>
              <td>{balance.name}</td>
              <td>{balance.paid}</td>
              <td>{balance.owed}</td>
              <td>{balance.net}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BalanceList;
