import Head from 'next/head';
import SearchApp from '../components/SearchApp';

export default function Home() {
  return (
    <>
      <Head>
        <title>Founder's Research Hub</title>
        <meta name="description" content="Strategic insights powered by curated sources" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-white">
        <SearchApp />
      </div>
    </>
  );
}
