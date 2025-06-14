import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { dealService, activityService, contactService } from '@/services';
import StatCard from '@/components/molecules/StatCard';
import ActivityItem from '@/components/molecules/ActivityItem';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDeals: 0,
    pipelineValue: 0,
    totalContacts: 0,
    recentActivities: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactMap, setContactMap] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [deals, activities, contacts] = await Promise.all([
        dealService.getAll(),
        activityService.getRecent(5),
        contactService.getAll()
      ]);

      // Create contact map for activity display
      const contactLookup = {};
      contacts.forEach(contact => {
        contactLookup[contact.id] = contact.name;
      });
      setContactMap(contactLookup);

      // Calculate stats
      const openDeals = deals.filter(deal => !['Closed Won', 'Closed Lost'].includes(deal.stage));
      const pipelineValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);

      setStats({
        totalDeals: openDeals.length,
        pipelineValue,
        totalContacts: contacts.length,
        recentActivities: activities.length
      });

      // Add contact names to activities
      const activitiesWithNames = activities.map(activity => ({
        ...activity,
        contactName: contactLookup[activity.contactId]
      }));
      setRecentActivities(activitiesWithNames);

      // Mock upcoming tasks (in a real app, these would come from a service)
      setUpcomingTasks([
        {
          id: 1,
          title: 'Follow up with Sarah Johnson',
          dueDate: new Date(Date.now() + 86400000), // Tomorrow
          priority: 'high',
          type: 'call'
        },
        {
          id: 2,  
          title: 'Send proposal to InnovatePlus',
          dueDate: new Date(Date.now() + 172800000), // Day after tomorrow
          priority: 'medium',
          type: 'email'
        },
        {
          id: 3,
          title: 'Demo presentation for Global Enterprises',
          dueDate: new Date(Date.now() + 259200000), // 3 days
          priority: 'high',
          type: 'meeting'
        }
      ]);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      default: return 'text-info';
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'call': return 'Phone';
      case 'email': return 'Mail';
      case 'meeting': return 'Users';
      default: return 'FileText';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-72"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your pipeline.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button 
            variant="outline" 
            icon="Plus"
            onClick={() => navigate('/contacts')}
          >
            Add Contact
          </Button>
          <Button 
            icon="Target"
            onClick={() => navigate('/deals')}
          >
            New Deal
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Deals"
          value={stats.totalDeals}
          icon="Target"
          color="primary"
          trend="up"
          trendValue="+12% from last month"
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(stats.pipelineValue)}
          icon="DollarSign"
          color="accent"
          trend="up"
          trendValue="+8% from last month"
        />
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts}
          icon="Users"
          color="secondary"
          trend="up"
          trendValue="+3 this week"
        />
        <StatCard
          title="Activities Today"
          value={stats.recentActivities}
          icon="Clock"
          color="info"
          trend="neutral"
          trendValue="2 remaining"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ApperIcon name="Clock" className="w-5 h-5 mr-2 text-primary" />
                Recent Activities
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/activities')}
                className="text-primary hover:text-primary/80"
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-1">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    index={index}
                    showContact={true}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="Calendar" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent activities</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/activities')}
                    className="mt-2"
                  >
                    Log Activity
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ApperIcon name="CheckSquare" className="w-5 h-5 mr-2 text-primary" />
                Upcoming Tasks
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary hover:text-primary/80"
              >
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    task.priority === 'high' ? 'bg-error/10 text-error' :
                    task.priority === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-info/10 text-info'
                  }`}>
                    <ApperIcon name={getTaskIcon(task.type)} className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {task.dueDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 text-gray-400 hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ApperIcon name="Check" className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ApperIcon name="Zap" className="w-5 h-5 mr-2 text-primary" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4 flex-col space-y-2"
              onClick={() => navigate('/contacts')}
            >
              <ApperIcon name="UserPlus" className="w-6 h-6 text-primary" />
              <span className="text-sm">Add Contact</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4 flex-col space-y-2"
              onClick={() => navigate('/deals')}
            >
              <ApperIcon name="Target" className="w-6 h-6 text-accent" />
              <span className="text-sm">Create Deal</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4 flex-col space-y-2"
              onClick={() => navigate('/activities')}
            >
              <ApperIcon name="Phone" className="w-6 h-6 text-secondary" />
              <span className="text-sm">Log Activity</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4 flex-col space-y-2"
              onClick={() => navigate('/deals')}
            >
              <ApperIcon name="PieChart" className="w-6 h-6 text-info" />
              <span className="text-sm">View Pipeline</span>
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;