import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    createdAt: text("created_at").notNull(),
    status: text("status").notNull().default("pending_review"),
    paymentMethod: text("payment_method").notNull(),
    shippingMethod: text("shipping_method").notNull(),
    shippingFee: integer("shipping_fee").notNull(),
    subtotal: integer("subtotal").notNull(),
    total: integer("total").notNull(),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    address: text("address"),
    storeChain: text("store_chain"),
    storeName: text("store_name"),
    storeCode: text("store_code"),
    note: text("note"),
    itemsJson: text("items_json").notNull(),
  },
  (table) => [
    index("idx_orders_created_at").on(table.createdAt),
    index("idx_orders_status").on(table.status),
  ],
);

export const orderEvents = sqliteTable(
  "order_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: text("order_id").notNull(),
    createdAt: text("created_at").notNull(),
    action: text("action").notNull(),
    previousStatus: text("previous_status").notNull(),
    nextStatus: text("next_status").notNull(),
    actorEmail: text("actor_email").notNull(),
    message: text("message"),
    externalId: text("external_id"),
  },
  (table) => [
    index("idx_order_events_order_id").on(table.orderId),
    index("idx_order_events_created_at").on(table.createdAt),
  ],
);
