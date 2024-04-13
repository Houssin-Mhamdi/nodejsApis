const Product = require("../models/productModle");
const asyncHandler = require("express-async-handler");
const { validateMongoDbId } = require("../utils/validateMongodbId.js");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const objQuery = { ...req.query };
    const excludeFields = ["sort", "page", "limit", "fields"];
    excludeFields.forEach((el) => delete objQuery[el]);
    let queryStr = JSON.stringify(objQuery);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query.sort(sortBy);
    } else {
      query.sort("-createdAt");
    }

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) {
        throw new Error("Page out of range");
      }
    }
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query.select(fields);
    } else {
      query = query.select("-__v");
    }

    const products = await query;
    res.json(products);
  } catch (error) {
    throw new Error(error);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getaproduct = await Product.findById(id);
    res.json(getaproduct);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteProduct = await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully", deleteProduct });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getAllProduct,
  getaProduct,
  updateProduct,
  deleteProduct,
};