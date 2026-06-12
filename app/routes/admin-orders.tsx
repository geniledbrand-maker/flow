import { Form, Link, useLoaderData } from "react-router";
import type mysql from "mysql2/promise";
import db from "../db.server";

export function meta() {
  return [{ title: "Заявки — админка FloraOpt" }];
}

interface OrderRow {
  id: number;
  status: "draft" | "confirmed" | "shipped" | "cancelled";
  delivery_date: string | null;
  comment: string | null;
  created_at: string;
  client_name: string | null;
  client_phone: string | null;
  total: number;
}

interface ItemRow {
  order_id: number;
  product_name: string;
  qty: number;
  price_at_order: number;
}

export async function loader() {
  const [orders] = await db.query<mysql.RowDataPacket[]>(
    `SELECT o.id, o.status, o.delivery_date, o.comment, o.created_at,
            c.name AS client_name, c.phone AS client_phone,
            COALESCE(SUM(oi.qty * oi.price_at_order), 0) AS total
     FROM orders o
     LEFT JOIN clients c ON c.id = o.client_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     GROUP BY o.id
     ORDER BY o.created_at DESC`
  );
  const [items] = await db.query<mysql.RowDataPacket[]>(
    `SELECT oi.order_id, p.name AS product_name, oi.qty, oi.price_at_order
     FROM order_items oi JOIN products p ON p.id = oi.product_id`
  );
  return { orders: orders as OrderRow[], items: items as ItemRow[] };
}

const TRANSITIONS: Record<OrderRow["status"], OrderRow["status"][]> = {
  draft:     ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped:   [],
  cancelled: [],
};

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const orderId = Number(form.get("order_id"));
  const status = String(form.get("status"));

  if (!orderId || !["confirmed", "shipped", "cancelled"].includes(status)) {
    return { error: "Некорректный запрос" };
  }

  // Разрешаем только валидные переходы
  const [[current]] = await db.query<mysql.RowDataPacket[]>(
    "SELECT status FROM orders WHERE id = ?",
    [orderId]
  );
  if (!current) return { error: "Заявка не найдена" };
  const allowed = TRANSITIONS[current.status as OrderRow["status"]] ?? [];
  if (!allowed.includes(status as OrderRow["status"])) {
    return { error: `Нельзя перевести из «${current.status}» в «${status}»` };
  }

  await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
  return null;
}

const statusStyle: Record<string, string> = {
  draft:     "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped:   "bg-emerald-100 text-emerald-800",
  cancelled: "bg-neutral-200 text-neutral-500",
};

const statusLabel: Record<string, string> = {
  draft:     "Новая",
  confirmed: "Подтверждена",
  shipped:   "Отгружена",
  cancelled: "Отменена",
};

const actionLabel: Record<string, string> = {
  confirmed: "Подтвердить",
  shipped:   "Отгрузить",
  cancelled: "Отменить",
};

export default function AdminOrders() {
  const { orders, items } = useLoaderData<typeof loader>();

  const itemsByOrder = items.reduce<Record<number, ItemRow[]>>((acc, it) => {
    (acc[it.order_id] ??= []).push(it);
    return acc;
  }, {});

  return (
    <div className="bg-[#f5f5f7] text-[#2d2a32] min-h-screen">
      <header className="sticky top-0 z-10 flex items-center gap-6 bg-white border-b border-neutral-200 px-8 py-3.5">
        <Link to="/" className="text-xl font-bold text-emerald-800">
          <span className="text-rose-400">✿</span> FloraOpt
        </Link>
        <span className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Админка · Заявки</span>
        <div className="flex-1" />
        <Link to="/flow" className="text-sm text-neutral-400 hover:text-emerald-800">Flow →</Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-emerald-900 mb-6">
          Заявки <span className="text-neutral-400 font-normal">({orders.length})</span>
        </h1>

        {!orders.length && <p className="text-neutral-400">Заявок пока нет.</p>}

        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="font-bold text-lg">№{o.id}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[o.status]}`}>
                  {statusLabel[o.status]}
                </span>
                <span className="text-sm text-neutral-500">
                  {new Date(o.created_at).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}
                </span>
                <div className="flex-1" />
                <span className="font-bold text-emerald-800 tabular-nums">
                  {Number(o.total).toLocaleString("ru-RU")} ₽
                </span>
              </div>

              <p className="text-sm mb-1">
                <span className="font-medium">{o.client_name ?? "—"}</span>
                {o.client_phone && <span className="text-neutral-500"> · {o.client_phone}</span>}
                {o.delivery_date && (
                  <span className="text-neutral-500"> · доставка {new Date(o.delivery_date).toLocaleDateString("ru-RU")}</span>
                )}
              </p>
              {o.comment && <p className="text-sm text-neutral-500 italic mb-2">«{o.comment}»</p>}

              <table className="w-full text-sm mt-3 mb-4">
                <tbody>
                  {(itemsByOrder[o.id] ?? []).map((it, i) => (
                    <tr key={i} className="border-t border-neutral-100">
                      <td className="py-1.5">{it.product_name}</td>
                      <td className="py-1.5 text-right tabular-nums">{it.qty} шт</td>
                      <td className="py-1.5 text-right tabular-nums text-neutral-500">
                        × {Number(it.price_at_order).toLocaleString("ru-RU")} ₽
                      </td>
                      <td className="py-1.5 text-right tabular-nums font-medium w-28">
                        {(it.qty * it.price_at_order).toLocaleString("ru-RU")} ₽
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {TRANSITIONS[o.status].length > 0 && (
                <div className="flex gap-2">
                  {TRANSITIONS[o.status].map((next) => (
                    <Form method="post" key={next}>
                      <input type="hidden" name="order_id" value={o.id} />
                      <input type="hidden" name="status" value={next} />
                      <button
                        type="submit"
                        className={
                          next === "cancelled"
                            ? "text-sm px-4 py-2 rounded-lg border border-neutral-300 text-neutral-500 hover:bg-neutral-50"
                            : "text-sm px-4 py-2 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900"
                        }
                      >
                        {actionLabel[next]}
                      </button>
                    </Form>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
