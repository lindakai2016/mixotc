/**
 * 信息预定义文本
 * type-消息类型：0-上传付款证明，1-证明无效，2-驳回申诉，3-驳回申诉+通知放币，4-通知放币，5-强制放币，6-强制放币+关闭账户，
 *                7-终止交易，8-终止交易+关闭账户
 * p1-申诉人：0-买家，1-卖家
 * p2-接收人：0-买家，1-卖家
 * p3-责任人：0-买家，1-卖家
 */
let MSGS = {
  m0: "请上传trade_code付款证明，24小时内不上传，将默认放弃申辩，按申诉发起人意愿判决订单有效性。",
  m1: "订单号orderId已被申诉，请上传trade_code付款证明，24小时内不上传，将默认放弃申辩，按申诉发起人意愿判决订单有效性。",
  m2: "证明无效(reason)请10分钟内提交付款码为trade_code的有效付款证明，否则将驳回申诉。",
  m3: "证明无效(reason)请10分钟内提交付款码为trade_code的有效付款证明，否则将默认放弃申辩。",
  m4: "您的申请被驳回，付款证明无效，[reason]。",
  m5: "您的申请被驳回，对方已付款，请等待到账[手动上传付款证明]。",
  m6: "您的申请被驳回，对方已付款，请10分钟内放币，否则将被仲裁强制放币\n提醒：被仲裁，将取消交易权限3天。仲裁3次，将永久关闭交易权限\n[手动上传付款证明]。",
  m7: "订单号orderId，买家已发起申诉，请10分钟内放币，否则将被仲裁强制放币\n提醒：被仲裁，将取消交易权限3天。仲裁3次，将永久关闭交易权限。",
  m8: "订单号orderId已被仲裁执行强制放币，[reason]。",
  m9: "订单号orderId已被仲裁执行强制放币，[reason]。\n提醒：您已被仲裁，将取消交易权限3天。仲裁3次，将永久关闭交易权限。",
  m10: "订单号orderId被仲裁终止交易，[reason]。",
  m11: "订单号orderId被仲裁终止交易，[reason]。\n提醒：您已被仲裁，将取消交易权限3天。仲裁3次，将永久关闭交易权限。",

  get: function (type, p1, p2, p3) {
    if (type === 0 && p1 === 0 && p2 === 1) {
      return this.m0;
    }
    if (type === 0 && p1 === 1 && p2 === 1) {
      return this.m1;
    }
    if (type === 1 && p1 === 0 && p2 === 1) {
      return this.m2;
    }
    if (type === 1 && p1 === 1 && p2 === 1) {
      return this.m3;
    }
    if (type === 2 && p1 === 0 && p2 === 0) {
      return this.m4;
    }
    if (type === 2 && p1 === 1 && p2 === 1) {
      return this.m5;
    }
    if (type === 3 && p1 === 1 && p2 === 1) {
      return this.m6;
    }
    if (type === 4 && p1 === 0 && p2 === 1) {
      return this.m7;
    }
    if (type === 5) {
      return this.m8;
    }
    if (type === 6 && p1 === 0 && p2 === 1) {
      return this.m9;
    }
    if (type === 7 && p1 === 0 && p2 === 1) {
      return this.m10;
    }
    if (type === 8 && p1 === 1 && p2 === 1) {
      return this.m11;
    }
  }
};

export default MSGS;
