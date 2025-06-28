import UserRoles from '../pages/roles';
import Settings from '../pages/Settings';

const routes = [
  {
    path: '/user-roles',
    element: <UserRoles />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  // Optionally, redirect old routes:
  // {
  //   path: '/roles',
  //   element: <Navigate to="/user-roles" />,
  // },
  // {
  //   path: '/permissions',
  //   element: <Navigate to="/user-roles" />,
  // },
];

export default routes; 