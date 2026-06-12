import { Link } from "react-router";

export function meta() {
  return [
    { title: "FloraOpt — цветы оптом" },
    { name: "description", content: "Свежие цветы оптом: розы, тюльпаны, хризантемы и зелень для флористов и магазинов." },
  ];
}

const catalog = [
  { emoji: "🌹", name: "Розы", text: "Эквадор, Кения, местные теплицы. От 50 см до 90 см." },
  { emoji: "🌷", name: "Тюльпаны", text: "Сезонные поставки из Голландии и собственных теплиц." },
  { emoji: "🌼", name: "Хризантемы", text: "Одноголовые и кустовые, широкая палитра цветов." },
  { emoji: "🌿", name: "Зелень", text: "Эвкалипт, рускус, писташ и другая флористическая зелень." },
];

export default function Home() {
  return (
    <div className="bg-[#faf8f5] text-[#2d2a32] min-h-screen">
      <header className="sticky top-0 z-10 flex items-center gap-8 bg-white border-b border-neutral-200 px-8 py-3.5">
        <Link to="/" className="text-xl font-bold text-emerald-800 no-underline">
          <span className="text-rose-400">✿</span> FloraOpt
        </Link>
        <nav className="flex gap-6 flex-1 text-[15px]">
          <a href="#catalog" className="hover:text-emerald-800">Каталог</a>
          <a href="#delivery" className="hover:text-emerald-800">Доставка</a>
          <a href="#about" className="hover:text-emerald-800">О нас</a>
          <a href="#contacts" className="hover:text-emerald-800">Контакты</a>
        </nav>
        <Link to="/flow" title="Flow — планы и заметки" className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-800 hover:bg-emerald-50">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </header>

      <main>
        <section className="text-center py-24 px-6 bg-gradient-to-br from-emerald-50 to-rose-50">
          <h1 className="text-4xl font-bold text-emerald-900 mb-3">Свежие цветы оптом</h1>
          <p className="max-w-xl mx-auto text-neutral-600 mb-7">
            Прямые поставки от плантаций. Розы, тюльпаны, хризантемы и зелень — для флористов и магазинов.
          </p>
          <a href="#catalog" className="inline-block bg-emerald-800 text-white px-7 py-3 rounded-lg hover:bg-emerald-900">
            Смотреть каталог
          </a>
        </section>

        <section id="catalog" className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">Каталог</h2>
          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            {catalog.map((c) => (
              <div key={c.name} className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="text-3xl mb-2">{c.emoji}</div>
                <h3 className="font-semibold mb-1.5">{c.name}</h3>
                <p className="text-sm text-neutral-500">{c.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="delivery" className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">Доставка</h2>
          <p>Доставляем по городу и области собственным рефрижераторным транспортом. Холодовая цепь от плантации до вашего магазина.</p>
        </section>

        <section id="about" className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">О нас</h2>
          <p>Работаем с 2026 года. Прямые контракты с плантациями, собственный склад с холодильными камерами.</p>
        </section>

        <section id="contacts" className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">Контакты</h2>
          <p>Телефон: +7 (000) 000-00-00<br />Email: opt@floraopt.example</p>
        </section>
      </main>

      <footer className="text-center py-8 text-sm text-neutral-400 border-t border-neutral-200">
        © 2026 FloraOpt — цветы оптом
      </footer>
    </div>
  );
}
