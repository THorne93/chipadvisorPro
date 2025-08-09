'use client';

import { useState, useEffect } from 'react';
import { Button, Layout, Menu, Input } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import LoginModal from './LoginModal';
const { Header } = Layout;
const { Search } = Input;

interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export default function NavBar({ session }: { session: User | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [hydrated, setHydrated] = useState(false);

  const router = useRouter();
  const pathname = usePathname(); // ✅ Detect route changes

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    setHydrated(true);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Close mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSearch = (value: string) => {
    if (!value.trim()) return;
    setSearchValue('');
    setMenuOpen(false);
    router.push(`/search?query=${encodeURIComponent(value)}`);
  };

  const navItems = [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'newreview', label: 'New Restaurant', href: '/newreview' },
    { key: 'about', label: 'About', href: '/about' },
    ...(session?.role === 'ADMIN' ? [{ key: 'admin', label: 'Admin', href: '/admin' }] : []),
  ];

  const menuLinks = navItems.map(item => (
    <Link key={item.key} href={item.href} onClick={() => setMenuOpen(false)}>
      <div style={{
        padding: '8px 16px',
        borderRadius: 6,
        cursor: 'pointer',
        backgroundColor: 'transparent',
        transition: 'background-color 0.3s',
      }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff176')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        {item.label}
      </div>
    </Link>
  ));

  const sessionSection = session ? (
    <>
      <div style={{ color: '#000' }}>{session.name}</div>
      <Button
        type="primary"
        style={{ alignSelf: 'center' }}
        onClick={() => {
          fetch('/api/logout', { method: 'POST' }).then(() => window.location.reload());
          setMenuOpen(false);
        }}
      >
        Logout
      </Button>
    </>
  ) : (
    <Button type="primary" onClick={() => setLoginModalOpen(true)}>
      Login
    </Button>
  );

  if (!hydrated) return null;

  return (
    <Header style={{
      backgroundColor: '#FDDF00',
      padding: '0 16px',
      height: 64,
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {isMobile ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ fontWeight: 'bold', fontSize: 20 }}>CHIP ADVISOR</div>
            <Button
              type="text"
              icon={menuOpen ? <CloseOutlined /> : <MenuOutlined />}
              onClick={() => setMenuOpen(prev => !prev)}
              style={{ fontSize: 24 }}
            />
          </div>

          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: 64,
              left: 0,
              width: '100%',
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              {menuLinks}
              <Search
                placeholder="Search restaurants"
                enterButton
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onSearch={handleSearch}
              />
              <div style={{ borderTop: '1px solid #eee', marginTop: 12 }} />
              {sessionSection}
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {/* Left links */}
          <Menu
            theme="light"
            mode="horizontal"
            defaultSelectedKeys={['home']}
            items={navItems.map(item => ({
              key: item.key,
              label: <Link href={item.href}>{item.label}</Link>,
            }))}
            style={{ flex: 1, backgroundColor: 'transparent' }}
          />

          {/* Center search */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Search
              placeholder="Search restaurants"
              enterButton
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onSearch={handleSearch}
              style={{ maxWidth: 400, width: '100%' }}
            />
          </div>

          {/* Right: session */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
            {sessionSection}
          </div>
        </div>
      )}
      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </Header>
  );
}
