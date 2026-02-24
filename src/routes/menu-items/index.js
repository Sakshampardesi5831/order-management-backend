import { getMenuItems } from "../../controllers/menu-items/index.js";

export const menuItemsRouter = (app) => {
  app.get("/menu-items", getMenuItems);
};
