import { success, internalServerError, badRequest } from "../../helpers/index.js";
import { createOrder, getOrderByIdService, getAllOrdersService } from "../../services/orders.js";

export async function addOrder(request, response) {
  try {
    const order = await createOrder(request.body);
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