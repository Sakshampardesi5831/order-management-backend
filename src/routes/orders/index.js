import { addOrder, getOrderById, getAllOrders } from "../../controllers/orders/index.js";
import { createOrderValidation, getOrderByIdValidation, validateRequest } from "../../validators/orders.js";

export const ordersRouter = (app) => {
  app.get("/orders", getAllOrders);
  app.get("/orders/:id",
     getOrderByIdValidation,
      validateRequest,
       getOrderById);
  app.post("/orders",
     createOrderValidation,
      validateRequest,
    addOrder);
};
