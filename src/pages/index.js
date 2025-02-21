import Head from 'next/head';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh' }} className="bg-red-500 p-5">
      <Head>
        <title>Test Page</title>
      </Head>

      <h1 className="text-white text-4xl text-center mb-5">
        Test Page
      </h1>

      <div className="bg-white max-w-2xl mx-auto rounded-lg p-5">
        <p className="text-blue-600 text-xl">
          If this text is blue and centered in a white card on a red background,
          both inline styles and Tailwind are working.
        </p>
      </div>
    </div>
  );
}
