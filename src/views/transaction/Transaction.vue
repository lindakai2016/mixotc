<template>
  <div>
    <div class="transacation inner">
      <!--头部搜索栏-->
      <div class="header">
        <h2 class="clearfix">
          <img :src="filte.coinImg || `/static/images/btc_icon.png`" alt="">
          <p>
            <span>{{filte.currency && filte.currency.toUpperCase() || 'BTC'}}</span>
            <b>{{filte.cName && filte.cName || 'Bitcoin'}}</b>
          </p>
        </h2>
        <div class="f1">
          <div class="search" :class="{active:isActive}" v-clickoutside="onClickOutside">
            <span @click="srchUlShow=!srchUlShow" v-clickoutside="()=>{srchUlShow=false}">
              搜索{{srchUls[srchUlSel].title}}
            </span>
            <ul v-show="srchUlShow">
              <li v-for="(e,i) in srchUls" @click="srchUlSel=i">{{e.title}}</li>
            </ul>
            <input type="text"
                   v-model="srchText" title=""
                   v-clickoutside="()=>{srchTipShow=false}"
                   @keyup.enter="()=>{searchStr();srchTipShow=false;}"
                   @input="fuzzyInput"
                   @focus="onFocus">
            <img src="/static/images/cancel_icon.png"
                 @click="srchText=''"
                 v-show="srchText.length>0">
            <a href="javascript:void(0)" @click="searchStr"></a>
            <!--币种模糊搜索结果-->
            <ul v-show="srchTipShow" v-if="srchType===0">
              <li v-for="e in coinTips" @click="search(e)">
                <div @mousedown="srchText=e.name">
                  <img class="coin" :src="e.icon"/><span>{{e.name}}</span><span class="gray">{{e.cname}}</span>
                </div>
              </li>
              <li class="notip" v-show="coinTips.length<=0">暂无该币种信息</li>
            </ul>
            <!--商家模糊搜索结果-->
            <ul v-show="srchTipShow" v-else-if="srchType===1">
              <li v-for="e in userTips" @click="search(e)">
                <div @mousedown="srchText=e.name">
                  <span>{{e.name}}</span><span class="gray">{{e.account}}</span>
                </div>
              </li>
              <li class="notip" v-show="userTips.length<=0">无搜索结果</li>
            </ul>
          </div>
        </div>
        <ul class="top5">
          <li v-for="(item, index) in hotCoinList" @click="hotCoinSelect(item, index)"
              :class="{'top-active': item.currency.toLocaleString() == filte.currency.toLowerCase()}">
            <img src="/static/images/hot_coin.png" alt="">
            <p>
              <img :src="`${HostUrl.http}image/${item.icon}`" alt="">
              <b>{{item.currency && item.currency.toUpperCase()}}</b>
            </p>
            <span>{{item.name}}</span>
          </li>
        </ul>
      </div>
      <!--筛选栏-->
      <div class="filtrate">
        <ol class="select-type clearfix">
          <li v-for="(item, index) in transTypeList" :class="{'type-active': typeNum == index}" @click="selectType(item, index)">{{item}}</li>
        </ol>
        <div class="select" @click.stop="showPayment=!showPayment" v-clickoutside="()=>{showPayment=false}">
          <i :class="{'select-item': payTitle !== '选择支付方式' }">{{payTitle}}</i>
          <ul class="payment" v-show="showPayment">
            <li v-for="(item, index) of payment" :key="index" :class="{selected: item.state}"
                @mousedown="item.state = !item.state" @click.stop="filte.payment = paymentScore">
              <span>{{item.type}}</span>
            </li>
          </ul>
          <img src="/static/images/cancel_icon.png" alt="" v-if="paymentScore !== 0 && showPayment" @click.stop="clearPayment">
        </div>
        <div class="price">
          <!--<img src="/static/images/hint.png">-->
          <!---->
          <b v-if="tip" class="err-tip">最大限额不能低于最小限额，且最小限额为200</b>
          <input type="text" class="min" @input="inputDealMin()" ref='min' v-model="filte.min" placeholder="最低限额" step="1" min="200" @focus="minCancel = true" @blur="minCancel = false">
          <img src="/static/images/cancel_icon.png" class="min-cancel" v-show="minCancel && filte.min" @mousedown="filte.min = ''">
          <input type="text" class="max" @input="inputDealMax()" ref='max' v-model="filte.max" placeholder="最高限额" step="1" @focus="maxCancel = true" @blur="maxCancel = false">
          <img src="/static/images/cancel_icon.png" class="max-cancel" v-show="maxCancel && filte.max" @mousedown="filte.max = ''">
        </div>
        <div class="wholesale">
          <label @click="changeIsWhole">
            <img src="/static/images/selected.png" alt="" v-if="largeTran">
            <img src="/static/images/unselect.png" alt="" v-else>
            <span>大额交易区</span>
          </label>
        </div>
      </div>
      <!--数据列表-->
      <div class="result-list">
        <div class="thead clearfix">
          <p class="merchant" title="默认排序">
            <span @click="sort()">广告主</span>
          </p>
          <p class="deal-volume sort"
             title="已成交的数字币总量"
             :class="{'sort-add': filte.volume === 2, 'sort-minus': filte.volume === 1}"
          >
            <span @click="sort('volume')">成交量</span>
          </p>
          <p class="order-volume sort"
             title="已完成的交易次数（订单和担保）"
             :class="{'sort-add': filte.order === 2, 'sort-minus': filte.order === 1}"
          >
            <span @click="sort('order')">交易次数</span>
          </p>
          <p class="good-reputation sort"
             title="该用户的好评率（订单和担保）"
             :class="{'sort-add': filte.rate === 2, 'sort-minus': filte.rate === 1}"
          >
            <span @click="sort('rate')">好评率</span>
          </p>
          <p class="limit-price" title="单笔交易金额范围">
            <span>限额(CNY)</span>
          </p>
          <p class="payment">
            <span>付款方式</span>
          </p>
          <p class="amount sort"
             title="当前可交易的数量"
             :class="{'sort-add': filte.tradeable === 2, 'sort-minus': filte.tradeable === 1}"
          >
            <span @click="sort('tradeable')">可交易量</span>
          </p>
          <p class="price sort"
             title="单个数字币价格"
             :class="{'sort-add': filte.price === 2, 'sort-minus': filte.price === 1}"
          >
            <span @click="sort('price')">价格(CNY)</span>
          </p>
        </div>
        <div v-if="err===0">
          <ul>
            <li is='ResultListItem' :trustArray="trustArray" onOrderFail="onOrderFail" v-for="(item, index) of result" :key="index"
                :data="item" :class="{even: index%2 === 0}"></li>
          </ul>
          <Pagination class="pageBar" :total="total" :pageSize="pageSize" :curPage="curPage"></Pagination>
        </div>
        <div v-else-if="err===1">
          <div class="err no-result">无相应的数据</div>
        </div>
        <div v-else-if="err===2">
          <div class="err load-failed">网络异常</div>
        </div>
        <div v-else-if="err===3">
          <div class="err net-error">加载失败</div>
        </div>
        <div v-else-if="err===4">
          <div class="err loading">加载中...</div>
        </div>
      </div>
    </div>
    <Alert ref="alert"></Alert>
  </div>
