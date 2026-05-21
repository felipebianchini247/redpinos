import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';

export default async function AdminLoginPage() {
  const token = cookies().get('admin_session')?.value;
  if (token && (await verifySessionToken(token))) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="login-page">
      <LoginForm />
    </div>
  );
}
