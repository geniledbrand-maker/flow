import { Link, useSearchParams } from "react-router";

export function meta() {
  return [{ title: "Заявка принята — FloraOpt" }];
}

export default function OrderDone() {
  const [params] = useSearchParams();
  const id = params.get("id");

  return (
    <div className="bg-[#faf8f5] min-h-screen flex items-center justify-center px-6">
      <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center max-w-md">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-emerald-900 mb-2">
          Заявка №{id} принята
        </h1>
        <p className="text-neutral-500 mb-6">
          Мы свяжемся с вами для подтверждения наличия и стоимости.
        </p>
        <Link to="/" className="inline-block bg-emerald-800 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-900">
          На главную
        </Link>
      </div>
    </div>
  );
}
