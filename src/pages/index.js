import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen bg-red-500 p-8">
      <Head>
        <title>Tailwind Test</title>
      </Head>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
            Tailwind Test
          </div>
          <p className="mt-2 text-slate-500">
            If you see this card with proper styling, Tailwind is working.
          </p>
        </div>
      </div>
    </div>
  );
}
