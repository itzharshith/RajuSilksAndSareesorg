'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  image: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setImageFile(null);
    setExistingImage('');
    setImagePreview('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingId(cat._id);
    setName(cat.name);
    setImageFile(null);
    setExistingImage(cat.image || '');
    setImagePreview('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? (Note: It must be empty of products)')) {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchCategories();
        } else {
          const data = await res.json();
          alert(data.message || 'Failed to delete category.');
        }
      } catch (err) {
        alert('Failed to delete category.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name) {
      setFormError('Category name is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save category.');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save category.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-cream-text/20 gap-4">
        <span className="text-sm text-gray-500 font-medium">Manage traditional silk saree classification categories and banners.</span>
        <button
          onClick={openAddModal}
          className="bg-brand-blue hover:bg-brand-blue-deep text-white text-xs font-bold py-2 px-4 rounded-lg border border-brand-cream-text/25 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* CRUD MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-brand-cream-text/20 animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-brand-blue px-6 py-4 flex items-center justify-between border-b border-brand-cream-text/25 text-white">
              <span className="font-serif font-bold text-sm text-brand-cream-text">{editingId ? 'Edit Category' : 'Create Category'}</span>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-cream-text hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg">{formError}</p>}

              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bridal Collection"
                  className="w-full text-xs bg-brand-cream/35 border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800 font-semibold"
                />
              </div>

              {/* Image upload */}
              <div className="pt-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Category Banner Image</label>
                
                <input
                  type="file"
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-cream file:text-brand-blue hover:file:bg-brand-cream-text/20 cursor-pointer"
                />

                {/* Newly selected image preview */}
                {imagePreview && (
                  <div className="mt-3">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">New Banner Preview</span>
                    <img src={imagePreview} alt="" className="h-20 w-36 object-cover rounded border border-brand-cream-text/10" />
                  </div>
                )}

                {/* Existing image preview */}
                {!imagePreview && existingImage && (
                  <div className="mt-3">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Current Banner Banner</span>
                    <img src={existingImage} alt="" className="h-20 w-36 object-cover rounded border border-brand-cream-text/10" />
                  </div>
                )}
              </div>

              {/* Actions */}
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
                  className="bg-brand-blue text-white text-xs font-bold px-5 py-2 rounded-lg border border-brand-cream-text/25"
                >
                  Save Category
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CATEGORY GRID */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-blue"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-brand-cream-text/15 rounded-xl p-16 text-center shadow-luxury">
          <p className="font-serif italic text-brand-blue-deep text-lg mb-2">No categories found in database.</p>
          <button
            onClick={openAddModal}
            className="bg-brand-blue text-white text-xs font-semibold px-6 py-2.5 rounded-full border border-brand-cream-text/20"
          >
            Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat._id}
              className="bg-white rounded-xl border border-brand-cream-text/15 p-4 shadow-luxury flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="aspect-[16/9] w-full bg-brand-cream rounded overflow-hidden border border-brand-cream-text/10 relative">
                  <img src={cat.image || '/placeholder.png'} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className="font-serif font-bold text-sm text-brand-blue-deep block">{cat.name}</span>
              </div>

              <div className="flex justify-end gap-2 border-t border-brand-cream-dark mt-4 pt-3">
                <button
                  onClick={() => openEditModal(cat)}
                  className="text-gray-500 hover:text-brand-cream-text p-1"
                  title="Edit Category"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat._id)}
                  className="text-gray-500 hover:text-red-700 p-1"
                  title="Delete Category"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
