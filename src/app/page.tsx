import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to master-admin dashboard by default
  redirect('/master-admin');
}

