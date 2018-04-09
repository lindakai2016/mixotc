const ROUTES = [
  {
    path: "/",
    name: "index",
    component: resolve => require(['@/views/transaction/Transaction'], resolve) // 交易中心
  },
  {
    path: "/transaction",
    name: "transaction",
    component: resolve => require(['@/views/transaction/Transaction'], resolve) // 交易中心
  },
  {
    path: "/transaction/order",
    name: "order",
    component: resolve => require(['@/views/transaction/Order'], resolve) // 交易中心购买BTC
  },
  {
    path: "/transaction/tradeRules",
    name: "tradeRules",
    component: resolve => require(['@/views/transaction/tradeRules'], resolve) // 交易中心
  },
  {
    path: "/homepage",
    name: "homepage",
    component: resolve => require(['@/views/homepage/Homepage'], resolve) // 买卖家个人中心-他的发布
  },
  {
    path: "/verify",
    name: "verify",
    component: resolve => require(['@/views/verify/home'], resolve) // 审核中心
  },
  {
    path: "/order",
    name: "MyOrder",
    component: resolve => require(['@/views/myOrder/MyOrder'], resolve) // 我的订单
  },
  {
    path: "/order/evaluate",
    name: "MyOrderEvaluate",
    component: resolve => require(['@/views/myOrder/MyOrderEvaluate'], resolve) // 我的订单评价
  }
]

export default {
  routes:ROUTES
}
