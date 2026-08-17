import { env } from "cloudflare:workers";

let schemaReady: Promise<void> | null = null;

export function ensureOrdersSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const d1 = env.DB;
      await d1.batch([
        d1.prepare(`CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY NOT NULL,
          created_at TEXT NOT NULL,
          status TEXT DEFAULT 'pending_review' NOT NULL,
          payment_method TEXT NOT NULL,
          shipping_method TEXT NOT NULL,
          shipping_fee INTEGER NOT NULL,
          subtotal INTEGER NOT NULL,
          total INTEGER NOT NULL,
          customer_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          address TEXT,
          store_chain TEXT,
          store_name TEXT,
          store_code TEXT,
          note TEXT,
          items_json TEXT NOT NULL
        )`),
        d1.prepare("CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at)"),
        d1.prepare("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)"),
        d1.prepare(`CREATE TABLE IF NOT EXISTS order_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          order_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          action TEXT NOT NULL,
          previous_status TEXT NOT NULL,
          next_status TEXT NOT NULL,
          actor_email TEXT NOT NULL,
          message TEXT,
          external_id TEXT
        )`),
        d1.prepare("CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events (order_id)"),
        d1.prepare("CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON order_events (created_at)"),
      ]);
      await d1.prepare("PRAGMA optimize").run();
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}
