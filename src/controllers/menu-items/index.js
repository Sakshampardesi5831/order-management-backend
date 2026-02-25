import { success, internalServerError } from "../../helpers/index.js";
import { getAllMenuItems, getMenuItemById as getMenuItemByIdService } from "../../services/menu-items.js";

export async function getMenuItems(request, response) {
  try {
    const menuItems = await getAllMenuItems();
    return success(request,response, menuItems, "Menu items retrieved successfully");
  } catch (error) {
    console.log(error);
    return internalServerError(request, response, error, "Failed to retrieve menu items");
  }
}

export async function getMenuItemById(request, response) {
  try {
    const { id } = request.params;
    const result = await getMenuItemByIdService(id);
    return success(request, response, result, "Menu item retrieved successfully");
  } catch (error) {
    console.log(error);
    return internalServerError(request, response, error, "Failed to retrieve menu item");
  }
}