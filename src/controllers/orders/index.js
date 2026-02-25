import { success, internalServerError, badRequest } from "../../helpers/index.js";
import { createOrder, getOrderByIdService, getAllOrdersService, updateOrderStatusService } from "../../services/orders.js";
import orderStatusSimulator from "../../services/order-status-simulator.js";

export async function addOrder(request, response) {
  try {
    const order = await createOrder(request.body);
    
    // Get Socket.IO instance from app
    const io = request.app.get('io');
    if (io) {
      orderStatusSimulator.setSocketIO(io);
    }
    
    // Emit initial order creation event
    if (io) {
      io.emit('orderCreated', {
        orderId: order.id,
        status: order.status,
        createdAt: order.created_at
      });
    }
    
    // Start status simulation for the new order
    orderStatusSimulator.startSimulation(order.id, async (orderId, newStatus) => {
      return await updateOrderStatusService(orderId, newStatus);
    });
    
    return success(request, response, order, "Order created successfully", 201);
  } catch (error) {
    console.log(error);
    return internalServerError(request, response, error, "Failed to create order");
  }
}

export async function getOrderById(request, response) {
  try {
    const { id } = request.params;
    const order = await getOrderByIdService(id);

    if (!order) {
      return badRequest(response, "Order not found");
    }

    return success(request, response, order, "Order retrieved successfully");
  } catch (error) {
    return internalServerError(request, response, error, "Failed to retrieve order");
  }
}

export async function getAllOrders(request, response) {
  try {
    const orders = await getAllOrdersService();
    return success(request, response, orders, "Orders retrieved successfully");
  } catch (error) {
    return internalServerError(request, response, error, "Failed to retrieve orders");
  }
}


export async function updateOrderStatus(request, response) {
  try {
    const { id } = request.params;
    const { status } = request.body;

    const order = await updateOrderStatusService(id, status);

    if (!order) {
      return badRequest(response, "Order not found");
    }

    return success(request, response, order, "Order status updated successfully");
  } catch (error) {
    return internalServerError(request, response, error, "Failed to update order status");
  }
}
