const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getCategories)
  .post(protect, adminOnly, upload.single('image'), createCategory);

router.route('/:id')
  .get(getCategoryById)
  .put(protect, adminOnly, upload.single('image'), updateCategory)
  .delete(protect, adminOnly, deleteCategory);

module.exports = router;
