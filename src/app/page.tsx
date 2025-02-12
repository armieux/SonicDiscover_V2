"use client"
import Layout from './components/Layout';import Head from 'next/head';
import ChatWidget from "@/app/components/ChatWidget/ChatWidget";
import HypeTrain from "@/app/components/HypeTrain/HypeTrain";

const HomePage: React.FC = () => {

  return (

      <><Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon"/>
      </Head><Layout>{<>
          <div className="flex h-screen w-screen bg-[#121212] items-center justify-center flex-col">
              <h1 className="text-5xl text-white">Welcome to Sonic Discover!</h1>
              <HypeTrain />
          </div>
          <ChatWidget />
      </>}</Layout>
      </>
  );
};

export default HomePage;
