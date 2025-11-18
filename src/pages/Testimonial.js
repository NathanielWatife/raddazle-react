import React from 'react';
import Layout from '../components/Layout';

const Testimonial = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Client Name',
      profession: 'Profession',
      image: '/img/testimonial-1.jpg',
      text: 'Lorem Ipsum is simply dummy text of the printing Ipsum has been the industry\'s standard dummy text ever since the 1500s.'
    },
    {
      id: 2,
      name: 'Client Name',
      profession: 'Profession',
      image: '/img/testimonial-2.jpg',
      text: 'Lorem Ipsum is simply dummy text of the printing Ipsum has been the industry\'s standard dummy text ever since the 1500s.'
    }
  ];

  return (
    <Layout>
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">Testimonials</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active text-white">Testimonials</li>
        </ol>
      </div>
      {/* Testimonial Start */}
      <div className="container-fluid testimonial py-5">
        <div className="container py-5">
          <div className="testimonial-header text-center">
            <h4 className="text-primary">Our Testimonial</h4>
            <h1 className="display-5 mb-5 text-dark">Our Client Saying!</h1>
          </div>
          <div className="row justify-content-center">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="col-lg-6 mb-5">
                <div className="testimonial-item img-border-radius bg-light rounded p-4">
                  <div className="position-relative">
                    <i className="fa fa-quote-right fa-2x text-secondary position-absolute" 
                       style={{ bottom: '30px', right: 0 }}></i>
                    <div className="mb-4 pb-4 border-bottom border-secondary">
                      <p className="mb-0">{testimonial.text}</p>
                    </div>
                    <div className="d-flex align-items-center flex-nowrap">
                      <div className="bg-secondary rounded">
                        <img 
                          src={testimonial.image} 
                          className="img-fluid rounded" 
                          style={{ width: '100px', height: '100px' }} 
                          alt=""
                        />
                      </div>
                      <div className="ms-4 d-block">
                        <h4 className="text-dark">{testimonial.name}</h4>
                        <p className="m-0 pb-3">{testimonial.profession}</p>
                        <div className="d-flex pe-5">
                          <i className="fas fa-star text-primary"></i>
                          <i className="fas fa-star text-primary"></i>
                          <i className="fas fa-star text-primary"></i>
                          <i className="fas fa-star text-primary"></i>
                          <i className="fas fa-star"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Testimonial End */}
    </Layout>
  );
};

export default Testimonial;
