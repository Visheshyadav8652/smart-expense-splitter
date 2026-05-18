const SettleList = ({ transactions }) => {
  if (transactions.length === 0) {
    return <div className="notice">Nothing to settle yet.</div>;
  }

  return (
    <div className="card">
      <h3 className="card-title">Settle up</h3>
      <div className="list">
        {transactions.map((tx, index) => (
          <div key={`${tx.from}-${tx.to}-${index}`}>
            {tx.from} pays {tx.to} {tx.amount}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettleList;
