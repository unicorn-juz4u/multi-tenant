import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks.js';
import { selectUserRole } from '../features/auth/selectors.js';
import ForbiddenPage from '../pages/ForbiddenPage.jsx';

export const RoleRoute = ({ allowedRoles = [] }) => {
  const currentRole = useAppSelector(selectUserRole);

  if (!currentRole || !allowedRoles.includes(currentRole)) {
    return <ForbiddenPage requiredRoles={allowedRoles} />;
  }

  return <Outlet />;
};

export default RoleRoute;
