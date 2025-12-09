import type { Metadata } from 'next';
import DashboardPage from './_components/dahsboard-page';
import { getUser } from '@/lib/get-session';
import { redirect } from 'next/navigation';

export default async function AboutPage() {

  const user = await getUser();
  if (!user) {
    redirect(`/login`);
  }
  return <DashboardPage />;
}
