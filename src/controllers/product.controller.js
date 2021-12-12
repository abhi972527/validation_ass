const express = require("express");
const { body, validationResult } = require("express-validator");

const Product = require("../models/product.model");

const router = express.Router();

router.post("/",
    // body("name").notEmpty().withMessage("Name is required"),
    body("name").isLength({ min: 4, max: 20 }).withMessage("Name atleast 4 max 20 char"),
    // body("price").notEmpty().withMessage("Price is required"),
    body("price").custom((value) => {
        // const isNumber = /^[0-9]*$/.test(value);
        // if (!isNumber || value <= 0) {
        if (value <= 0) {
            throw new Error("Price cannot be 0 or negative");
        }
        return true;
    }),
    body("email").custom(async (value) => {

        const isEmail = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,20}$/.test(value);
        if (!isEmail) {
            throw new Error("Enter proper email");
        }

        const productByEmail = await Product.findOne({ email: value }).lean().exec();

        if (productByEmail) {
            throw new Error("Try different email");
        }

        return true;
    }),
    async (req, res) => {
        const errors = validationResult(req);   // []
        if (!errors.isEmpty()) {
            let newErrors = errors.array().map(({ msg, param, location }) => {
                return {
                    [param]: msg,
                };
            });
            // return res.status(400).json({ errors: errors.array() });
            return res.status(400).json({ errors: newErrors });
        }
        try {
            const product = await Product.create(req.body);
            return res.status(201).json({ product });
        } catch (e) {
            return res.status(500).json({ message: e.message, status: "Failed" });

        }
    });

module.exports = router;