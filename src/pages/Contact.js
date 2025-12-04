import React, { useState } from 'react';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';
import { contactService } from '../services';
import { useToast } from '../context/ToastContext';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const body = { name: form.name, email: form.email, subject: form.subject, phone: form.phone, message: form.message };
      const res = await contactService.submit(body);
      if (res?.success) {
        toast.success('Message sent! We will get back to you soon.');
        setForm({ name: '', email: '', subject: '', phone: '', message: '' });
      } else {
        throw new Error(res?.message || 'Failed to send message');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <AnimatedSection className="container-fluid page-header py-5" animationClass="animate-fade-up">
        <h1 className="text-center text-white display-6">Contact Us</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active text-white">Contact</li>
        </ol>
      </AnimatedSection>
      {/* Contact Start */}
      <AnimatedSection className="container-fluid contact py-5" animationClass="animate-fade-up">
        <div className="container py-5">
          <div className="p-5 bg-light rounded">
            <div className="row g-4">
              <div className="col-12">
                <div className="text-center mx-auto" style={{ maxWidth: '700px' }}>
                  <h1 className="text-primary">Get in touch</h1>
                  <p className="mb-4">
                    Have questions about our collections? Whether you're choosing grooming essentials or elevating your home-care routine, our experts are here to offer refined guidance and help you select the perfect products for a cleaner, more elevated everyday experience. 
                    Our fragrance experts are here to help you find your signature scent.
                  </p>
                </div>
              </div>
              {/* Google Maps - Commented out
              <div className="col-lg-12">
                <div className="h-100 rounded">
                  <iframe 
                    className="rounded w-100" 
                    style={{ height: '400px' }} 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387191.33750346623!2d-73.97968099999999!3d40.6974881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sbd!4v1694259649153!5m2!1sen!2sbd" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Raddazle location map"
                  ></iframe>
                </div>
              </div>
              */}
              <div className="col-lg-7">
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    className="w-100 form-control border-0 py-3 mb-3"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e)=>setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    className="w-100 form-control border-0 py-3 mb-3"
                    placeholder="Your Email"
                    value={form.email}
                    onChange={(e)=>setForm({ ...form, email: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="w-100 form-control border-0 py-3 mb-3"
                    placeholder="Subject (optional)"
                    value={form.subject}
                    onChange={(e)=>setForm({ ...form, subject: e.target.value })}
                  />
                  <input
                    type="tel"
                    className="w-100 form-control border-0 py-3 mb-3"
                    placeholder="Phone (optional)"
                    value={form.phone}
                    onChange={(e)=>setForm({ ...form, phone: e.target.value })}
                  />
                  <textarea
                    className="w-100 form-control border-0 mb-3"
                    rows="5"
                    placeholder="Your Message"
                    value={form.message}
                    onChange={(e)=>setForm({ ...form, message: e.target.value })}
                    required
                  ></textarea>
                  <button
                    className="w-100 btn btn-primary form-control py-3 btn-glow"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Sending…' : 'Submit'}
                  </button>
                </form>
              </div>
              <div className="col-lg-5">
                <div className="d-flex p-4 rounded mb-4 bg-white hover-lift">
                  <i className="fas fa-map-marker-alt fa-2x text-primary me-4"></i>
                  <div>
                    <h4>Address</h4>
                    <p className="mb-2">Lagos, Nigeria</p>
                  </div>
                </div>
                <div className="d-flex p-4 rounded mb-4 bg-white hover-lift">
                  <i className="fas fa-envelope fa-2x text-primary me-4"></i>
                  <div>
                    <h4>Mail Us</h4>
                    <p className="mb-2">support@raddazle.com</p>
                  </div>
                </div>
                <div className="d-flex p-4 rounded bg-white hover-lift">
                  <i className="fa fa-phone-alt fa-2x text-primary me-4"></i>
                  <div>
                    <h4>Telephone</h4>
                    <p className="mb-2">+234 800 000 0000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
      {/* Contact End */}
    </Layout>
  );
};

export default Contact;
