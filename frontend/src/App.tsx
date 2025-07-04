import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DemoProvider } from './contexts/DemoContext';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { DemoDashboard } from './pages/DemoDashboard';
import { Sessions } from './pages/Sessions';
import { SessionDetail } from './pages/SessionDetail';
import { CreateSession } from './pages/CreateSession';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <DemoProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="demo" element={<DemoDashboard />} />
              <Route element={<PrivateRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="sessions" element={<Sessions />} />
                <Route path="sessions/new" element={<CreateSession />} />
                <Route path="sessions/:id" element={<SessionDetail />} />
                <Route path="sessions/:id/edit" element={<CreateSession />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DemoProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;