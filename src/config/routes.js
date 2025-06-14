import Dashboard from '@/components/pages/Dashboard';
import Contacts from '@/components/pages/Contacts';
import Deals from '@/components/pages/Deals';
import Activities from '@/components/pages/Activities';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  contacts: {
    id: 'contacts',
    label: 'Contacts',
    path: '/contacts',
    icon: 'Users',
    component: Contacts
  },
  deals: {
    id: 'deals',
    label: 'Deals',
    path: '/deals',
    icon: 'Target',
    component: Deals
  },
  activities: {
    id: 'activities',
    label: 'Activities',
    path: '/activities',
    icon: 'Clock',
    component: Activities
  }
};

export const routeArray = Object.values(routes);
export default routes;