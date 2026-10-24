import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicOnlyRoute from './PublicOnlyRoute.jsx';
import RoleRoute from './RoleRoute.jsx';

import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ProjectsPage from '../pages/ProjectsPage.jsx';
import ProjectDetailPage from '../pages/ProjectDetailPage.jsx';
import TeamPage from '../pages/TeamPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Only (Login / Register) */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Protected Routes (Dashboard shell) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />

          {/* Admin & Owner Only */}
          <Route element={<RoleRoute allowedRoles={['admin', 'owner']} />}>
            <Route path="/team" element={<TeamPage />} />
          </Route>

          {/* Owner Only */}
          <Route element={<RoleRoute allowedRoles={['owner']} />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
