import React from 'react';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';

const Terms = () => {
  return (
    <Layout>
      <AnimatedSection className="container-fluid page-header py-5" animationClass="animate-fade-up">
        <h1 className="text-center text-white display-6">Terms & Conditions</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active text-white">Terms</li>
        </ol>
      </AnimatedSection>

      <AnimatedSection className="container py-5" animationClass="animate-fade-up">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h3 className="mb-3">Welcome to Raddazle</h3>
            <p className="text-muted">By using our website, you agree to these terms. Please read them carefully.</p>
            <h5 className="mt-4">Orders & Payments</h5>
            <p className="text-muted">All orders are subject to availability and confirmation of payment. Prices and promotions may change without notice.</p>
            <h5 className="mt-4">Use of Site</h5>
            <p className="text-muted">You agree not to misuse the site or engage in fraudulent activities. We may suspend accounts that violate our policies.</p>
            <h5 className="mt-4">Contact</h5>
            <p className="text-muted">Questions? Email <a href="mailto:support@raddazle.com">support@raddazle.com</a>.</p>
          </div>
        </div>
      </AnimatedSection>
    </Layout>
  );
};

export default Terms;
