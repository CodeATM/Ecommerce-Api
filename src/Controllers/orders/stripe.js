const stripe = require("stripe")(
  "sk_test_51OoLjHEJeAxIq05NTmgx4D9r9ysNc4WsX6U4dkrzVphbc3F6mY6jJrfPxwy4E4Ms4jXNdbPUaBj4GbIaQuXDOkWD00mBPPOcPB"
);
const catchAsync = require("../../utils/AsyncError");

YOUR_DOMAIN = "http://localhost:8000";

const Checkout = catchAsync(async (req, res, next) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: '{{PRICE_ID}}',
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${YOUR_DOMAIN}/`,
    cancel_url: `${YOUR_DOMAIN}/`,
  });

  res.redirect(303, session.url);
});

module.exports = { Checkout };
