import dbConnection from '../models/db.js';
// import { generateInsertQuery, generateUpdateQuery } from '../helpers/query-generator.js';

export const getAllMenuItems = async () => {
    const pool = await dbConnection();
    const query = 'SELECT * FROM menu_items ORDER BY id ASC';
    const result = await pool.query(query);
    return result.rows;
};

export const getMenuItemById = async (id) => {
    const pool = await dbConnection();
    const query = 'SELECT * FROM menu_items WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// export const createMenuItem = async (menuItem) => {
//     const pool = await dbConnection();
//     const { query, values } = generateInsertQuery('menu_items', menuItem);
//     const result = await pool.query(query, values);
//     return result.rows[0];
// };

// export const updateMenuItem = async (id, menuItem) => {
//     const pool = await dbConnection();
//     const { query, values } = generateUpdateQuery('menu_items', menuItem, id);
//     const result = await pool.query(query, values);
//     return result.rows[0];
// };

// export const deleteMenuItem = async (id) => {
//     const pool = await dbConnection();
//     const query = 'DELETE FROM menu_items WHERE id = $1 RETURNING *';
//     const result = await pool.query(query, [id]);
//     return result.rows[0];
// };
