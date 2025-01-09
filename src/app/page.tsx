"use client"
import Layout from './components/Layout';import Head from 'next/head';
import ChatWidget from "@/app/components/ChatWidget/ChatWidget";

const HomePage: React.FC = () => {
  return (
      <><Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon"/>
      </Head><Layout>{<>
          <div className="flex h-screen w-screen bg-[#353445] items-center justify-center">
              <h1 className="text-5xl text-white">Welcome to Sonic Discover!</h1>
          </div>
          <ChatWidget />
      </>}</Layout>
      </>
  );
};

export default HomePage;
