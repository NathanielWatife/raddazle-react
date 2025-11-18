import React from 'react';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';

const Faq = () => {
  return (
    <Layout>
      <AnimatedSection className="container-fluid page-header py-5" animationClass="animate-fade-up">
        <h1 className="text-center text-white display-6">FAQs & Help</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active text-white">FAQs</li>
        </ol>
      </AnimatedSection>

      <AnimatedSection className="container py-5" animationClass="animate-fade-up">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h5>How long does shipping take?</h5>
            <p className="text-muted">Most orders are processed within 1-2 business days. Delivery times vary by location.</p>
            <h5 className="mt-4">Are your products authentic?</h5>
            <p className="text-muted">Yes. We sell 100% genuine, brand-new products only.</p>
            <h5 className="mt-4">What payment methods are accepted?</h5>
            <p className="text-muted">We accept major cards and trusted payment providers as shown at checkout.</p>
          </div>
        </div>
      </AnimatedSection>
    </Layout>
  );
};

export default Faq;
