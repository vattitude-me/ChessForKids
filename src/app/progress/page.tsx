import { redirect } from 'next/navigation';

// Progress now lives on the profile ("Me") page.
export default function ProgressPage() {
  redirect('/profile');
}
