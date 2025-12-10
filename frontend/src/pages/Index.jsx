import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { FeaturedRooms } from '@/components/home/FeaturedRooms';
import { TopHostels } from '@/components/home/TopHostels';
import { HowItWorks } from '@/components/home/HowItWorks';

const Index = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Layout>
      <Hero />
      <FeaturedRooms />
      <TopHostels />
      <HowItWorks />
    </Layout>
  );
};

export default Index;
