// Order status simulation service with Socket.IO real-time updates
// Simulates order progression through different statuses

const ORDER_STATUSES = [
  'Pending',
  'Order Received',
  'Preparing',
  'Out for Delivery',
  'Delivered'
];

// Time delays for each status transition (in milliseconds)
const STATUS_DELAYS = {
  'Pending': 5000,               // 5 seconds - initial status
  'Order Received': 15000,       // 15 seconds
  'Preparing': 20000,            // 20 seconds
  'Out for Delivery': 25000,     // 25 seconds
  'Delivered': 0                 // Final status
};

class OrderStatusSimulator {
  constructor() {
    this.activeSimulations = new Map();
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  startSimulation(orderId, updateStatusCallback) {
    // Clear any existing simulation for this order
    this.stopSimulation(orderId);

    let currentStatusIndex = 0;

    const progressToNextStatus = async () => {
      if (currentStatusIndex >= ORDER_STATUSES.length - 1) {
        // Reached final status
        this.stopSimulation(orderId);
        return;
      }

      const currentStatus = ORDER_STATUSES[currentStatusIndex];
      const delay = STATUS_DELAYS[currentStatus];

      const timeoutId = setTimeout(async () => {
        currentStatusIndex++;
        const nextStatus = ORDER_STATUSES[currentStatusIndex];

        try {
          // Update status in database with retry logic
          const updatedOrder = await this.retryOperation(
            () => updateStatusCallback(orderId, nextStatus),
            3 // Retry up to 3 times
          );
          
          console.log(`Order ${orderId} status updated to: ${nextStatus}`);
          
          // Emit real-time update via Socket.IO
          if (this.io) {
            this.io.emit('orderStatusUpdate', {
              orderId,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
              order: updatedOrder
            });
            console.log(`Socket.IO: Emitted status update for order ${orderId}`);
          }
          
          // Continue to next status
          progressToNextStatus();
        } catch (error) {
          console.error(`Failed to update order ${orderId} status after retries:`, error.message);
          this.stopSimulation(orderId);
        }
      }, delay);

      this.activeSimulations.set(orderId, {
        timeoutId,
        currentStatus: currentStatus,
        startedAt: new Date()
      });
    };

    // Start the simulation
    progressToNextStatus();
  }

  async retryOperation(operation, maxRetries = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error; // Throw on last attempt
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  stopSimulation(orderId) {
    const simulation = this.activeSimulations.get(orderId);
    if (simulation) {
      clearTimeout(simulation.timeoutId);
      this.activeSimulations.delete(orderId);
      console.log(`Stopped simulation for order ${orderId}`);
    }
  }

  stopAllSimulations() {
    for (const orderId of this.activeSimulations.keys()) {
      this.stopSimulation(orderId);
    }
  }

  isSimulating(orderId) {
    return this.activeSimulations.has(orderId);
  }

  getCurrentSimulationStatus(orderId) {
    const simulation = this.activeSimulations.get(orderId);
    return simulation ? simulation.currentStatus : null;
  }

  getActiveSimulations() {
    return Array.from(this.activeSimulations.keys());
  }
}

// Singleton instance
const simulator = new OrderStatusSimulator();

export default simulator;
