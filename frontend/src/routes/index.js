import UserRoles from '../pages/roles';

const routes = [
  {
    path: '/user-roles',
    element: <UserRoles />,
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