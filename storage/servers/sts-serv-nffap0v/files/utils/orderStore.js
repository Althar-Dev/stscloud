const orders = {};

const saveOrder = (userId, orderData) => {
  orders[userId] = orderData;
};

const getOrder = (userId) => orders[userId];

const clearOrder = (userId) => {
  delete orders[userId];
};

module.exports = {
  saveOrder,
  getOrder,
  clearOrder,
};
