import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import ExpenseForm from "../components/ExpenseForm.jsx";
import AiExpenseForm from "../components/AiExpenseForm.jsx";
import BalanceList from "../components/BalanceList.jsx";
import SettleList from "../components/SettleList.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import BillParseForm from "../components/BillParseForm.jsx";
import ExpenseChart from "../components/ExpenseChart.jsx";

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [error, setError] = useState("");

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const topPayer = balances.reduce(
    (top, member) => (member.paid > (top?.paid || 0) ? member : top),
    null
  );

  const loadAll = async () => {
    try {
      const [groupData, expenseData, balanceData, settleData] =
        await Promise.all([
          api.getGroup(groupId),
          api.getExpenses(groupId),
          api.getBalances(groupId),
          api.getSettlements(groupId),
        ]);
      setGroup(groupData);
      setExpenses(expenseData);
      setBalances(balanceData);
      setSettlements(settleData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadAll();
  }, [groupId]);

  const handleCreateExpense = async (payload) => {
    setError("");
    try {
      await api.createExpense({ ...payload, groupId });
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!group) {
    return (
      <main className="container fade-in">
        {error ? <div className="error">{error}</div> : "Loading group..."}
      </main>
    );
  }

  return (
    <main className="container fade-in">
      <div className="card hero-card">
        <div>
          <h2 className="hero-title">{group.name}</h2>
          <div className="helper">Members</div>
          <div className="flex flex-wrap gap-2">
            {group.members.map((member) => (
              <span key={member._id} className="badge">
                {member.name}
              </span>
            ))}
          </div>
          <Link className="helper" to={`/groups/${groupId}/history`}>
            View full expense history
          </Link>
        </div>
        <div className="hero-metrics">
          <div>
            <div className="stat-label">Total spent</div>
            <div className="stat-value">₹{totalSpent}</div>
          </div>
          <div>
            <div className="stat-label">Top payer</div>
            <div className="stat-sub">{topPayer ? topPayer.name : "-"}</div>
          </div>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="grid-layout">
        <ExpenseForm members={group.members} onCreate={handleCreateExpense} />
        <AiExpenseForm members={group.members} onCreate={handleCreateExpense} />
      </div>
      <div className="grid-layout">
        <BalanceList balances={balances} />
        <ExpenseChart expenses={expenses} />
      </div>
      <SettleList transactions={settlements} />
      <ExpenseList expenses={expenses} members={group.members} />
      <BillParseForm />
    </main>
  );
};

export default GroupDetailPage;
