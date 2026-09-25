window.RUNLUCommerceConfig = Object.freeze({
  provider: "stripe",
  account: Object.freeze({
    supabaseUrl: "https://ekrnknlawekeoszzkamd.supabase.co",
    publishableKey: "sb_publishable_Jr12gnQ7UrU6Wv9xz4L1aA_bcTZiGqn",
    referenceEndpoint: "https://ekrnknlawekeoszzkamd.supabase.co/functions/v1/runlu-stripe-checkout",
    signInUrl: "account.html"
  }),
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
    }),
    "guanshi-plus-monthly": Object.freeze({
      name: "RUNLU GUANSHI Plus Monthly",
      enabled: true,
      checkoutUrl: "https://buy.stripe.com/5kQ4gAaPpdH1gL2cNw6Vq06",
      price: "CAD $6.99 / month",
      version: "1.0",
      delivery: "account-subscription",
      requiresAccount: true,
      requiresServerReference: true
    }),
    "guanshi-plus-annual": Object.freeze({
      name: "RUNLU GUANSHI Plus Annual",
      enabled: true,
      checkoutUrl: "https://buy.stripe.com/bJedRa2iT0UfamE9Bk6Vq05",
      price: "CAD $59.99 / year",
      version: "1.0",
      delivery: "account-subscription",
      requiresAccount: true,
      requiresServerReference: true
    }),
    "guanshi-deep-reading": Object.freeze({
      name: "RUNLU GUANSHI Deep Reading",
      enabled: true,
      checkoutUrl: "https://buy.stripe.com/fZudRa6z99qLeCU3cW6Vq04",
      price: "CAD $3.99 / reading",
      version: "1.0",
      delivery: "account-credit",
      requiresAccount: true,
      requiresServerReference: true
    })
  })
});
