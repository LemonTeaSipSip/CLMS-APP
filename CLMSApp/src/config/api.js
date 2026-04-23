const BASE_URL = 'http://localhost:3000';

export const API = {
  login:         `${BASE_URL}/api/auth/login`,
  register:      `${BASE_URL}/api/auth/register`,
  account:       (id) => `${BASE_URL}/api/account/${id}`,
  accountByUser: (userId) => `${BASE_URL}/api/account/by-user/${userId}`,
  generateQR:    `${BASE_URL}/api/upi/generate-qr`,
  pay:           `${BASE_URL}/api/transaction/pay`,
  repay:         `${BASE_URL}/api/transaction/repay`,
  statement:     (accountId) => `${BASE_URL}/api/transaction/${accountId}/statement`,
};

export default BASE_URL;
