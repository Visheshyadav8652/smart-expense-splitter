import { useMemo, useState } from "react";
import { api } from "../api.js";

const matchMemberIds = (members, names) => {
  const lookup = new Map(
    members.map((member) => [member.name.toLowerCase(), member._id])
  );
  return names
    .map((name) => lookup.get(name.toLowerCase()))
    .filter(Boolean);
};

const AiExpenseForm = ({ members, onCreate }) => {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [payerMemberId, setPayerMemberId] = useState("");
  const [splitAmongMemberIds, setSplitAmongMemberIds] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const memberOptions = useMemo(() => members || [], [members]);

  const parseText = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await api.parseExpense(text);
      setParsed(result);
      setDescription(result.description || "");
      setAmount(result.amount || "");
      if (result.payer) {
        const matched = matchMemberIds(memberOptions, [result.payer]);
        setPayerMemberId(matched[0] || "");
      }
      if (Array.isArray(result.members)) {
        setSplitAmongMemberIds(matchMemberIds(memberOptions, result.members));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId) => {
    setSplitAmongMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = async () => {
    setError("");
    const amountValue = Number(amount);
    if (!payerMemberId || !description || !amountValue || splitAmongMemberIds.length === 0) {
      setError("Confirm payer, amount, description, and members.");
      return;
    }

    await onCreate({
      payerMemberId,
      amount: amountValue,
      description,
      splitAmongMemberIds,
    });

    setParsed(null);
    setText("");
  };

  return (
    <div className="card">
      <h3 className="card-title">AI expense parser</h3>
      <div className="form">
        <textarea
          className="textarea"
          rows={3}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder='Example: "I paid 1200 for dinner with Aman and Priya."'
        />
        <button type="button" className="btn" onClick={parseText} disabled={loading}>
          {loading ? "Parsing..." : "Parse text"}
        </button>
        {parsed && (
          <div className="form">
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
            <button type="button" className="btn" onClick={handleSubmit}>
              Add parsed expense
            </button>
          </div>
        )}
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default AiExpenseForm;
