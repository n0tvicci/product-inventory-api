const Product = require("../models/tbl_product");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

module.exports.createProduct = async (req, res) => {
  try {
    const { name, unit, price, expirationDate, quantity } = req.body;

    if (!name || !unit || !price || !expirationDate || !quantity) {
      return res.status(400).send({ error: "Missing required fields." });
    }

    let fileData = {};
    if (req.file) {
      // Save image to cloudinary
      let uploadedFile;
      try {
        uploadedFile = await cloudinary.uploader.upload(req.file.path, {
          folder: "InfoTech",
          resource_type: "image",
        });
      } catch (error) {
        console.log(error);
        return res.status(400).send({ error: "Image could not be uploaded." });
      }

      fileData = {
        fileName: req.file.originalname,
        filePath: uploadedFile.secure_url,
        fileType: req.file.mimetype,
        fileSize: fileSizeFormatter(req.file.size, 2),
      };
    }

    const product = await Product.create({
      ...req.body,
      user: req.user._id,
      image: fileData,
    });

    return res.status(200).send({
      success: true,
      message: "Product successfully created",
      product,
    });
  } catch (error) {
    return res.status(400).send({ error: "Cannot create product." });
  }
};

module.exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      deleted: { $ne: true },
      user: req.user._id,
    }).sort("-createdAt");

    return res.status(200).send({
      success: true,
      products,
    });
  } catch (err) {
    return res.status(400).send({ error: "Cannot get products." });
  }
};

module.exports.getOneProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send({ error: "Product not found." });
    }

    return res.status(200).send({
      success: true,
      product,
    });
  } catch (err) {
    return res.status(400).send({ error: "Cannot get product." });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    // if product doesnt exist
    if (!product) {
      return res.status(404).send({ error: "Product not found." });
    }
    await Product.findByIdAndUpdate(req.params.id, { deleted: true });
    res.status(200).json({ success: true, message: "Product deleted." });
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: "Cannot delete product." });
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).send({ error: "Product not found." });
    }

    let fileData = {};
    if (req.file) {
      // Save image to cloudinary
      let uploadedFile;
      try {
        uploadedFile = await cloudinary.uploader.upload(req.file.path, {
          folder: "InfoTech",
          resource_type: "image",
        });
      } catch (error) {
        res.status(500);
        throw new Error("Image could not be uploaded");
      }

      fileData = {
        fileName: req.file.originalname,
        filePath: uploadedFile.secure_url,
        fileType: req.file.mimetype,
        fileSize: fileSizeFormatter(req.file.size, 2),
      };
    }

    const p = await Product.findByIdAndUpdate(
      id,
      {
        ...req.body,
        image: Object.keys(fileData).length === 0 ? product?.image : fileData,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "Product updated.", p });
  } catch (error) {
    res.status(400).send({ error: "Cannot update product." });
  }
};
