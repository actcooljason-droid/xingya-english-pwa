export function createDemoSubscription() {
  return {
    status: "inactive",
    price: 19.9,
    currency: "CNY",
    interval: "month",
    simulation: true,
    activatedAt: null,
  };
}

export function activateDemoSubscription(subscription, activatedAt = new Date().toISOString()) {
  return {
    status: "active",
    price: subscription.price,
    currency: subscription.currency,
    interval: subscription.interval,
    simulation: true,
    activatedAt,
  };
}
