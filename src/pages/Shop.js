import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';
import ProductCard from '../components/ProductCard';
import { formatCurrency } from '../utils/currency';
import { productService, categoryService } from '../services';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'name'
  });
  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.sort) params.sort = filters.sort;

      const response = await productService.getAll(params);
      setProducts(response.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Keep URL in sync when filters change (search, category, sort, min/max price)
  useEffect(() => {
    const next = new URLSearchParams();
    if (filters.search) next.set('search', filters.search);
    if (filters.category) next.set('category', filters.category);
    if (filters.sort && filters.sort !== 'name') next.set('sort', filters.sort);
    if (filters.minPrice) next.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice) next.set('maxPrice', String(filters.maxPrice));
    setSearchParams(next);
  }, [filters.search, filters.category, filters.sort, filters.minPrice, filters.maxPrice, setSearchParams]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll({ includeCounts: true });
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // (moved fetchProducts above, wrapped in useCallback)

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id, 1);
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  return (
    <Layout>
      {/* Page Header Start */}
      <AnimatedSection className="container-fluid page-header py-5" animationClass="animate-fade-up">
        <h1 className="text-center text-white display-6">Fragrance Shop</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active text-white">Shop</li>
        </ol>
      </AnimatedSection>
      {/* Page Header End */}

      {/* Fruits Shop Start */}
      <AnimatedSection className="container-fluid fruite py-5" animationClass="animate-fade-up">
        <div className="container py-5">
          <h1 className="mb-4">Luxury Fragrance Collection</h1>
          <div className="row g-4">
            <div className="col-lg-12">
              <div className="row g-3 g-md-4 align-items-stretch">
                <div className="col-12 col-lg-4">
                  <div className="input-group w-100 mx-auto d-flex">
                    <input 
                      type="search" 
                      className="form-control p-3" 
                      placeholder="keywords" 
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                    <span className="input-group-text p-3">
                      <i className="fa fa-search"></i>
                    </span>
                  </div>
                </div>
                <div className="d-none d-lg-block col-lg-4"></div>
                <div className="col-12 col-lg-4">
                  <div className="bg-light ps-3 py-3 rounded d-flex justify-content-between mb-0 mb-lg-4">
                    <label htmlFor="fruits">Default Sorting:</label>
                    <select 
                      id="fruits" 
                      className="border-0 form-select-sm bg-light me-3" 
                      value={filters.sort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                    >
                      <option value="name">Name</option>
                      <option value="price">Price: Low to High</option>
                      <option value="-price">Price: High to Low</option>
                      <option value="-createdAt">Newest</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="row g-4">
                <div className="col-12 col-lg-3">
                  <div className="row g-4">
                    <div className="col-lg-12">
                      <div className="mb-3">
                        <h4>Categories</h4>
                        <ul className="list-unstyled fruite-categorie">
                          <li>
                            <div className="d-flex justify-content-between fruite-name">
                              <button
                                type="button"
                                className="btn btn-link p-0 text-start"
                                onClick={() => handleFilterChange('category', '')}
                              >
                                <i className="fas fa-spray-can me-2"></i>All
                              </button>
                            </div>
                          </li>
                          {categories.map(cat => (
                            <li key={cat._id}>
                              <div className="d-flex justify-content-between fruite-name">
                                <button
                                  type="button"
                                  className="btn btn-link p-0 text-start"
                                  onClick={() => handleFilterChange('category', cat._id)}
                                >
                                  <i className="fas fa-spray-can me-2"></i>{cat.name}
                                </button>
                                <span>({cat.productCount || 0})</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="mb-3">
                        <h4 className="mb-2">Price</h4>
                        <input 
                          type="range" 
                          className="form-range w-100" 
                          min="0" 
                          max="500" 
                          value={filters.maxPrice || 500}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        />
                        <div className="d-flex justify-content-between">
                          <span>{formatCurrency(0)}</span>
                          <span>{formatCurrency(filters.maxPrice || 500)}</span>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-9">
                  <div className="row g-4 justify-content-center">
                    {loading ? (
                      <div className="col-12 text-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="col-12 text-center">
                        <p>No products found</p>
                      </div>
                    ) : (
                      products.map((product) => (
                        <ProductCard 
                          key={product._id} 
                          product={product} 
                          onAddToCart={handleAddToCart}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
      {/* Fruits Shop End */}
    </Layout>
  );
};

export default Shop;
