<template>
  <li class="item clearfix">
    <div class="title merchant">
      <p class="avatar">
        <img class="largeTran" v-if="data.isLargeTran" src="/static/images/whole_icon2.png" title="已大额认证">
        <img class="headimg" @click="toHomePage(data.sid)" :src="data.headimg" alt="">
      </p>
      <p class="userInfo">
        <span class="nickname" :class="{'no-trust':!isTrust}" @click="toHomePage(data.sid)">{{data.nickname}}</span>
        <!-- -->
        <i class="trust" title="已信任" v-if="isTrust">信任</i>
      </p>
    </div>
    <div class="title deal-volume" :title="data.dealVolume">{{data.dealVolume}}</div>
    <div class="title order-volume" :title="data.orderVolume">{{data.orderVolume}}</div>
    <div class="title good-reputation">{{data.rate}}</div>
    <div class="title limit-price" :title="`${data.priceMin}-${data.priceMax}`">{{data.priceMin}}-{{data.priceMax}}</div>
    <div class="title payment">
      <img src="/static/images/OTC_zhifubao.png" alt="" v-if="data.pay_zfb">
      <img src="/static/images/OTC_wechat.png" alt="" v-if="data.pay_wx">
      <img src="/static/images/OTC_Bankcard.png" alt="" v-if="data.pay_yhk">
    </div>
    <div class="title amount" :title="data.amount">{{data.amount}}</div>
    <div class="title price" :title="data.price">{{data.price}}</div>
    <div class="title button">
      <button @click.stop="_toOrder(data)">{{data.type == 1 ? '购买' : '出售'}}{{data.currency && data.currency.toUpperCase()}}</button>
    </div>
  </li>
</template>

<script>
import beforeOrder from "../js/beforeOrder.js";
export default {
  props: ['data','onOrderFail','trustArray'],
  methods: {
    toHomePage(sid) {
      this.$router.push({ name: 'homepage', query: { uid: this.JsonBig.stringify(sid) }})
    },
    _toOrder(data){
      beforeOrder(this,{
        id :data.id,
        sid :data.sid,
        currency: data.currency,
        type: data.type
      }).then(()=>{
        this.$router.push({ name: 'order', query: { id: data.id}});
      }).catch((res)=>{console.log(data);
        this.Bus.$emit(this.onOrderFail,res);
      });
    },
  },
  computed:{
    isTrust:function(){
      return this.trustArray.indexOf(this.JsonBig.stringify(this.data.sid))>=0;
    }
  }
};
</script>

<style scoped lang="stylus">
@import '../../../stylus/base.styl';
@import "../stylus/transaction"
.item
  div
    position relative
    float left
    overflow hidden
    height 85px
    font-size 14px
    color $col333
    letter-spacing 0.16px
    line-height 85px
    &.title
      box-sizing()
      padding-right 10px
      white-space nowrap
      text-overflow ellipsis
    &.merchant
      width 200px
      padding-left 30px
    &.payment
      width 120px
    &.order-volume
      width 110px
    &.deal-volume
      width 120px
    &.good-reputation
      width 110px
    &.amount
      width 140px
    &.limit-price
      width 140px
    &.price
      width 130px
      font-size 16px
      color $col100
      letter-spacing 0.18px
    &.button
      button
        width 100px
        height 30px
        line-height 30px
        font-size $fz14
        margin-bottom 27px
        color #FFF
        background $col422
        border-radius 2px
        cursor pointer
        &:hover
          background $col350
</style>
