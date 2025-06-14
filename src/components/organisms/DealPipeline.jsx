import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { dealService } from '@/services';
import DealCard from '@/components/molecules/DealCard';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const DealPipeline = ({ onEditDeal, onViewDeal }) => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const stages = [
    { id: 'Lead', title: 'Lead', color: 'bg-gray-100' },
    { id: 'Qualified', title: 'Qualified', color: 'bg-blue-100' },
    { id: 'Proposal', title: 'Proposal', color: 'bg-yellow-100' },
    { id: 'Negotiation', title: 'Negotiation', color: 'bg-orange-100' },
    { id: 'Closed Won', title: 'Closed Won', color: 'bg-green-100' },
    { id: 'Closed Lost', title: 'Closed Lost', color: 'bg-red-100' }
  ];

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dealService.getAll();
      setDeals(result);
    } catch (err) {
      setError(err.message || 'Failed to load deals');
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    try {
      // Optimistic update
      setDeals(prev => 
        prev.map(deal => 
          deal.id === draggableId 
            ? { ...deal, stage: destination.droppableId }
            : deal
        )
      );

      await dealService.updateStage(draggableId, destination.droppableId);
      toast.success('Deal stage updated successfully');
    } catch (err) {
      // Rollback on error
      setDeals(prev => 
        prev.map(deal => 
          deal.id === draggableId 
            ? { ...deal, stage: source.droppableId }
            : deal
        )
      );
      toast.error('Failed to update deal stage');
    }
  };

  const handleDeleteDeal = async (dealId) => {
    try {
      await dealService.delete(dealId);
      setDeals(prev => prev.filter(deal => deal.id !== dealId));
      toast.success('Deal deleted successfully');
    } catch (err) {
      toast.error('Failed to delete deal');
    }
  };

  const getDealsByStage = (stageId) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const getStageValue = (stageId) => {
    return getDealsByStage(stageId).reduce((sum, deal) => sum + deal.value, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-white rounded-lg p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="AlertCircle" className="w-12 h-12 text-error mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load pipeline</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={loadDeals} icon="RefreshCw">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          const stageValue = getStageValue(stage.id);

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-4 ${stage.color} border-2 border-transparent hover:border-primary/20 transition-colors`}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{stage.title}</h3>
                  <span className="text-sm font-medium text-gray-600">
                    {stageDeals.length}
                  </span>
                </div>
                <p className="text-sm font-medium text-accent">
                  {formatCurrency(stageValue)}
                </p>
              </div>

              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] transition-colors rounded-lg ${
                      snapshot.isDraggingOver ? 'bg-primary/5 border-primary/30' : ''
                    }`}
                  >
                    <AnimatePresence>
                      {stageDeals.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                            >
                              <DealCard
                                deal={deal}
                                onEdit={onEditDeal}
                                onDelete={handleDeleteDeal}
                                onView={onViewDeal}
                                isDragging={snapshot.isDragging}
                                index={index}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                    
                    {stageDeals.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                        Drop deals here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </motion.div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default DealPipeline;