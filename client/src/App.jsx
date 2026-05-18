import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import GroupsPage from "./pages/GroupsPage.jsx";
import GroupDetailPage from "./pages/GroupDetailPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";

const App = () => {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-main">
        <Header />
        <Routes>
          <Route path="/" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
          <Route path="/groups/:groupId/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
