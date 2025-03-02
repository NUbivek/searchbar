import { useState } from 'react';
import Head from 'next/head';
import { Tab } from '@headlessui/react';
import OpenSearch from '../components/OpenSearch';
import VerifiedSearch from '../components/VerifiedSearch';
import { FaSearch, FaProjectDiagram } from 'react-icons/fa';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Home() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedModel, setSelectedModel] = useState('mixtral-8x7b');

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Research Hub</title>
        <meta name="description" content="Comprehensive research tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Research Hub</h1>
          <p className="text-gray-600 mt-1">Search across web, academic sources, and more.</p>
        </div>
        
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-2 rounded-xl bg-blue-100 p-1 mb-6 max-w-md mx-auto">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'
                )
              }
            >
              <FaSearch className="mr-2" /> Open Research
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center',
                  'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'
                )
              }
            >
              <FaProjectDiagram className="mr-2" /> Network Map
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-2">
            <Tab.Panel>
              <OpenSearch 
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
              />
            </Tab.Panel>
            <Tab.Panel>
              <VerifiedSearch 
                isNetworkMapMode={true} 
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>
    </div>
  );
}
