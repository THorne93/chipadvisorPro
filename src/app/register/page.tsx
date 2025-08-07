// app/register/page.tsx
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import RegisterForm from './RegisterForm';
export const metadata: Metadata = {
  title: 'Register - ChipAdvisor',
};


export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
