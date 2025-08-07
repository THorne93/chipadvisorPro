import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@ant-design/v5-patch-for-react-19';
import 'antd/dist/reset.css';
import { getSession } from '@/lib';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChipAdvisor",
  description: "Finding the perfect chip",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className="overflow-x-hidden min-h-screen bg-yellow-50" style={{ margin: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <NavBar session={session?.user ?? null} />
          <div className='bg-yellow-50' style={{ flex: '1 0 auto', padding: '24px 0' }}>
            <div className="sm:w-5/6 w-full pt-6 mx-auto">
              {children}
            </div>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
