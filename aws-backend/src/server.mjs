import app from './app.mjs';
import './cron/paymentCron.mjs';
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[🚀 Server Success]: Express app successfully compiled and is running on port ${PORT}!`);
});
