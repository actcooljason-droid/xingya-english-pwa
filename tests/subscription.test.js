import test from "node:test";
import assert from "node:assert/strict";

import {
  createSubscriptionOffer,
  requestWechatCheckout,
} from "../dist/js/subscription.js";

test("subscription offer uses the fixed monthly price and production-facing benefits", () => {
  assert.deepEqual(createSubscriptionOffer(), {
    planName: "星芽成长计划",
    price: 19.9,
    currency: "CNY",
    interval: "month",
    benefits: ["24 节主题课程", "智能错题复习", "完整成长报告"],
  });
});

test("final WeChat checkout reports development status without creating payment state", () => {
  const state = requestWechatCheckout(createSubscriptionOffer());

  assert.deepEqual(state, {
    status: "unavailable",
    message: "订阅功能正在开发中，敬请期待。",
  });
  assert.equal("orderId" in state, false);
  assert.equal("payer" in state, false);
  assert.equal("paymentId" in state, false);
  assert.equal("activatedAt" in state, false);
});
