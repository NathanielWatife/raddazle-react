import React from 'react';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';

const Privacy = () => {
  return (
    <Layout>
      <AnimatedSection className="container-fluid page-header py-5" animationClass="animate-fade-up">
        <h1 className="text-center text-white display-6">Privacy Policy</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active text-white">Privacy</li>
        </ol>
      </AnimatedSection>

      <AnimatedSection className="container py-5" animationClass="animate-fade-up">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h3 className="mb-3">Your Privacy Matters</h3>
            <p className="text-muted">We respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard information when you use Raddazle.</p>
            <h5 className="mt-4">Information We Collect</h5>
            <p className="text-muted">Account details, order history, payment references (processed securely by our providers), and site usage data to improve your experience.</p>
            <h5 className="mt-4">How We Use Data</h5>
            <p className="text-muted">To process orders, provide customer support, personalize content, and comply with legal obligations.</p>
            <h5 className="mt-4">Your Choices</h5>
            <p className="text-muted">You can update or delete your account information in your profile. For data requests, contact <a href="mailto:support@raddazle.com">support@raddazle.com</a>.</p>
          </div>
        </div>
      </AnimatedSection>
    </Layout>
  );
};

export default Privacy;
