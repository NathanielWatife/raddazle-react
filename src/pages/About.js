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
            <h3 className="mb-3">The Ray Dazzle Story</h3>
            <p className="text-muted">Ray Dazzle was created to make everyday care simple, refreshing and reliable. From grooming to home hygiene, we offer trusted essentials: <br></br><b>AfterShave</b>, <br></br><b>Handwash</b>, <br></br><b>Haircare</b>, <br></br><b>Disinfectants</b>, <br></br><b>Dish Liquids</b> and ranges of everyday products all crafted to deliver comfort, cleanliness, and real results. </p>
            <p className="text-muted">With Ray Dazzle, quality meets affordability to give you products that keep you confident and your home cared for.</p>
            <h5>Ray Dazzle... Your Perfect Choice.</h5>
            <h5 className="mt-4">What We Value</h5>
            <p className="text-muted">Authenticity, customer happiness, and a seamless shopping experience.</p>
          </div>
        </div>
      </AnimatedSection>
    </Layout>
  );
};

export default About;
