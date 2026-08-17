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
          items_json TEXT NOT NULL,
          access_token TEXT,
          transfer_last_five TEXT,
          transfer_date TEXT,
          transfer_amount INTEGER,
          transfer_note TEXT,
          transfer_reported_at TEXT,
          payment_received_at TEXT,
          production_started_at TEXT,
          shipped_at TEXT,
          completed_at TEXT,
          carrier TEXT,
          tracking_number TEXT,
          tracking_url TEXT
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
      const columnResult = await d1.prepare("PRAGMA table_info(orders)").all<{ name: string }>();
      const existingColumns = new Set(columnResult.results.map((column: { name: string }) => column.name));
      const missingColumns = [
        ["access_token", "ALTER TABLE orders ADD COLUMN access_token TEXT"],
        ["transfer_last_five", "ALTER TABLE orders ADD COLUMN transfer_last_five TEXT"],
        ["transfer_date", "ALTER TABLE orders ADD COLUMN transfer_date TEXT"],
        ["transfer_amount", "ALTER TABLE orders ADD COLUMN transfer_amount INTEGER"],
        ["transfer_note", "ALTER TABLE orders ADD COLUMN transfer_note TEXT"],
        ["transfer_reported_at", "ALTER TABLE orders ADD COLUMN transfer_reported_at TEXT"],
        ["payment_received_at", "ALTER TABLE orders ADD COLUMN payment_received_at TEXT"],
        ["production_started_at", "ALTER TABLE orders ADD COLUMN production_started_at TEXT"],
        ["shipped_at", "ALTER TABLE orders ADD COLUMN shipped_at TEXT"],
        ["completed_at", "ALTER TABLE orders ADD COLUMN completed_at TEXT"],
        ["carrier", "ALTER TABLE orders ADD COLUMN carrier TEXT"],
        ["tracking_number", "ALTER TABLE orders ADD COLUMN tracking_number TEXT"],
        ["tracking_url", "ALTER TABLE orders ADD COLUMN tracking_url TEXT"],
      ].filter(([name]) => !existingColumns.has(name));
      if (missingColumns.length > 0) {
        await d1.batch(missingColumns.map(([, sql]) => d1.prepare(sql)));
      }
      await d1.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_access_token ON orders (access_token)").run();
      await d1.prepare("PRAGMA optimize").run();
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}
