import { Link } from "react-router-dom";

const GroupList = ({ groups }) => {
  if (groups.length === 0) {
    return <div className="notice">No groups yet. Create one to start.</div>;
  }

  return (
    <div className="grid-layout">
      {groups.map((group) => (
        <Link
          key={group._id}
          to={`/groups/${group._id}`}
          className="card card-link"
        >
          <h3 className="card-title">{group.name}</h3>
          <div className="badge">{group.members.length} members</div>
        </Link>
      ))}
    </div>
  );
};

export default GroupList;
