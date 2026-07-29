/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Apps from './pages/Apps';
import Terminal from './pages/Terminal';
import { PlaceholderPage } from './pages/Placeholder';

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/terminal" element={<Terminal />} />
          <Route path="/storage" element={<PlaceholderPage title="Storage" description="Manage disks, partitions, and filesystems." />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" description="Configure ServerPanel options and system preferences." />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
