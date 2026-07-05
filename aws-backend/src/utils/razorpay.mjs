import crypto from 'crypto';

export function verifyRazorpaySignature(body, signature, secret) {
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
}
