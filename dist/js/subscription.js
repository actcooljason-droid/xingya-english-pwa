export function createSubscriptionOffer() {
  return {
    planName: "星芽成长计划",
    price: 19.9,
    currency: "CNY",
    interval: "month",
    benefits: ["24 节主题课程", "智能错题复习", "完整成长报告"],
  };
}

export function requestWechatCheckout() {
  return {
    status: "unavailable",
    message: "订阅功能正在开发中，敬请期待。",
  };
}
