import { useMemo, useState } from "react";

const ExpenseForm = ({ members, onCreate }) => {
  const [payerMemberId, setPayerMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [splitAmongMemberIds, setSplitAmongMemberIds] = useState([]);
  const [error, setError] = useState("");

  const memberOptions = useMemo(() => members || [], [members]);

  const toggleMember = (memberId) => {
    setSplitAmongMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const selectAll = () => {
    setSplitAmongMemberIds(memberOptions.map((member) => member._id));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const amountValue = Number(amount);
    if (!payerMemberId || !description || !amountValue || splitAmongMemberIds.length === 0) {
      setError("Fill all fields and choose members to split with.");
      return;
    }

    await onCreate({
      payerMemberId,
      amount: amountValue,
      description,
      splitAmongMemberIds,
    });

    setAmount("");
    setDescription("");
    setSplitAmongMemberIds([]);
  };

  return (
    <div className="card">
      <h3 className="card-title">Add expense</h3>
      <form className="form" onSubmit={handleSubmit}>
        <select
          className="select"
          value={payerMemberId}
          onChange={(event) => setPayerMemberId(event.target.value)}
        >
          <option value="">Select payer</option>
          {memberOptions.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </select>
        <input
          className="input"
          type="number"
          min="1"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount (integer)"
        />
        <input
          className="input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
        />
        <div className="split-list">
          {memberOptions.map((member) => (
            <label key={member._id} className="split-item">
              <input
                type="checkbox"
                checked={splitAmongMemberIds.includes(member._id)}
                onChange={() => toggleMember(member._id)}
              />
              {member.name}
            </label>
          ))}
        </div>
        <div className="split-list">
          <button type="button" className="btn btn-secondary" onClick={selectAll}>
            Split with all
          </button>
          <button type="submit" className="btn">
            Add expense
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default ExpenseForm;
