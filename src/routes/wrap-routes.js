import { healthRouter } from "./health/index.js";
import { menuItemsRouter } from "./menu-items/index.js";
import { ordersRouter } from "./orders/index.js";

export const wrapRoutes = (app) => {
  healthRouter(app);
  menuItemsRouter(app);
  ordersRouter(app);
};
