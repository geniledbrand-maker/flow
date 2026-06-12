import { useState } from "react";
import { Link } from "react-router";

export function meta() {
  return [{ title: "Flow — планы" }];
}

type NoteId = "launch" | "suppliers" | "marketing" | "ideas";

const noteTitles: Record<NoteId, string> = {
  launch: "Запуск магазина",
  suppliers: "Поставщики",
  marketing: "Маркетинг",
  ideas: "Идеи",
};

function Tag({ children }: { children: string }) {
  return (
    <span className="bg-[#2d2d4a] text-violet-400 text-xs px-2.5 py-0.5 rounded-full mr-1.5">
      {children}
    </span>
  );
}

function WikiLink({ to, open }: { to: NoteId; open: (n: NoteId) => void }) {
  return (
    <a className="text-violet-400 cursor-pointer hover:underline" onClick={() => open(to)}>
      [[{noteTitles[to]}]]
    </a>
  );
}

function Related({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-[3px] border-violet-400 bg-[#22223380] text-[#9b9bb0] px-4 py-2 mt-6">
      Связано: {children}
    </blockquote>
  );
}

function Task({ done, children }: { done?: boolean; children: string }) {
  return (
    <li className="flex items-center gap-2.5 py-0.5">
      <input type="checkbox" defaultChecked={done} className="w-4 h-4 accent-violet-400" />
      {children}
    </li>
  );
}

export default function Flow() {
  const [active, setActive] = useState<NoteId>("launch");

  const notes: Record<NoteId, React.ReactNode> = {
    launch: (
      <>
        <h1 className="text-3xl font-bold text-white mb-2">Запуск магазина</h1>
        <p className="mb-4"><Tag>#план</Tag><Tag>#приоритет</Tag></p>
        <h2 className="text-xl text-[#e2e2ea] border-b border-[#2a2a3a] pb-1.5 mt-6 mb-3">Этапы</h2>
        <ul className="pl-1">
          <Task done>Очистить репозиторий</Task>
          <Task done>Сделать главную страницу</Task>
          <Task done>Перевести на стек RR7 + Tailwind 4</Task>
          <Task>Каталог с реальными позициями</Task>
          <Task>Форма заявки на опт</Task>
          <Task>Личный кабинет оптовика</Task>
        </ul>
        <Related>
          <WikiLink to="suppliers" open={setActive} />, <WikiLink to="marketing" open={setActive} />
        </Related>
      </>
    ),
    suppliers: (
      <>
        <h1 className="text-3xl font-bold text-white mb-2">Поставщики</h1>
        <p className="mb-4"><Tag>#закупки</Tag></p>
        <ul className="list-disc pl-6 leading-7">
          <li>Эквадор — розы (узнать минимальную партию)</li>
          <li>Голландия — тюльпаны, сезон</li>
          <li>Местные теплицы — зелень, хризантемы</li>
        </ul>
        <Related><WikiLink to="launch" open={setActive} /></Related>
      </>
    ),
    marketing: (
      <>
        <h1 className="text-3xl font-bold text-white mb-2">Маркетинг</h1>
        <p className="mb-4"><Tag>#маркетинг</Tag></p>
        <ul className="list-disc pl-6 leading-7">
          <li>Прайс-рассылка флористам</li>
          <li>Телеграм-канал с поступлениями</li>
          <li>Скидки от объёма</li>
        </ul>
        <Related><WikiLink to="ideas" open={setActive} /></Related>
      </>
    ),
    ideas: (
      <>
        <h1 className="text-3xl font-bold text-white mb-2">Идеи</h1>
        <p className="mb-4"><Tag>#inbox</Tag></p>
        <ul className="list-disc pl-6 leading-7">
          <li>Подписка на еженедельную поставку</li>
          <li>Предзаказ к праздникам (8 марта, 1 сентября)</li>
          <li>Калькулятор стоимости партии</li>
        </ul>
      </>
    ),
  };

  return (
    <div className="flex h-screen bg-[#1e1e2e] text-[#dcddde]">
      <aside className="w-60 bg-[#16161e] border-r border-[#2a2a3a] p-4 flex flex-col">
        <div className="text-[13px] font-semibold uppercase tracking-wide text-[#9b9bb0] px-2 mb-4">
          🗂 FloraOpt Vault
        </div>
        <nav className="flex-1">
          <div className="text-sm text-[#b8b8c8] px-2 py-1.5">📁 Планы</div>
          {(Object.keys(noteTitles) as NoteId[]).map((id) => (
            <a
              key={id}
              onClick={() => setActive(id)}
              className={`block text-sm rounded-md px-2 py-1 pl-6 cursor-pointer ${
                active === id
                  ? "bg-[#3b3b5c] text-white"
                  : "text-[#9b9bb0] hover:bg-[#24243a] hover:text-[#dcddde]"
              }`}
            >
              📄 {noteTitles[id]}
            </a>
          ))}
        </nav>
        <Link to="/" className="text-[13px] text-[#7a7a90] hover:text-violet-400 p-2">
          ← на сайт
        </Link>
      </aside>

      <main className="flex-1 overflow-y-auto px-16 py-12">
        <article className="max-w-2xl mx-auto leading-7">{notes[active]}</article>
      </main>
    </div>
  );
}
