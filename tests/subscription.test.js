import test from "node:test";
import assert from "node:assert/strict";

import {
  activateDemoSubscription,
  createDemoSubscription,
} from "../dist/js/subscription.js";

test("demo subscription starts inactive with the fixed monthly price", () => {
  assert.deepEqual(createDemoSubscription(), {
    status: "inactive",
    price: 19.9,
    currency: "CNY",
    interval: "month",
    simulation: true,
    activatedAt: null,
  });
});

test("simulated completion activates locally without payment or personal data", () => {
  const state = activateDemoSubscription(
    createDemoSubscription(),
    "2026-09-13T08:00:00.000Z",
  );

  assert.deepEqual(state, {
    status: "active",
    price: 19.9,
    currency: "CNY",
    interval: "month",
    simulation: true,
    activatedAt: "2026-09-13T08:00:00.000Z",
  });
  assert.equal("orderId" in state, false);
  assert.equal("payer" in state, false);
  assert.equal("paymentId" in state, false);
});
