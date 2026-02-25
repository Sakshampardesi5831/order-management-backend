import dbConnection from '../models/db.js';
import { generateInsertQuery } from '../helpers/query-generator.js';

export const createOrder = async (orderData) => {
  const pool = await dbConnection();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { customerName, address, phone, status, totalAmount, orderItems } = orderData;
    
    // Prepare order data for insert
    const orderInsertData = {
      customer_name: customerName,
      address,
      phone,
      status: status || 'Order Received',
      total_amount: totalAmount
    };
    
    // Insert order using generateInsertQuery
    const { query: orderQuery, values: orderValues } = generateInsertQuery('orders', orderInsertData);
    const orderResult = await client.query(orderQuery, orderValues);
    const order = orderResult.rows[0];
    
    // Insert order items
    const orderItemsData = [];
    for (const item of orderItems) {
      const orderItemInsertData = {
        order_id: order.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        price_at_order: item.priceAtOrder
      };
      
      const { query: itemQuery, values: itemValues } = generateInsertQuery('order_items', orderItemInsertData);
      const itemResult = await client.query(itemQuery, itemValues);
      orderItemsData.push(itemResult.rows[0]);
    }
    
    await client.query('COMMIT');
    
    return {
      ...order,
      order_items: orderItemsData
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};




export const getOrderByIdService = async (id) => {
  const pool = await dbConnection();
  
  // Get order details
  const orderQuery = 'SELECT * FROM orders WHERE id = $1';
  const orderResult = await pool.query(orderQuery, [id]);
  
  if (orderResult.rows.length === 0) {
    return null;
  }
  
  const order = orderResult.rows[0];
  
  // Get order items with menu item details
  const orderItemsQuery = `
    SELECT oi.*, mi.name, mi.description, mi.image_url
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    WHERE oi.order_id = $1
  `;
  const orderItemsResult = await pool.query(orderItemsQuery, [id]);
  
  return {
    ...order,
    order_items: orderItemsResult.rows
  };
};


export const getAllOrdersService = async () => {
  const pool = await dbConnection();
  
  // Get all orders
  const ordersQuery = `
    SELECT * FROM orders
    ORDER BY created_at DESC
  `;
  const ordersResult = await pool.query(ordersQuery);
  
  // Get order items for each order
  const ordersWithItems = await Promise.all(
    ordersResult.rows.map(async (order) => {
      const orderItemsQuery = `
        SELECT oi.*, mi.name, mi.description, mi.image_url
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = $1
      `;
      const orderItemsResult = await pool.query(orderItemsQuery, [order.id]);
      
      return {
        ...order,
        order_items: orderItemsResult.rows
      };
    })
  );
  
  return ordersWithItems;
};
