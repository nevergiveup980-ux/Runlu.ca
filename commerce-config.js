window.RUNLUCommerceConfig = Object.freeze({
  provider: "stripe",
  products: Object.freeze({
    "sbcc-v1-1": Object.freeze({
      name: "Small Business Command Center V1.1",
      enabled: true,
      checkoutUrl: "https://buy.stripe.com/9B6cN61eP46r0M4cNw6Vq00",
      price: "CAD $9.99",
      version: "1.1",
      delivery: "order-confirmation"
    }),
    "pa-v1-0": Object.freeze({
      name: "RUNLU PA V1.0 — Project Assistant",
      enabled: true,
      checkoutUrl: "https://buy.stripe.com/bJe9AU6z932n9iA4h06Vq01",
      price: "CAD $9.99",
      version: "1.0",
      delivery: "order-confirmation"
    })
  })
});
