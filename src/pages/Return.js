import React from 'react';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';

const Return = () => {
  return (
    <Layout>
      <AnimatedSection className="container-fluid page-header py-5" animationClass="animate-fade-up">
        <h1 className="text-center text-white display-6">Returns & Refunds</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active text-white">Returns</li>
        </ol>
      </AnimatedSection>

      <AnimatedSection className="container py-5" animationClass="animate-fade-up">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h3 className="mb-3">30-Day Return Policy</h3>
            <p className="text-muted">If you're not fully satisfied, you can return eligible items within 30 days of delivery. Items must be unused and in original packaging.</p>
            <h5 className="mt-4">How to Start a Return</h5>
            <p className="text-muted">Contact our support team at <a href="mailto:support@raddazle.com">support@raddazle.com</a> with your order number.</p>
            <h5 className="mt-4">Refunds</h5>
            <p className="text-muted">Refunds are issued to the original payment method after inspection. Shipping fees may be non-refundable unless required by law.</p>
          </div>
        </div>
      </AnimatedSection>
    </Layout>
  );
};

export default Return;
