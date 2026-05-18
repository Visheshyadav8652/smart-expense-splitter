import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import ExpenseList from "../components/ExpenseList.jsx";

const HistoryPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [groupData, expenseData] = await Promise.all([
        api.getGroup(groupId),
        api.getExpenses(groupId),
      ]);
      setGroup(groupData);
      setExpenses(expenseData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [groupId]);

  if (!group) {
    return (
      <main className="container fade-in">
        {error ? <div className="error">{error}</div> : "Loading history..."}
      </main>
    );
  }

  return (
    <main className="container fade-in">
      <div className="card hero-card">
        <div>
          <h2 className="hero-title">{group.name} history</h2>
          <Link className="helper" to={`/groups/${groupId}`}>
            Back to group
          </Link>
        </div>
        <div className="hero-metrics">
          <div>
            <div className="stat-label">Total entries</div>
            <div className="stat-value">{expenses.length}</div>
          </div>
          <div>
            <div className="stat-label">Latest update</div>
            <div className="stat-sub">Auto-sorted by time</div>
          </div>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      <ExpenseList expenses={expenses} members={group.members} />
    </main>
  );
};

export default HistoryPage;
