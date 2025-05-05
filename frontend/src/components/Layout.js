// components/Layout.js
import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Workflow Service</h1>
        <nav>
          <ul>
            <li><Link to="/">ホーム</Link></li>
            <li><Link to="/workflows">ワークフロー</Link></li>
            <li><Link to="/tasks">タスク</Link></li>
          </ul>
        </nav>
      </header>
      <main className="app-content">
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>&copy; 2025 Workflow Service</p>
      </footer>
    </div>
  );
};

export default Layout;
