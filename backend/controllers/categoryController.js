const Category = require('../models/Category');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
const { isConfigured, cloudinary } = require('../config/cloudinary');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    let imageUrl = '/images/placeholder-category.jpg';

    if (req.file) {
      if (isConfigured) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'raju_silks/categories',
          });
          imageUrl = result.secure_url;
          // Delete local file after uploading to Cloudinary
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error('Cloudinary upload error, fallback to local path:', err);
          imageUrl = `/uploads/${req.file.filename}`;
        }
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    const category = await Category.create({
      name,
      image: imageUrl
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name || category.name;

      if (req.file) {
        let imageUrl;
        if (isConfigured) {
          try {
            const result = await cloudinary.uploader.upload(req.file.path, {
              folder: 'raju_silks/categories',
            });
            imageUrl = result.secure_url;
            fs.unlinkSync(req.file.path);
          } catch (err) {
            console.error('Cloudinary upload error, fallback to local path:', err);
            imageUrl = `/uploads/${req.file.filename}`;
          }
        } else {
          imageUrl = `/uploads/${req.file.filename}`;
        }
        
        // Optionally delete old local image file if it exists and was local
        if (category.image && category.image.startsWith('/uploads/')) {
          const oldPath = path.join(__dirname, '..', category.image);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        
        category.image = imageUrl;
      }

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category containing products. Please reassign or delete the products first.' 
      });
    }

    // Delete image if local
    if (category.image && category.image.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', category.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
