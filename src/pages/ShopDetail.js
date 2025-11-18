import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';
import { formatCurrency } from '../utils/currency';
import { productService } from '../services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ShopDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const fetchProduct = useCallback(async () => {
    try {
      const response = await productService.getById(id);
      setProduct(response.product);
      if (response.product?.category?._id) {
        fetchRelated(response.product.category._id, response.product._id);
      } else {
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const fetchRelated = async (categoryId, currentProductId) => {
    try {
      const { products } = await productService.getAll({ category: categoryId, pageSize: 4 });
      const filtered = (products || []).filter((item) => item._id !== currentProductId);
      setRelatedProducts(filtered);
    } catch (error) {
      console.error('Failed to load related products:', error);
      setRelatedProducts([]);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product._id, quantity);
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!product) return;
    setReviewSubmitting(true);
    try {
      await productService.addReview(product._id, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      await fetchProduct();
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to submit review.';
      toast.error(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const reviews = useMemo(() => product?.reviews || [], [product]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-5 text-center">
          <h2>Product not found</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Single Product Start */}
      <AnimatedSection className="container-fluid py-5 mt-5" animationClass="animate-fade-up">
        <div className="container py-5">
          <div className="row g-4 mb-5">
            <div className="col-lg-8 col-xl-9">
              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="border rounded">
                    <img 
                      src={product.image || '/img/single-item.jpg'} 
                      className="img-fluid rounded" 
                      alt={product.name}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <h4 className="fw-bold mb-3">{product.name}</h4>
                  <p className="mb-2"><strong>Brand:</strong> {product.brand || 'Raddazle'}</p>
                  <p className="mb-3"><strong>Category:</strong> {product.category?.name || 'N/A'}</p>
                  <h5 className="fw-bold mb-3">{formatCurrency(product.price)}</h5>
                  <div className="d-flex mb-4">
                    <i className="fa fa-star text-secondary"></i>
                    <i className="fa fa-star text-secondary"></i>
                    <i className="fa fa-star text-secondary"></i>
                    <i className="fa fa-star text-secondary"></i>
                    <i className="fa fa-star"></i>
                  </div>
                  <p className="mb-4">{product.description}</p>
                  {product.countInStock > 0 ? (
                    <>
                      <p className="mb-4"><span className="badge bg-success">In Stock: {product.countInStock} units</span></p>
                      <div className="input-group quantity mb-5" style={{ width: '100px' }}>
                        <div className="input-group-btn">
                          <button 
                            className="btn btn-sm btn-minus rounded-circle bg-light border"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            <i className="fa fa-minus"></i>
                          </button>
                        </div>
                        <input 
                          type="text" 
                          className="form-control form-control-sm text-center border-0" 
                          value={quantity}
                          readOnly
                        />
                        <div className="input-group-btn">
                          <button 
                            className="btn btn-sm btn-plus rounded-circle bg-light border"
                            onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                          >
                            <i className="fa fa-plus"></i>
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={handleAddToCart}
                        className="btn btn-primary btn-glow rounded-pill px-4 py-2 mb-4"
                      >
                        <i className="fa fa-shopping-bag me-2"></i> Add to Cart
                      </button>
                    </>
                  ) : (
                    <p className="text-danger">Out of stock</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-xl-3">
              <div className="row g-4 fruite">
                <div className="col-lg-12">
                  <div className="input-group w-100 mx-auto d-flex mb-4">
                    <input 
                      type="search" 
                      className="form-control p-3" 
                      placeholder="keywords" 
                    />
                    <span className="input-group-text p-3">
                      <i className="fa fa-search"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
      {/* Single Product End */}

      {/* Product Reviews Start */}
      <AnimatedSection className="container py-5" animationClass="animate-fade-up">
        <div className="row g-5">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="mb-4">Customer Reviews</h5>
                {reviews.length === 0 ? (
                  <p className="text-muted mb-0">No reviews yet. Be the first to share your thoughts.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id || review.user?._id} className="border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <strong>{review.name}</strong>
                        <span className="text-warning">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p className="mb-0 text-muted small">
                        {new Date(review.createdAt || product.createdAt).toLocaleDateString()}
                      </p>
                      <p className="mb-0 mt-2">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="mb-3">Write a Review</h5>
                {!isAuthenticated ? (
                  <p className="mb-0">
                    <Link to="/login">Login</Link> to share your experience.
                  </p>
                ) : (
                  <form onSubmit={handleAddReview}>
                    
                    <div className="mb-3">
                      <label htmlFor="rating" className="form-label">Rating</label>
                      <select
                        id="rating"
                        name="rating"
                        className="form-select"
                        value={reviewForm.rating}
                        onChange={handleReviewChange}
                      >
                        {[5, 4, 3, 2, 1].map((value) => (
                          <option key={value} value={value}>{value} - {value === 5 ? 'Excellent' : value === 4 ? 'Good' : value === 3 ? 'Average' : value === 2 ? 'Fair' : 'Poor'}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="comment" className="form-label">Comment</label>
                      <textarea
                        id="comment"
                        name="comment"
                        className="form-control"
                        rows={4}
                        value={reviewForm.comment}
                        onChange={handleReviewChange}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 btn-glow"
                      disabled={reviewSubmitting}
                    >
                      {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
      {/* Product Reviews End */}

      {/* Related Products Start */}
      <AnimatedSection className="container pb-5" animationClass="animate-fade-up">
        <h3 className="mb-4">Related products</h3>
        {relatedProducts.length === 0 ? (
          <p className="text-muted">No similar items to show right now.</p>
        ) : (
          <div className="row g-4">
            {relatedProducts.map((item) => (
              <div className="col-sm-6 col-lg-3" key={item._id}>
                <div className="card h-100 border-0 shadow-sm">
                  <img
                    src={item.image || '/img/fruite-item-1.jpg'}
                    className="card-img-top"
                    alt={item.name}
                    style={{ height: 180, objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h6 className="fw-semibold">{item.name}</h6>
                    <p className="text-muted small mb-2">{formatCurrency(item.price)}</p>
                    <Link to={`/shop/${item._id}`} className="stretched-link">View details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatedSection>
      {/* Related Products End */}
    </Layout>
  );
};

export default ShopDetail;
