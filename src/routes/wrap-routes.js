import { healthRouter } from "./health";
export const wrapRoutes = (app) => {
  healthRouter(app);
};
