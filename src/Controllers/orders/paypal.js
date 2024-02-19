// import * as paypal from "../utils/paypalConfig";

import axios from "axios";
const base = "https://api-m.sandbox.paypal.com";

const generateAccessToken = async () => {
  try {
    console.log('here')
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET
    ).toString("base64");
    const response = await axios.post(
      `${base}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    )

    console.log(response.data.access_token)
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};

export const createOrder = async (cart) => {
  try {
    console.log(
      "shopping cart information passed from the frontend createOrder() callback:",
      cart
    );
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "100.00",
          },
        },
      ],
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Failed to create order:", error);
  }
};

export const captureOrder = async (orderID) => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;

    const response = await axios.post(url, null, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Failed to capture order:", error);
  }
};

async function handleResponse(response) {
  try {
    const jsonResponse = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}



// export const startPayment = () => async (req, res) => {
//   try {
//     console.log('here')
//     // use the cart information passed from the front-end to calculate the order amount detals
//     const { cart } = req.body;
//     const { jsonResponse, httpStatusCode } = await paypal.createOrder(cart);
//     res.status(httpStatusCode).json(jsonResponse);
//   } catch (error) {
//     console.error("Failed to create order:", error);
//     res.status(500).json({ error: "Failed to create order." });
//   }
// };



// export const PaymentStageTwo = () => async (req, res) => {
//   try {
//     const { orderID } = req.params;
//     const { jsonResponse, httpStatusCode } = await paypal.captureOrder(orderID);
//     res.status(httpStatusCode).json(jsonResponse);
//   } catch (error) {
//     console.error("Failed to create order:", error);
//     res.status(500).json({ error: "Failed to capture order." });
//   }
// };


















//========================== 2nd attempt ================================


const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_CLIENT_SECRET;

// Base64 encode the client ID and secret for basic authentication
const credentials = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64');

// Route handler for processing payments
export const payment = () => async (req, res) => {
    try {
        // Extract payment data from request body
        const { amount, cardNumber, expiry, cvv, name, billingAddress } = req.body;

        // Create order
        const orderResponse = await axios.post(
            'https://api-m.sandbox.paypal.com/v2/checkout/orders',
            {
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: amount
                        }
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const orderId = orderResponse.data.id;

        // Authorize payment
        const authorizationResponse = await axios.post(
            `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/authorize`,
            {
                intent: 'AUTHORIZE',
                payer: {
                    payment_method: 'credit_card',
                    funding_instruments: [
                        {
                            credit_card: {
                                number: cardNumber,
                                expiry,
                                cvv,
                                name,
                                billing_address: billingAddress
                            }
                        }
                    ]
                }
            },
            {
                headers: {
                    Authorization: `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const authorizationId = authorizationResponse.data.id;

        // Capture payment
        const captureResponse = await axios.post(
            `https://api-m.sandbox.paypal.com/v2/payments/authorizations/${authorizationId}/capture`,
            {},
            {
                headers: {
                    Authorization: `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Respond with success message
        res.json({ message: 'Payment successful', capture: captureResponse.data });
    } catch (error) {
        // Handle errors
        console.error('Error:', error.message);
        res.status(500).json({ error: 'An error occurred while processing the payment' });
    }
};

// Start the server
