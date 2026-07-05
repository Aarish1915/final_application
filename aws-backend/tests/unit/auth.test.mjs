import crypto from 'crypto';

describe('PBKDF2 Password Hashing', () => {
  it('should hash a password and verify it correctly', () => {
    const password = "mysecretpassword";
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    // Attempt to verify with correct password
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    
    // Attempt to verify with wrong password
    const invalidHash = crypto.pbkdf2Sync("wrongpassword", salt, 1000, 64, 'sha512').toString('hex');

    expect(verifyHash).toBe(hash);
    expect(invalidHash).not.toBe(hash);
  });
});
