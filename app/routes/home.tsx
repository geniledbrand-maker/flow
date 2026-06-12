import { Link, useLoaderData } from "react-router";
import db from "../db.server";

export function meta() {
  return [
    { title: "FloraOpt — цветы оптом" },
    { name: "description", content: "Свежие цветы и зелень оптом, прямые поставки." },
  ];
}

interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  unit: string;
  qty_available: number | null;
  price: number | null;
}

export async function loader() {
  const today = new Date().toISOString().slice(0, 10);

  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT
       p.id, p.slug, p.name, p.category, p.unit,
       s.qty_available,
       pr.price
     FROM products p
     LEFT JOIN stock s  ON s.product_id = p.id AND s.available_date = ?
     LEFT JOIN prices pr ON pr.product_id = p.id AND pr.tier_id IS NULL
     WHERE p.active = 1
     ORDER BY p.category, p.name`,
    [today]
  );

  return { products: rows as Product[], today };
}

const categoryLabel: Record<string, string> = {
  flower:   "Цветы",
  greenery: "Зелень",
  bouquet:  "Букеты",
  supply:   "Расходники",
};

const categoryEmoji: Record<string, string> = {
  flower:   "🌸",
  greenery: "🌿",
  bouquet:  "💐",
  supply:   "📦",
};

export default function Home() {
  const { products, today } = useLoaderData<typeof loader>();

  const byCategory = products.reduce<Record<string, Product[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="bg-[#faf8f5] text-[#2d2a32] min-h-screen">
      <header className="sticky top-0 z-10 flex items-center gap-8 bg-white border-b border-neutral-200 px-8 py-3.5">
        <Link to="/" className="text-xl font-bold text-emerald-800 no-underline">
          <span className="text-rose-400">✿</span> FloraOpt
        </Link>
        <nav className="flex gap-6 flex-1 text-[15px]">
          <a href="#catalog" className="hover:text-emerald-800">Каталог</a>
          <a href="#contacts" className="hover:text-emerald-800">Контакты</a>
        </nav>
        <Link to="/flow" title="Flow — планы" className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-800 hover:bg-emerald-50">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </header>

      <section className="text-center py-20 px-6 bg-gradient-to-br from-emerald-50 to-rose-50">
        <h1 className="text-4xl font-bold text-emerald-900 mb-3">Свежие цветы оптом</h1>
        <p className="max-w-xl mx-auto text-neutral-600 mb-7">
          Прямые поставки. Розы, тюльпаны, хризантемы и зелень для флористов и магазинов.
        </p>
        <a href="#catalog" className="inline-block bg-emerald-800 text-white px-7 py-3 rounded-lg hover:bg-emerald-900">
          Смотреть наличие
        </a>
      </section>

      <section id="catalog" className="max-w-5xl mx-auto px-6 py-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold text-emerald-900">Наличие на {today}</h2>
          <span className="text-sm text-neutral-400">{products.length} позиций</span>
        </div>

        {Object.entries(byCategory).map(([cat, items]) => (
          <div key={cat} className="mb-10">
            <h3 className="text-base font-semibold text-neutral-500 mb-3 uppercase tracking-wide">
              {categoryEmoji[cat]} {categoryLabel[cat] ?? cat}
            </h3>
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
              {items.map((p) => (
                <div key={p.id} className="bg-white border border-neutral-200 rounded-xl p-5">
                  <p className="font-semibold mb-1">{p.name}</p>
                  <p className="text-sm text-neutral-500 mb-3">
                    {p.qty_available != null
                      ? `В наличии: ${p.qty_available} ${p.unit === "stem" ? "шт" : p.unit}`
                      : <span className="text-rose-400">нет данных</span>}
                  </p>
                  <p className="text-lg font-bold text-emerald-800">
                    {p.price != null ? `${p.price} ₽` : "—"}
                    <span className="text-sm font-normal text-neutral-400 ml-1">
                      / {p.unit === "stem" ? "шт" : p.unit}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section id="contacts" className="max-w-5xl mx-auto px-6 py-14 border-t border-neutral-200">
        <h2 className="text-2xl font-bold text-emerald-900 mb-4">Контакты</h2>
        <p className="text-neutral-600">Телефон: +7 (000) 000-00-00<br />Email: opt@floraopt.example</p>
      </section>

      <footer className="text-center py-8 text-sm text-neutral-400 border-t border-neutral-200">
        © 2026 FloraOpt — цветы оптом
      </footer>
    </div>
  );
}

// Нужен import для типов RowDataPacket (только тип, не увеличивает бандл)
import type mysql from "mysql2/promise";
