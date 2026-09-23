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

export const createCheckout = (items, email, shippingAddress) =>
  axios
    .post(`${API}/checkout`, {
      items: items.map((i) => ({ handle: i.handle, variant_id: i.variant_id, quantity: i.qty })),
      email,
      shipping_address: shippingAddress,
    })
    .then((r) => r.data);

export const getOrderStatus = (orderId) =>
  axios.get(`${API}/orders/${orderId}/status`).then((r) => r.data);

export const adminLogin = (password) =>
  axios.post(`${API}/admin/login`, { password }).then((r) => r.data);

export const adminGetOrders = (token) =>
  axios.get(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data);

export const adminUpdateFulfillment = (token, orderId, status, trackingNumber) =>
  axios
    .patch(
      `${API}/admin/orders/${orderId}/fulfillment`,
      { status, tracking_number: trackingNumber || undefined },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((r) => r.data);

export const adminGetProducts = (token) =>
  axios.get(`${API}/admin/products`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.data);

export const adminSetStock = (token, handle, variantId, quantity) =>
  axios
    .patch(
      `${API}/admin/products/${handle}/variants/${variantId}/stock`,
      { quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((r) => r.data);

export const trackOrder = (orderNumber, email) =>
  axios.post(`${API}/orders/track`, { order_number: orderNumber, email }).then((r) => r.data);

export const trackCart = (email, items) =>
  axios.post(`${API}/cart/track`, { email, items }).then((r) => r.data);

export const cartConverted = (email) =>
  axios.post(`${API}/cart/converted`, { email }).then((r) => r.data);

export const formatPrice = (value) =>
  `£${Number(value).toFixed(Number(value) % 1 === 0 ? 0 : 2)}`;
