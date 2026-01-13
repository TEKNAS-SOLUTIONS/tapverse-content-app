import pool, { query, getClient } from '../index.js';

describe('Database Connection', () => {
  test('should connect to database', async () => {
    const result = await query('SELECT NOW()');
    expect(result.rows).toBeDefined();
    expect(result.rows.length).toBe(1);
  });

  test('should execute a simple query', async () => {
    const result = await query('SELECT 1 as test');
    expect(result.rows[0].test).toBe(1);
  });

  test('should get a client from pool', async () => {
    const client = await getClient();
    expect(client).toBeDefined();
    const result = await client.query('SELECT 1 as test');
    expect(result.rows[0].test).toBe(1);
    client.release();
  });

  afterAll(async () => {
    await pool.end();
  });
});

