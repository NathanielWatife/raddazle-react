import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';

const Layout = ({ children }) => {
  useEffect(() => {
    document.body.classList.add('theme-gold-light');
    return () => document.body.classList.remove('theme-gold-light');
  }, []);
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
};

export default Layout;
