import { useEffect, useState } from "react";
import { api } from "../api.js";
import GroupForm from "../components/GroupForm.jsx";
import GroupList from "../components/GroupList.jsx";

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");

  const loadGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreate = async (payload) => {
    setError("");
    try {
      await api.createGroup(payload);
      await loadGroups();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="container fade-in">
      <section className="card hero-card">
        <div>
          <h2 className="hero-title">Your groups, all in one place.</h2>
          <p className="helper">
            Create a group, drop expenses, and let the app settle the rest.
          </p>
        </div>
        <div className="hero-metrics">
          <div>
            <div className="stat-label">Active groups</div>
            <div className="stat-value">{groups.length}</div>
          </div>
          <div>
            <div className="stat-label">Quick tips</div>
            <div className="stat-sub">Split by payer or parse bills</div>
          </div>
        </div>
      </section>
      <GroupForm onCreate={handleCreate} />
      {error && <div className="error">{error}</div>}
      <GroupList groups={groups} />
    </main>
  );
};

export default GroupsPage;
