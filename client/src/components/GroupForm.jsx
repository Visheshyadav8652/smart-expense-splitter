import { useState } from "react";

const GroupForm = ({ onCreate }) => {
  const [name, setName] = useState("");
  const [members, setMembers] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const list = members
      .split(",")
      .map((member) => member.trim())
      .filter(Boolean);

    if (!name || list.length === 0) {
      setError("Add a group name and at least one member.");
      return;
    }

    await onCreate({ name, members: list });
    setName("");
    setMembers("");
  };

  return (
    <div className="card">
      <h3 className="card-title">Create a group</h3>
      <form className="form" onSubmit={handleSubmit}>
        <input
          className="input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Group name"
        />
        <textarea
          className="textarea"
          rows={2}
          value={members}
          onChange={(event) => setMembers(event.target.value)}
          placeholder="Members separated by commas"
        />
        <button type="submit" className="btn">
          Create group
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default GroupForm;
