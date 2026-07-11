// ============================================================
// PostgreSQL 连接池
// 使用 pg 库连接 Supabase PostgreSQL
// 所有查询必须使用参数化（禁止字符串拼接 SQL）
// ============================================================

import pg from 'pg';

const { Pool } = pg;

/**
 * 数据库连接池配置
 * 从环境变量读取，提供合理默认值
 */
const poolConfig: pg.PoolConfig = {
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME ?? 'postgres',
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  max: Number(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: Number(process.env.DB_POOL_CONNECT_TIMEOUT) || 5000,
};

/**
 * 全局数据库连接池实例
 */
const pool = new Pool(poolConfig);

// 连接池错误监听
pool.on('error', (err: Error) => {
  console.error('[DB] 连接池异常:', err.message);
});

/**
 * 执行 SQL 查询（参数化）
 *
 * 示例：
 *   const result = await query<{ id: string }>('SELECT id FROM users WHERE id = $1', [userId]);
 *   const rows = result.rows;
 */
export async function query<T extends pg.QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // 慢查询日志（> 500ms）
    if (duration > 500) {
      console.warn(`[DB] 慢查询 (${duration}ms): ${text.substring(0, 200)}`);
    }

    return result;
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[DB] 查询失败 (${duration}ms): ${text.substring(0, 200)}`, err);
    throw err;
  }
}

/**
 * 执行事务
 * 传入回调函数，回调内使用同一个 client 执行多步操作
 *
 * 示例：
 *   const result = await transaction(async (client) => {
 *     await client.query('INSERT INTO ...', [...]);
 *     await client.query('UPDATE ...', [...]);
 *     return { success: true };
 *   });
 */
export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 获取原始 pg.Pool 实例（供高级场景使用）
 */
export function getPool(): pg.Pool {
  return pool;
}

/**
 * 关闭连接池（用于优雅关闭）
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

/**
 * 健康检查：测试数据库连接
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query<{ now: string }>('SELECT NOW()');
    return result.rows.length > 0;
  } catch {
    return false;
  }
}
