const stripe = require("stripe")(process.env.STRIPE_KEY);
const Product = require("../../Model/ProductModel")

const YOUR_DOMAIN = process.env.YOUR_DOMAIN;

const Checkout = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }

    // Prepare line items for Stripe
    const lineItems = [];
    for (const item of items) {
      const { productId, size, quantity, colour } = item;

      if (!productId || !size || !quantity || !colour) {
        return res
          .status(400)
          .json({ error: "productId, size, quantity, and colour are required" });
      }

      // Fetch product from MongoDB
      const product = await Product.findOne({ productId });

      if (!product) {
        return res.status(404).json({ error: `Product with ID ${productId} not found` });
      }

      // Validate size and color
      if (!product.sizes.includes(size)) {
        return res
          .status(400)
          .json({ error: `Size ${size} not available for product ID ${productId}` });
      }
      if (!product.colors.includes(colour)) {
        return res
          .status(400)
          .json({ error: `Color ${colour} not available for product ID ${productId}` });
      }

      // Determine price (use discounted price if available)
      const price = product.discountedPrice || product.price;

      // Add line item
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: `Selected Size: ${size}, Selected Colour: ${colour}`,
            images: [product.imageCover],
          },
          unit_amount: price,
        },
        quantity,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${YOUR_DOMAIN}/`,
      cancel_url: `${YOUR_DOMAIN}/`,
    });

    res.status(303).json({ session });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { Checkout };

