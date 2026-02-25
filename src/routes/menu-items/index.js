import { getMenuItems, getMenuItemById } from "../../controllers/menu-items/index.js";
import { getMenuItemByIdValidation, validateRequest } from "../../validators/menu-items.js";

export const menuItemsRouter = (app) => {
  app.get("/menu-items", getMenuItems);
  app.get("/menu-items/:id", getMenuItemByIdValidation, validateRequest, getMenuItemById);
};
