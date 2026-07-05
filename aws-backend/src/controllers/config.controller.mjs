// GET /api/config
export const getConfig = (req, res) => {
  res.json({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID
  });
};