</template>

<script>
  import ResultListItem from './children/ResultListItem';
  import Pagination from '@/views/verify/component/Pagination';
  import BasePopup from '@/components/common/BasePopup';
  import Alert from "../common/widget/Alert"

  export default {
    components: {
      ResultListItem,
      Pagination,
      BasePopup,
      Alert,
    },
    data() {
      return {

        srchUls: [
          {title: "币种", type:0},
          {title: "商家昵称/账号",type:1},
        ],
        srchUlSel: 0,
        srchUlShow: false,
        srchTipShow: false,
        srchText: "",
        isActive: false,  // 搜索框是否激活状态

        coinTips: [],
        userTips: [],

        transTypeList: ['购买', '出售'],
        typeNum: 0, // 购买出售选择
        tip: false,//限额错误文案提示
        showPayment: false,
        payment:[{type: '支付宝', score: 1, state: true}, {type: '微信', score: 2, state: true}, {type: '银行卡', score:4, state: true}],
        filte:{
          type: 1,// 1出售，2购买
          payment: '',//1支付宝，2微信，4银行卡，可相加，共6种
          currency: 'btc',// 币种全称
          coinImg: '', // 币种图片
          cName: '',
          min: null,
          max: null,
          user: '',//用户名昵称模糊搜索
          price: '', //价格排序，1降序，2升序
          date: '',//时间排序，1降序，2升序
          order: '',//订单数排序，1降序，2升序
          volume: '',//交易量排序，1降序，2升序
          rate: '',//好评率排序，1降序，2升序
          tradeable: '', //可交易量排序
        },
        largeTran: 0, //大额交易选择状态

        result: [],
        total: 1,
        curPage: 1,
        pageSize: 20,
        err: 1, //数据加载结果：0-正常，1-无数据，2-网络异常，3-加载失败，4-加载中

        minCancel: false, // 最低限额错误显示
        maxCancel: false // 最高限额错误显示
      }
    },
    mounted() {
      if(this.$route.query.icon) {
        this.filte.coinImg = `${this.HostUrl.http}image/${this.$route.query.icon}`
        this.filte.currency =this.$route.query.currency
        this.filte.cName = this.$route.query.name
      }
      this.fetchData();
      this.Bus.$on("onOrderFail",(msg) => {
        if(msg==="未登录"){
          this.$store.commit({type: 'changeLoginForm', data: true});
        }else{
          this.$refs.alert.showAlert({content:msg});
        }
      });
      this.Bus.$on("onPageChange",(p) => {
        this.curPage=p;
        this.fetchData(p-1);
      });
    },
    destroyed() {
      this.Bus.$off("onOrderFail");
      this.Bus.$off("onPageChange");
    },
    methods: {
      onFocus(){
        this.isActive=true;
        //币种搜索为空显示全部，其他搜索为空直接返回
        if(this.srchText.length<=0 && this.srchType!==0){
          this.srchTipShow=false;
          return;
        }
        this.loadTips();
      },
      onClickOutside(){
        if(this.srchText.length<=0){
          this.isActive=false;
        }
      },
      fuzzyInput() { // 搜索框数据
        if (this.srchType === 0) { // 不能输入汉字
          this.srchText = this.srchText.replace(/[\u4E00-\u9FA5]/g, '');
        }
        //搜索为空直接返回
        if (this.srchText.length <= 0 && this.srchType!==0) {
          this.srchTipShow = false;
          return;
        }
        this.loadTips();
      },
      //列表项搜索
      search(e) {
        if(!e) e={};
        if (this.srchType === 0) {
          this.filte.user = "";
          this.filte.currency = e.name || "btc";
          this.filte.cName = e.cname || "Bitcoin";
          this.filte.coinImg = e.icon || "/static/images/btc_icon.png";
        } else {
          this.filte.user = this.srchText;
        }
      },
      //按钮搜索，不存在的币种，默认给模糊搜索结果第一条
      searchStr() {
        if (this.srchType === 0 && this.srchText.length > 0) {
          for(let i=0;i<this.coinTips.length;i++){
            let e=this.coinTips[i];
            if (e.name.toLowerCase() === this.srchText.toLowerCase()){
              this.search(e);
              return;
            }
          }
          this.search(this.coinTips[0]);
        }else{
          this.search(null);
        }
      },
      loadTips() {
        let srchKey = this.srchText;
        if (this.srchType === 0) {
          this.Proxy["coinSearch"]({keyword: srchKey}).then(res => {
            this.coinTips = [];
            res.data.coins && res.data.coins.forEach(v => {
              this.coinTips.push({
                name: v.currency || "-",
                cname: v.cname || "-",
                icon: `${this.HostUrl.http}image/${v.icon}`,
                type: 0
              });
            });
            this.srchTipShow=true;
          });
        } else {
          let currency=this.filte.currency || "btc";
          this.Proxy["userSearch"]({keyword: srchKey,currency:currency,type:1}).then(res => {
            this.userTips = [];
            res.data.users && res.data.users.forEach(v => {
              this.userTips.push({
                name: v.name || "-",
                account: v.phone || v.email || "-",
                type: 1
              });
            });
            this.srchTipShow=true;
          });
        }
      },
      //拉取广告数据
      fetchData(p=0) {
        this.Proxy.sales({
          type: this.filte.type,
          payment: this.filte.payment,
          currency: this.filte.currency || "btc",
          money: 'CNY',
          min: this.filte.min || 0,
          max: this.filte.max || 9007199254740992,
          count: this.pageSize,
          user: this.filte.user,
          price: this.filte.price,
          date: this.filte.date,
          order: this.filte.order,
          volume: this.filte.volume,
          rate: this.filte.rate,
          tradeable: this.filte.tradeable,
          page: p,
        }).then(res => {
          if (!res || !res.data || !res.data.sales || res.data.sales.length <= 0)
            this.err = 1; //无数据
          else {
            this.err = 0;
            this.total=res.data.amount;
            this.parseResult(res.data.sales);
          }
        }).catch((msg) => {
          if (!msg)
            this.err = 2; //网络异常
          else if (msg.ret !== 0)
            this.err = 3; //加载失败
        });
      },
      parseResult(data) {
        this.result = [];
        data.forEach(e => {
          this.result.push({
            id: e.id,
            sid: e.sid,
            headimg: e.icon && this.HostUrl.http + "/image/" + e.icon + "?size=thumb" || "/static/images/default_avator.png",
            nickname: e.trader || "-",
            dealVolume: e.volume && (e.volume + "").formatFixed(6) || 0,
            orderVolume: e.trade && (e.trade + "").formatFixed(6) || 0,
            rate: !e.trade ? "-": (e.rate && e.rate + "%") || "-" ,
            priceMin: e.min,
            priceMax: e.max,
            pay_zfb: e.payments % 2 === 1,
            pay_wx: [2, 3, 6, 7].includes(e.payments),
            pay_yhk: [4, 5, 6, 7].includes(e.payments),
            amount: (this.typeNum == 1 && e.vary == 2) ? '不限量' : ((e.tradeable + "").formatFixed(6)),
            price: e.price && (e.price + "").formatFixed(2) || 0,
            currency: e.currency,
            isLargeTran: e.bt_verify===2?1:0,
            type: this.filte.type
          });
        });
      },
      //最小限额输入处理
      inputDealMin() {
        let min = this.filte.min;
        if (!(/^[0-9]+$/.test(min))) {
          this.filte.min =  min && min.replace(/[^0-9]/g, "");
        };
        this.largeTran = 0
      },
      //最大限额输入处理
      inputDealMax() {
        let max = this.filte.max;
        if (!(/^[0-9]+$/.test(max))) {
          this.filte.max =  max && max.replace(/[^0-9]/g, "");
        };
        this.largeTran = 0
      },
      changeIsWhole() {
        this.largeTran = (this.largeTran + 1) % 2;
        if(this.largeTran){
          this.filte.min = 100000;
          this.filte.max = 10000000;
        }else{
          this.filte.min = null;
          this.filte.max = null;
        }
      },
      clearPayment() {
        this.payment.forEach(item => {
          item.state = false;
        });
        this.filte.payment=this.paymentScore;
      },
      sort(title) {
        title !== 'price' && (this.filte.price = ''),
        title !== 'date' && (this.filte.date = ''),
        title !== 'order' && (this.filte.order = ''),
        title !== 'volume' && (this.filte.volume = ''),
        title !== 'rate' && (this.filte.rate = ''),
        title !== 'tradeable' && (this.filte.tradeable = '');

        if (title && (this.filte[title] === 1 || !this.filte[title])) {
          this.filte[title] = 2;
          return;
        }
        title && this.filte[title] === 2 && (this.filte[title] = 1);
      },
      hotCoinSelect(item, index) { // 热门选择
        this.filte.currency = item.currency;
        this.filte.cName = item.name;
        this.filte.coinImg = `${this.HostUrl.http}image/${item.icon}`;
      },
      selectType(item, index) { // 出售购买tab切换选择
        this.typeNum = index
        this.filte.price = 0,
        this.filte.date = 0,
        this.filte.order = 0,
        this.filte.volume = 0,
        this.filte.rate = 0,
        this.filte.tradeable = 0,
        this.filte.type = index + 1
      }
    },
    computed: {
      isLogin() {
        return this.$store.state.isLogin
      },
      srchType() {
        return this.srchUls[this.srchUlSel].type;
      },
      payTitle() {
        let title = this.payment.filter(item => {
          return item.state;
        }).map(item => {
          return item.type;
        });
        if (title.length === 0) return '选择支付方式';
        return title.join('/');
      },
      paymentScore() {
        let score = 0;
        this.payment.filter(item => {
          return item.state;
        }).forEach(item => {
          score += item.score;
        });
        return score;
      },
      trustArray() {
        return this.$store.state.trustList;
      },
      hotCoinList() { // 热门币种数据
        let hotArr = this.$store.state.coinLoopData.slice(0, 4)
        return hotArr;
      },
    },
    watch: {
      filte: {
        handler(curVal) {
          //限额检查
          let min = Number(curVal.min), max = Number(curVal.max);
          if ((min > max && curVal.min && curVal.max) || (curVal.min && curVal.min < 200)) {
            this.tip = true;
            return;
          } else {
            this.tip = false;
          }
          if (min >= 100000 || max >= 100000) {
            this.largeTran = 1
          } else {
            this.largeTran = 0
          }
          //拉取数据
          this.fetchData();
        },
        deep: true
      },
      isLogin: {
        handler(curVal) {
          if (curVal) {
            this.WsProxy.send('otc', 'get_trust_ids', {type: 1}).then(data => {
              data.ids && this.$store.commit('changeTrustList', {
                data: data.ids.map(item => {
                  return this.JsonBig.stringify(item.id);
                })
              });
              !data && this.$store.commit('changeTrustList', {data: []})
            });
            return
          }
          this.$store.commit('changeTrustList', {data: []});
        },
        immediate: true
      },
    },
  }
