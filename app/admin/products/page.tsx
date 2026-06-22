'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Star } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  discount: number;
  featured: boolean;
  images: string[];
  category?: {
    _id: string;
    name: string;
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [discount, setDiscount] = useState('0');
  const [featured, setFeatured] = useState(false);
  
  // Images Upload states
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.pages || 1);
        setCurrentPage(data.page || 1);
      }
    } catch (err) {
      console.error('Error loading products list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Fetch Categories for dropdown selector
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data || []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setCategory(categories[0]?._id || '');
    setPrice('');
    setStock('');
    setDiscount('0');
    setFeatured(false);
    setImageFiles([]);
    setExistingImages([]);
    setImagePreviews([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingId(prod._id);
    setName(prod.name);
    setDescription(prod.description);
    setCategory(prod.category?._id || '');
    setPrice(prod.price.toString());
    setStock(prod.stock.toString());
    setDiscount(prod.discount.toString());
    setFeatured(prod.featured);
    setImageFiles([]);
    setExistingImages(prod.images || []);
    setImagePreviews([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setImageFiles(files);

    // Create local object URLs for previewing
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveExistingImage = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchProducts(currentPage);
        } else {
          const data = await res.json();
          alert(data.message || 'Failed to delete product.');
        }
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !description || !category || !price || stock === '') {
      setFormError('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('discount', discount);
    formData.append('featured', String(featured));

    // Append existing images retained
    existingImages.forEach(img => {
      formData.append('existingImages', img);
    });

    // Append new files
    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save product details.');
      }

      setIsModalOpen(false);
      fetchProducts(currentPage);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product details.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-cream-text/20 gap-4">
        <span className="text-sm text-gray-500 font-medium">Manage product pricing, inventories, discounts and image details.</span>
        <button
          onClick={openAddModal}
          className="bg-brand-blue hover:bg-brand-blue-deep text-white text-xs font-bold py-2 px-4 rounded-lg border border-brand-cream-text/25 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* CRUD MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl border border-brand-cream-text/20 animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-brand-blue px-6 py-4 flex items-center justify-between border-b border-brand-cream-text/25 text-white">
              <span className="font-serif font-bold text-sm text-brand-cream-text">{editingId ? 'Edit Product Details' : 'Add New Product'}</span>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-cream-text hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              {formError && <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg">{formError}</p>}

              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Product Title *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Crimson Pure Silk Saree"
                    className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Weaving Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                  >
                    <option value="" disabled>Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Weaving details description *</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of zari, yarn quality, weaving patterns..."
                  className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                />
              </div>

              {/* Pricing, stock levels, discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 18500"
                    className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Stock count *</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Discount percentage</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                  />
                </div>
              </div>

              {/* Checkboxes: Featured */}
              <label className="flex items-center space-x-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-brand-cream-text/30 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-xs text-gray-700 font-semibold select-none">Mark as Featured Masterpiece</span>
              </label>

              {/* Images uploads */}
              <div className="pt-2 border-t border-brand-cream-dark">
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Product Images</label>
                
                {/* File picker */}
                <input
                  type="file"
                  multiple
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-cream file:text-brand-blue hover:file:bg-brand-cream-text/20 cursor-pointer"
                />

                {/* Previews of newly selected files */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase">New uploads previews</span>
                    <div className="flex gap-2.5 overflow-x-auto">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="h-16 w-14 border border-brand-cream-text/20 rounded overflow-hidden relative shrink-0">
                          <img src={preview} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previews of existing files */}
                {existingImages.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Existing Images (click X to delete)</span>
                    <div className="flex gap-2.5 overflow-x-auto">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="h-16 w-14 border border-brand-cream-text/20 rounded overflow-hidden relative shrink-0">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(idx)}
                            className="absolute top-0.5 right-0.5 bg-red-700 text-white rounded-full p-0.5 hover:bg-red-800 shadow animate-scale-up"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-brand-cream-dark">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-500 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-blue text-white text-xs font-bold px-6 py-2 rounded-lg border border-brand-cream-text/25"
                >
                  Save Product
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* PRODUCTS LIST TABLE */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-brand-cream-text/15 rounded-xl p-16 text-center shadow-luxury">
          <p className="font-serif italic text-brand-blue-deep text-lg mb-2">No product designs found in database.</p>
          <button
            onClick={openAddModal}
            className="bg-brand-blue text-white text-xs font-semibold px-6 py-2.5 rounded-full border border-brand-cream-text/20"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-brand-cream-text/15 shadow-luxury overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-brand-cream/50 text-gray-500 uppercase font-bold border-b border-brand-cream-text/10">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Discount</th>
                  <th className="px-6 py-3">Featured</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-brand-cream/15">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 max-w-sm">
                        <img src={prod.images?.[0] || '/placeholder.png'} alt="" className="h-10 w-8 object-cover rounded border border-brand-cream-text/10" />
                        <span className="font-serif font-bold text-brand-blue-deep truncate block">{prod.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{prod.category?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">₹{prod.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 border rounded text-[10px] font-bold ${
                        prod.stock > 3 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'
                      }`}>
                        {prod.stock} left
                      </span>
                    </td>
                    <td className="px-6 py-4">{prod.discount}%</td>
                    <td className="px-6 py-4">
                      {prod.featured ? (
                        <span className="text-brand-cream-text flex items-center gap-0.5 text-[10px] font-bold uppercase">
                          <Star size={11} fill="#D4AF37" className="text-[#D4AF37]" /> Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="text-gray-400 hover:text-brand-cream-text p-1"
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="text-gray-400 hover:text-red-700 p-1"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {products.map((prod) => (
              <div key={prod._id} className="p-4 space-y-3 hover:bg-brand-cream/5">
                <div className="flex items-start space-x-3">
                  <img 
                    src={prod.images?.[0] || '/placeholder.png'} 
                    alt="" 
                    className="h-16 w-14 object-cover rounded border border-brand-cream-text/10 shrink-0" 
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-brand-cream-text font-bold uppercase tracking-wider block">
                      {prod.category?.name || 'Unassigned'}
                    </span>
                    <span className="font-serif font-bold text-brand-blue-deep block text-sm truncate">
                      {prod.name}
                    </span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-xs font-semibold text-gray-800 font-sans">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      {prod.discount > 0 && (
                        <span className="text-[9px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded ml-1">
                          {prod.discount}% Off
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 border rounded text-[9px] font-bold ${
                      prod.stock > 3 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'
                    }`}>
                      {prod.stock} left
                    </span>
                    {prod.featured ? (
                      <span className="text-brand-cream-text flex items-center gap-0.5 text-[9px] font-bold uppercase">
                        <Star size={10} fill="#D4AF37" className="text-[#D4AF37]" /> Featured
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="text-gray-500 hover:text-brand-blue-deep flex items-center gap-1 border border-brand-cream-text/25 px-2.5 py-1 rounded bg-brand-cream/10"
                      title="Edit Product"
                    >
                      <Edit size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod._id)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 border border-red-200 px-2.5 py-1 rounded bg-red-50"
                      title="Delete Product"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Simple Pagination */}
          {totalPages > 1 && (
            <div className="bg-brand-cream/20 py-3 px-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-sans">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchProducts(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-brand-cream-text/15 rounded bg-white hover:border-brand-cream-text disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => fetchProducts(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-brand-cream-text/15 rounded bg-white hover:border-brand-cream-text disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
