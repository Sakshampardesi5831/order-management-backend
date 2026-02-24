export const generateInsertQuery = (tableName, data) => {
  const keys = Object.keys(data);
  const columns = keys.join(', ');
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
  const values = keys.map(key => data[key]);
  
  const query = `
    INSERT INTO ${tableName} (${columns})
    VALUES (${placeholders})
    RETURNING *
  `;
  
  return { query, values };
};

export const generateUpdateQuery = (tableName, data, id) => {
  const keys = Object.keys(data);
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = [...keys.map(key => data[key]), id];
  
  const query = `
    UPDATE ${tableName}
    SET ${setClause}, updated_at = NOW()
    WHERE id = $${keys.length + 1}
    RETURNING *
  `;
  
  return { query, values };
};