</script>

<style scoped lang="stylus">
  @import "../../stylus/base";
  @import "stylus/topSearch";
  @import "stylus/transaction";
  .transacation
    margin-bottom 40px
    .filtrate
      position relative
      height 70px
      background #FFF
      .select-type
        position absolute
        height 40px
        top 15px
        left 30px
        border 1px solid #FFB422
        border-radius 2px
        li
          float left
          width 200px
          text-align center
          line-height 40px
          cursor pointer
          height 40px
          color #FFB422
          &.type-active
            background #FFB422
            color #FFF
      .select
        box-sizing()
        position absolute
        left 540px
        top 20px
        width 190px
        height 30px
        background #FFF
        border 1px solid $col1E1
        border-radius 2px
        img
          position absolute
          top 9px
          right 30px
        i
          position absolute
          top 0px
          left 10px
          height 30px
          line-height 30px
          font-size $fz13
          color #999
          letter-spacing 0.27px
          &.select-item
            color $col333
        &::before
          position absolute
          top 12.5px
          right 10px
          content ''
          triangle_down($col422)
        &::after
          position absolute
          top 7.5px
          right -30px
          width 1px
          height 15px
          content ''
          background $col1E1
        .payment
          position absolute
          top 28px
          left -1px
          width 100%
          background #FFF
          border 1px solid $col1E1
          z-index 9
          li
            position relative
            height 30px
            line-height 30px
            cursor pointer
            &:hover
              background-color $col3EB
            &::after
              position absolute
              top 8px
              right 8px
              content ''
              width 16px
              height 16px
              background url('/static/images/unselect.png')
            &.selected::after
              background url('/static/images/selected.png')
            span
              float left
              height 30px
              padding-left 10px
              font-size $fz13
              letter-spacing 0.27px
      .price
        position absolute
        left 791px
        top 20px
        width 260px
        height 50px
        .min-cancel, .max-cancel
          position absolute
          top 9px
          cursor pointer
        .min-cancel
          left 83px
        .max-cancel
          right 50px
        b
          position absolute
          left 0
          top 32px
          color #FF794C
          fz11()
        input
          position relative
          float left
          box-sizing()
          width 105px
          height 30px
          padding 0 24px
          margin-right 15px
          font-size: 13px;
          letter-spacing 0.15px
          border 1px solid $col1E1
          border-radius 2px
          placeholder()
        &::before
          position absolute
          top 14.5px
          left 110px
          width 5px
          height 1px
          content ''
          background $col999
        &::after
          position absolute
          top 7.5px
          right 10px
          width 1px
          height 15px
          content ''
          background $col1E1
      .wholesale
        position absolute
        top 0
        left 1035px
        width 150px
        height 70px
        img
          position absolute
          top 27px
          left 30px
          cursor pointer
        span
          position absolute
          left 55px
          top 27px
          font-size $fz13
          color $col333
          letter-spacing 0.15px
          /*&::before
            position absolute
            top 5px
            left -12px
            width 11px
            height 9px
            content ''
            background url('/static/images/whole_icon2.png')*/

    .result-list
      margin-bottom 20px
      border-radius 2px
      .thead
        height 60px
        line-height 60px
        p
          position relative
          float left
          font-size $fz13
          color $col999
          letter-spacing 0.27px
          &.merchant
            width 170px
            padding-left 30px
            span
              cursor pointer
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
          &.sort
            span
              position relative
              padding-right 19px
              cursor pointer
              &::before
                position absolute
                top 3px
                right 0px
                content ''
                triangle_up($col999)
                cursor pointer
              &::after
                position absolute
                top 10px
                right 0px
                content ''
                triangle_down($col999)
                cursor pointer
            &.sort-add
              span
                &::before
                  border-bottom-color $col422
            &.sort-minus
              span
                &::after
                  border-top-color $col422
      ul
        li.even
          background-color #FFF
  .popup
    text-align center
    p
      display flex
      width 100%
      height 100%
      justify-content center
      align-items center
      box-sizing()
      padding 0 40px 0 40px
      font-size 14px
      color #333333
      letter-spacing 0.29px
      span
        display block
</style>
