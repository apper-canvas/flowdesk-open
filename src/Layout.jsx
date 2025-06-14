import { useState, createContext, useContext } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';
import ContactTimelinePanel from '@/components/organisms/ContactTimelinePanel';

const TimelinePanelContext = createContext();

export const useTimelinePanel = () => {
  const context = useContext(TimelinePanelContext);
  if (!context) {
    throw new Error('useTimelinePanel must be used within TimelinePanelProvider');
  }
  return context;
};

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timelinePanelOpen, setTimelinePanelOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const openTimelinePanel = (contact) => {
    setSelectedContact(contact);
    setTimelinePanelOpen(true);
  };

  const closeTimelinePanel = () => {
    setTimelinePanelOpen(false);
    setSelectedContact(null);
  };
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0 lg:w-64">
        <div className="flex flex-col w-full bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ApperIcon name="Zap" className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-semibold text-gray-900">FlowDesk</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <ApperIcon name={route.icon} className="w-5 h-5 mr-3" />
                {route.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-200"
        >
          <ApperIcon name="Menu" className="w-6 h-6 text-gray-600" />
        </motion.button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 w-80 h-full bg-white z-50 shadow-xl"
            >
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <ApperIcon name="Zap" className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-display font-semibold text-gray-900">FlowDesk</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <ApperIcon name="X" className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                  {routeArray.map((route) => (
                    <NavLink
                      key={route.id}
                      to={route.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                    >
                      <ApperIcon name={route.icon} className="w-5 h-5 mr-3" />
                      {route.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

{/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-surface">
          <TimelinePanelContext.Provider value={{ openTimelinePanel, closeTimelinePanel }}>
            <Outlet />
          </TimelinePanelContext.Provider>
        </main>
      </div>

      {/* Contact Timeline Side Panel */}
      <ContactTimelinePanel
        isOpen={timelinePanelOpen}
        contact={selectedContact}
        onClose={closeTimelinePanel}
      />
    </div>
  );
};

export default Layout;