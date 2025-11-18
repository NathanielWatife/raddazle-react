import React from 'react';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';

const About = () => {
  return (
    <Layout>
      <AnimatedSection className="container-fluid page-header py-5" animationClass="animate-fade-up">
        <h1 className="text-center text-white display-6">About Us</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active text-white">About</li>
        </ol>
      </AnimatedSection>

      <AnimatedSection className="container py-5" animationClass="animate-fade-up">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h3 className="mb-3">The Raddazle Story</h3>
            <p className="text-muted">We curate luxury fragrances from top designers and niche houses, delivering authentic scents at fair prices. Our mission is to make premium perfumes accessible and delightful.</p>
            <h5 className="mt-4">What We Value</h5>
            <p className="text-muted">Authenticity, customer happiness, and a seamless shopping experience.</p>
          </div>
        </div>
      </AnimatedSection>
    </Layout>
  );
};

export default About;
