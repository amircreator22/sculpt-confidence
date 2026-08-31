import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const getProducts = (params = {}) =>
  axios.get(`${API}/products`, { params }).then((r) => r.data);

export const getProduct = (handle) =>
  axios.get(`${API}/products/${handle}`).then((r) => r.data);

export const getShopStatus = () =>
  axios.get(`${API}/shop/status`).then((r) => r.data);

export const getReviews = (productHandle) =>
  axios.get(`${API}/reviews`, { params: productHandle ? { product_handle: productHandle } : {} }).then((r) => r.data);

export const subscribeNewsletter = (email, source = 'website') =>
  axios.post(`${API}/newsletter`, { email, source }).then((r) => r.data);

export const sendContact = (payload) =>
  axios.post(`${API}/contact`, payload).then((r) => r.data);

export const createCheckout = (items) =>
  axios.post(`${API}/checkout`, { items }).then((r) => r.data);

export const trackOrder = (orderNumber, email) =>
  axios.post(`${API}/orders/track`, { order_number: orderNumber, email }).then((r) => r.data);

export const formatPrice = (value) =>
  `£${Number(value).toFixed(Number(value) % 1 === 0 ? 0 : 2)}`;
