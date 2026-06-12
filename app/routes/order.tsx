import { Form, Link, redirect, useLoaderData, useActionData, useNavigation } from "react-router";
import type mysql from "mysql2/promise";
import db from "../db.server";

export function meta() {
  return [{ title: "Заявка на опт — FloraOpt" }];
}

interface Product {
  id: number;
  name: string;
  unit: string;
  qty_available: number;
  price: number | null;
}

export async function loader() {
  const today = new Date().toISOString().slice(0, 10);
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT p.id, p.name, p.unit, s.qty_available, pr.price
     FROM products p
     JOIN stock s   ON s.product_id = p.id AND s.available_date = ? AND s.qty_available > 0
     LEFT JOIN prices pr ON pr.product_id = p.id AND pr.tier_id IS NULL
     WHERE p.active = 1
     ORDER BY p.name`,
    [today]
  );
  return { products: rows as Product[] };
}

export async function action({ request }: { request: Request }) {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const comment = String(form.get("comment") ?? "").trim();
  const delivery = String(form.get("delivery_date") ?? "") || null;

  if (!name || !phone) {
    return { error: "Укажите имя и телефон." };
  }

  // Собираем позиции qty_<id> > 0
  const items: { productId: number; qty: number }[] = [];
  for (const [key, value] of form.entries()) {
    const m = key.match(/^qty_(\d+)$/);
    const qty = parseInt(String(value), 10);
    if (m && qty > 0) items.push({ productId: Number(m[1]), qty });
  }
  if (!items.length) {
    return { error: "Выберите хотя бы одну позицию." };
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Клиент: ищем по телефону, иначе создаём
    const [[existing]] = await conn.query<mysql.RowDataPacket[]>(
      "SELECT id FROM clients WHERE phone = ? LIMIT 1",
      [phone]
    );
    let clientId: number;
    if (existing) {
      clientId = existing.id;
    } else {
      const [res] = await conn.query<mysql.ResultSetHeader>(
        "INSERT INTO clients (name, phone, tier_id) VALUES (?, ?, 1)",
        [name, phone]
      );
      clientId = res.insertId;
    }

    const [orderRes] = await conn.query<mysql.ResultSetHeader>(
      "INSERT INTO orders (client_id, status, delivery_date, comment) VALUES (?, 'draft', ?, ?)",
      [clientId, delivery, comment || null]
    );
    const orderId = orderRes.insertId;

    for (const { productId, qty } of items) {
      const [[priceRow]] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT price FROM prices WHERE product_id = ? AND tier_id IS NULL ORDER BY valid_from DESC LIMIT 1",
        [productId]
      );
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, qty, price_at_order) VALUES (?, ?, ?, ?)",
        [orderId, productId, qty, priceRow?.price ?? 0]
      );
    }

    await conn.commit();
    return redirect(`/order/done?id=${orderId}`);
  } catch (e) {
    await conn.rollback();
    console.error("Order failed:", e);
    return { error: "Не удалось сохранить заявку, попробуйте ещё раз." };
  } finally {
    conn.release();
  }
}

export default function Order() {
  const { products } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const nav = useNavigation();
  const submitting = nav.state === "submitting";

  return (
    <div className="bg-[#faf8f5] text-[#2d2a32] min-h-screen">
      <header className="sticky top-0 z-10 flex items-center gap-8 bg-white border-b border-neutral-200 px-8 py-3.5">
        <Link to="/" className="text-xl font-bold text-emerald-800">
          <span className="text-rose-400">✿</span> FloraOpt
        </Link>
        <span className="text-neutral-400 text-sm">Заявка на опт</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-emerald-900 mb-2">Оптовая заявка</h1>
        <p className="text-neutral-500 mb-8">
          Выберите позиции из наличия — мы перезвоним для подтверждения.
        </p>

        <Form method="post" className="space-y-8">
          <section className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-neutral-400">
                    {p.price != null ? `${p.price} ₽` : "—"} / {p.unit === "stem" ? "шт" : p.unit}
                    {" · "}в наличии {p.qty_available}
                  </p>
                </div>
                <input
                  type="number"
                  name={`qty_${p.id}`}
                  min={0}
                  max={p.qty_available}
                  placeholder="0"
                  className="w-24 border border-neutral-300 rounded-lg px-3 py-2 text-right focus:outline-emerald-700"
                />
              </div>
            ))}
            {!products.length && (
              <p className="p-6 text-neutral-400">На сегодня наличие ещё не загружено.</p>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-neutral-600">Имя / компания *</span>
              <input name="name" required className="mt-1 w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-emerald-700" />
            </label>
            <label className="block">
              <span className="text-sm text-neutral-600">Телефон *</span>
              <input name="phone" type="tel" required className="mt-1 w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-emerald-700" />
            </label>
            <label className="block">
              <span className="text-sm text-neutral-600">Желаемая дата поставки</span>
              <input name="delivery_date" type="date" className="mt-1 w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-emerald-700" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm text-neutral-600">Комментарий</span>
              <textarea name="comment" rows={3} className="mt-1 w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-emerald-700" />
            </label>
          </section>

          {actionData?.error && (
            <p className="text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
              {actionData.error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-emerald-800 text-white px-8 py-3 rounded-lg hover:bg-emerald-900 disabled:opacity-50"
          >
            {submitting ? "Отправляем…" : "Отправить заявку"}
          </button>
        </Form>
      </main>
    </div>
  );
}
