<template>
  <div class="my-order-wrap inner">
    <h1>
      <router-link to="/transaction">mixOTC</router-link> -
      <router-link to="/order">我的订单</router-link>
    </h1>
    <!--表格搜索-->
    <div class="order-select clearfix">
      <SearchInput :content="content"
                   :title="title"
                   :emitValue1="searchValue"
                   :emitValue3="searchResult"
                   :result="result"
                   class="order-choice-search">
      </SearchInput>
      <div class="order-choice-time clearfix">
        <DateInterval class="date-group" :max="Date.parse(new Date())" ref="di"></DateInterval>
        <ul class="clearfix">
          <!--:class="{'time-active': index == num}"-->
          <li v-for="(item, index) in timeList" @click="selectTime(index)">{{item}}</li>
        </ul>
      </div>
    </div>

    <!--tab切换表头-->
    <div class="order-item clearfix">
      <span @click="selectStatus(1)" :class="contentTabIndex === 1 ? 'content-btn-active' : 'content-btn'">进行中({{conductNum}})</span>
      <span @click="selectStatus(2)" :class="contentTabIndex === 2 ? 'content-btn-active' : 'content-btn'">完成({{completeNum}})</span>
      <!--<button @click="exchangeFlag ? goExchange() : openTransform()">资金划转</button>-->
    </div>

    <div class="order-content">
      <!-- 表格表头 -->
      <ol class="clearfix">
        <li :data-zIndex="index" v-for="(title, index) in titleList" :class="{sort: title.canSort, 'sort-up': clickUp === index && sortActive, 'sort-down': clickUp === index && !sortActive}" @click="title.canSort && toSort(title, index)">
          <span >
            {{title.content}}
            <i class="before" v-if="title.sortTab"></i>
            <i class="after" v-if="title.sortTab"></i>
          </span>
          <ChoiceBox
            v-if="title.orderTypeShow"
            :classify="orderType"
            title="类型"
            :emitValue="orderTypeValue"
            :selectValue="orderTypeValueData">
          </ChoiceBox>
          <CheckBox
            v-if="title.currencyShow"
            title="币种"
            allName="全部币种"
            :checkBoxList="currencyBox"
            :emitValue="currencyValue"
            :canShow = 'isDisabled'
            :width=105>
          </CheckBox>
          <CheckBox
            v-if="title.status"
            title="状态"
            allName="全部状态"
            :checkBoxList="contentTabIndex === 1 ? allStatusPro : allStatusCom"
            :emitValue="allStatusValue"
            :width=130>
          </CheckBox>
        </li>
      </ol>
      <!-- 表格内容 -->
      <div class="order-content-info" v-for="(content,index) in contentList">
        <ul class="clearfix">
          <li>
            <p>{{content.create && Number(content.create).toDate('yyyy/MM/dd')}}</p>
            <p>{{content.create && Number(content.create).toDate('HH:mm')}}</p>
          </li>
          <li :class="JsonBig.stringify(content.buyer) == userId ? 'text-g' : 'text-r'">{{JsonBig.stringify(content.buyer) == userId ? '购买' : '出售'}}</li>
          <li>{{content.currency&&content.currency.toUpperCase()}}</li>
          <li>
            <p><router-link :to="{path:'/homepage', query:{uid: JsonBig.stringify(content.buyer) == userId ? content.seller : content.buyer}}">{{content.name || content.contact}}</router-link></p>
            <p class="talk" @click="contactSomeone(JsonBig.stringify(content.buyer) == userId ? content.seller : content.buyer)">联系他</p>
          </li>
          <li>
            <em class="hidden-text" :title="content.price">{{content.price}}</em>
          </li>
          <li>
            <p :class="JsonBig.stringify(content.buyer) == userId ? 'text-g' : 'text-r'" class="hidden-text" :title="content.amountc">{{JsonBig.stringify(content.buyer) == userId ? `+${content.amountc && content.amountc.toString().formatFixed(6)}` : `-${content.amountc && content.amountc.toString().formatFixed(6)}`}}</p>
            <p class="hidden-text" :title="content.fee !==0 && content.fee" v-show="content.showFee">{{content.fee === 0 ? '' : content.fee.toString().formatFixed(6)}}</p>
          </li>
          <li>
            <em class="hidden-text" :title="content.amountm">{{content.amountm}}</em>
          </li>
          <li>{{content.trade_code}}</li>
          <!-- 状态显示 -->
          <li class="state-li">
            <p v-for="state in content.stateList"
               :class="{'text-r': state.flag == 1, 'text-g': state.flag === 2, 'text-b': state.flag === 3}">{{state.name}}</p>
          </li>
          <!-- 操作显示 -->
          <li class="operation-li">
            <p v-for="(operation,i) in content.operationList">
              <span v-if="operation.flag===1" class="active-btn" @click="showOperation(index)">{{operation.name}}</span>
              <!--标记已付款-->
              <span v-else-if="operation.flag===3" class="active-btn" @click="markPay(content,index)" ref="markPayBtn">{{operation.name}}</span>
              <span v-else-if="operation.flag===8" class="active-btn" @click="openReleaseCoin($event, content, index)">{{operation.name}}</span>
              <span v-else-if="operation.flag===2" class="text-b" @click="showOperation(index)">{{operation.name}}</span>
              <span v-else-if="operation.flag===4" @click="openSelect($event, operation, index, content)">{{operation.name}}</span>
              <span v-else-if="operation.flag===7" @click="openSelect($event, operation, index, content)" :class="{disabled:content.timeToAppeal>0}">
                {{operation.name}}<i v-if="content.timeToAppeal>0">({{content.timeToAppeal.formatSecord()}})</i>
              </span>
              <span v-else-if="operation.flag===9 && !content.isApealed" @click="openSelect($event, operation, index, content)">{{operation.name}}</span>
              <span v-else-if="operation.flag===5" @click="remindCoin(content)">{{operation.name}}</span>
              <span v-else-if="operation.flag===6" @click="remindCoin(content)">{{operation.name}}</span>
            </p>
          </li>
        </ul>
        <p class="order-content-extre clearfix">
          <span>订单号：{{JsonBig.stringify(content.id)}}</span>
          <span>备注：{{content.info ? content.info : '无'}}</span>
          <CountDown :endTime="endTime" class="reset-time" v-if="JsonBig.stringify(content.buyer) == userId && content.state == 1"></CountDown>
        </p>
      </div>
    </div>
    <!-- 订单无内容 -->
    <MyOrderNothing v-if="!contentList.length"></MyOrderNothing>
    <!-- 分页 -->
    <Pagination  v-if="contentList && contentList.length"
                :total="pageTotal"
                :pageSize="15"
                :curPage="curPage">
                <!--emitValue="changePage"-->
    </Pagination >

    <!-- 标记已付款弹窗 -->
    <MarkedPaymentLayer :paymentShow="showPayment"
                        :tradeCode="updateTradeCode"
                        @offPayment="closePayment">
    </MarkedPaymentLayer>
    <!-- 引入释放币弹窗 -->
    <ReleaseCoinLayer
      :releaseCoinShow="showReleaseCoin"
      :id="updateId"
      :uid="updateUid"
      @offRelease="openReleaseCoin">
    </ReleaseCoinLayer>
    <!-- 提醒放币弹窗 -->
    <BasePopup :show="remindCoinLayer"
               class="remind-coin-layer"
               @click.native="remindCoinLayer=false">
      <span v-html="remindCoinContent"></span>
    </BasePopup>
    <!-- 取消订单 -->
    <SelectLayer :selectShow="showSelect"
                 @offSelet="openSelect"
                 :type="showType"
                 :id="updateId"
                 :info="updateInfo"
                 :uid="otherId"
                 :contentInfo="selectContent"
                 :leftContent="selectLeft"
                 :rightContent="selectRight">
    </SelectLayer>

    <!-- 资金互转弹窗 -->
    <!--<TransformLayer :transformShow="showTransform"-->
                    <!--@offTransform="openTransform">-->
    <!--</TransformLayer>-->
    <Alert ref="alert"></Alert>
  </div>
</template>

<script>
  import ChoiceBox from '@/components/common/ChoiceBox' // 引入下拉选择框
  // import Pagination from '@/components/common/Pagination' // 引入分页
  import DateInterval from '@/components/common/DateInterval' // 引入日历
  import SearchInput from '@/components/common/SearchInput' // 引入搜索下拉框
  import BasePopup from '@/components/common/BasePopup' // 引入弹窗
  import MyOrderNothing from '@/views/myOrder/MyOrderNothing' // 引入无订单页面
  import sendConfig from '@/api/SendConfig.js'// 引入websocket发送包
  import MarkedPaymentLayer from '@/views/myOrder/orderLayer/MarkedPaymentLayer' // 标记已付款弹窗
  import ReleaseCoinLayer from '@/views/myOrder/orderLayer/ReleaseCoinLayer' // 释放币弹窗
  import SelectLayer from '@/views/myOrder/orderLayer/SelectLayer' // 申诉弹窗
  import CheckBox from '@/components/common/CheckBox' // 引入多选弹窗
  import CountDown from '@/components/common/CountDown' // 引入倒计时
  // import TransformLayer from '@/views/myOrder/orderLayer/TransformLayer' // 资金互转弹窗
  import Pagination from "@/views/verify/component/Pagination";
  import Alert from "@/views/common/widget/Alert"
  import getErrorMsg from "@/js/ErrorCode"

  export default {
    name: "my-order",
    components: {
      ChoiceBox,
      Pagination,
      DateInterval,
      SearchInput,
      BasePopup,
      MyOrderNothing,
      MarkedPaymentLayer,
      ReleaseCoinLayer,
      SelectLayer,
      CheckBox,
      CountDown,
      Alert,
      // TransformLayer
    },
    data() {
      return {
        sortFlag: "", // 控制排序箭头每次朝上
        userId: '', // 用户id

        titleList:[
          {content: '创建时间', sortTab: true, canSort: true, flag: 0},
          {orderTypeShow: true},
          {currencyShow: true},
          {content: '对方'},
          {content: '单价(CNY)', sortTab: true, canSort: true, flag: 4},
          {content: '数量(手续费)', sortTab: true, canSort: true, flag: 5},
          {content: '金额(CNY)', sortTab: true, canSort: true, flag: 6},
          {content: '资金码'},
          {status: true},
          {content: '操作'}
        ], // 表格表头内容
        clickUp: 20,
        sortActive: false, // 控制箭头开始无active

        content: [
          {title: '搜索订单号', type: 'order_id'},
          {title: '搜索资金码', type: 'order_tradecode'},
          {title: '搜索商家昵称/账号', type: 'order_trader'}
        ],  // 输入框下拉值
        title: '搜索订单号', // 输入框默认
        searchValue: 'searchValue', // 输入框title改变值
        searchResult: 'searchResult',  // 输入框内容
        result: [], // 模糊搜索结果
        orderId: '',
        tradeCode: '',
        trader: '',
        contentTabIndex: 1, // 控制tab切换
        //num: 4, // 控制时间选择Tab active类

        showPayment: false, // 标记已付款弹窗
        showReleaseCoin: false,

        showSelect: false, // 双向选择公共弹窗
        selectContent: 'selectContent', // 内容
        selectLeft: 'selectLeftValue', // 左边内容
        selectRight: 'selectRightValue', // 右边内容
        showType: 0, // 确定弹窗类型

        remindCoinLayer: false, // 提醒弹窗
        remindCoinContent: '', // 提醒弹窗内容

        // showTransform: false, // 资金互转弹窗

        updateId: '', //标记已付款弹窗所用id
        updateInfo: '',
        otherId: '',//对方ID
        updateUid: '',
        updateTradeCode: '', // 标记弹窗所用资金码

        startValueDate: null,
        endValueDate: null,

        timeList: ['今天','三天', '七天'], // 时间Tab切换title

        orderType: ['全部类型', '购买', '出售'], // 类型下拉显示
        orderTypeValue: 'orderTypeValue', // 传递给子组件
        orderTypeValueData: [3, 1, 2],
        selectOrder: 3, // 订单类型筛选
        selectCurrency: '', // 币种筛选
        selectState: '', // 订单状态筛选
        comment: 0, // 是否评价
        currencyBox:[],// 币种下拉显示
        isDisabled: '', // 币种下拉是否显示
        currencyValue: 'currencyValue', // 传递给子组件

        allStatusPro: [
          {type: '待付款', state: false, code: '1'},
          {type: '待放币', state: false, code: '2'},
          {type: '申诉中', state: false, code: '3'},
        ], // 进行中状态下拉显示
        allStatusCom: [ // (126) 12310 (12678) (126789) (124) 12311 (15)
          {type: '成功', state: false, code: '6,7,8,9,10'},
          {type: '成功-强制放币', state: false, code: '10'},
          {type: '成功-未评价', state: false, code: '6,7'},
          {type: '成功-已评价', state: false, code: '8,9'},
          {type: '失败-取消', state: false, code: '4'},
          {type: '失败-终止', state: false, code: '11'},
          {type: '失败-超时', state: false, code: '5'},
        ], // 完成状态下拉显示
        allStatusValue: 'allStatusValue', // 传递给子组件
        contentList: [], // 表格内容数组
        dateSort: 0,// 时间排序 1降序 2升序
        price: 0,// 单价排序 1降序 2升序
        amount: 0,// 电子币数量排序 1降序 2升序
        money: 0,// 法币金额排序 1降序 2升序

        endTime: '', // 设置定时器时间

        conductNum: 0, // 进行数量
        completeNum: 0, // 完成数量

        pageTotal: 0, // 分页总数
        curPage: 1, // 当前页
        flagNow: true, // 倒计时标志

        exchangeFlag: true // 是否弹出资金互转弹窗
      }
    },
    created() {
      // 钱包页面直接查询
      this.orderId = this.$route.query.oid ? this.$route.query.oid : ''
      this.$route.query.classify && (this.$route.query.classify == 0 && (this.selectState = "1,2,3") || ((this.contentTabIndex = 2) && (this.selectState = "4,5,6,7,8,9,10,11"))) || (this.selectState = "1,2,3")
      // 获取用户id
      this.userId = typeof this.$store.state.userInfo.uid  === 'string' ? this.$store.state.userInfo.uid : this.JsonBig.stringify(this.$store.state.userInfo.uid);
      // console.log( this.JsonBig.stringify(this.$store.state.userInfo.uid))
      //console.log('这是个字符串', this.$store.state.userInfo.uid,  typeof this.$store.state.userInfo.uid)
      //console.log('1111', typeof this.userId, this.userId, typeof this.$store.state.userInfo.uid, this.$store.state.userInfo.uid)
      // 获取进行状态
      this.initData();
      this.getInitNum();
      this.getOrderCoin();
      this.getCompleteData(); // 获取完成数据
    },
    mounted() {
      // 监听下拉框值，将值传给子组件
      this.Bus.$on(this.orderTypeValue, (data) => { // 类型筛选
        this.selectOrder = data
        this.initData()
      });
      this.Bus.$on(this.currencyValue, (data) => { // 币种筛选
        data.length ? this.selectCurrency = data.join(',') : this.selectCurrency = data
        this.initData()
      });
      this.Bus.$on(this.allStatusValue, (data) => { // 类型筛选
        let a = data.indexOf('6,7'), b = data.indexOf('8,9'), selectStateArr = ['1,2,3', '4,5,6,7,8,9,10,11']
        !((a + 1) && (b + 1)) && ((a + 1) && (this.comment = 1) && data.splice(a, 1) || (b + 1) && (this.comment = 2) && data.splice(b, 1)) || (this.comment = 0)
        this.selectState = data.length && data.join(',') || !this.comment && (this.selectState = selectStateArr[this.contentTabIndex - 1]) || ''
        // console.log('selectState', this.selectState, this.comment)
        this.initData()
      });
      // 监听搜索框title值
      this.Bus.$on(this.searchValue,(data) => {
        this.title = data
        // console.log('searchValue', data)
      });
      // 监听搜索框值
      this.Bus.$on('changeInputContent', ({type, data}) => {
        if (type == 'order_id') {
          this.tradeCode = ''
          this.trader = ''
          this.orderId = data
        } else if (type == 'order_tradecode') {
          this.orderId = ''
          this.trader = ''
          this.tradeCode = data
        } else{
          this.orderId = ''
          this.tradeCode = ''
          this.trader = data
        }
        if (this.result.length === 0) { // 无搜索直接的点击
          this.orderId = ''
          this.tradeCode = ''
          this.trader = ''
          this.comment = 0
          this.startValueDate = null
          this.endValueDate = null
          this.selectState = '1,2,3'
          this.contentTabIndex = 1
        }
        this.contentList.length == 0 && (this.contentTabIndex === 1 && ((this.selectState = '4,5,6,7,8,9,10,11') && (this.contentTabIndex = 2)) || ((this.selectState = '1,2,3') && (this.contentTabIndex = 1)))
        this.initData()
        // console.log('搜索', this.contentList, this.contentList.length)
      })
      // 模糊搜索
      this.Bus.$on(this.searchResult,({type, data}) => {
        if(data == '') {``
          this.orderId = ''
          this.tradeCode = ''
          this.trader = ''
          this.initData()
          return
        }
        this.result = []
        this.WsProxy.send('otc',`fuzzy_search_${type}`,{ // 请求数据
          keyword: data
        }).then((data)=>{
          data.results && data.results.forEach(v => {
            this.result.push({name: v.Result})
          })
          data.List && data.List.forEach(v => {
            this.result.push({name: v.name})
          })
        }).catch((msg)=>{
          console.log(msg);
        });
      });
      // this.Bus.$on('offTime', data => this.showTime = data);
      // 时间框值
      this.Bus.$on('onDiChange', () => {
        this.startValueDate = this.$refs.di.paramDate1;
        this.endValueDate = this.$refs.di.paramDate2;
        if (this.startValueDate && this.endValueDate) {
          this.contentList.length == 0 && (this.contentTabIndex === 1 && ((this.selectState = '4,5,6,7,8,9,10,11') && (this.contentTabIndex = 2)) || ((this.selectState = '1,2,3') && (this.contentTabIndex = 1)))
          this.initData()
        }
      });
      this.Bus.$on('onPageChange', data => {
        this.curPage = data;
        this.initData();
      });
      this.Bus.$on('transformRet', data => {
        this.exchangeFlag = data == 300 ? true : false
      })
    },
    destroyed() {
      this.Bus.$off(this.orderTypeValue);
      this.Bus.$off(this.currencyValue);
      this.Bus.$off(this.allStatusValue);
      this.Bus.$off(this.searchValue);
      this.Bus.$off('changeInputContent');
      this.Bus.$off('onDiChange');
      this.Bus.$off('onPageChange');
      this.Bus.$off('transformRet');
    },
    methods: {
      contactSomeone(id){
        this.Bus.$emit('contactSomeone', {id: this.JsonBig.stringify(id)})
      },
      appealTimer(){ // 申述倒计时
        let s = 0;
        this.contentList && this.contentList.forEach((e,i) => {
          if (e.timeToAppeal > 0) {
            s++;
            e.timeToAppeal--;
            this.$set(this.contentList,i,e);
          }
        });
        if(s<=0) return;
        setTimeout(() => {
          this.appealTimer();
        },1000);
      },
      showOverTimer() { // 标记已付款倒计时
        let timer
        this.contentList && this.contentList.forEach((v, i) => {
          if (this.JsonBig.stringify(v.buyer) == this.userId && v.state == 1 && v.overtime >= 0) {
            v.overtime--
            timer = setTimeout(() => {
              this.showOverTimer()
            },1000);
          }
          if (this.JsonBig.stringify(v.buyer) == this.userId && v.state == 1 && v.overtime < 0) {
            // console.log(222, this.contentList.length)
            this.contentList = this.contentList.filter(item => {return item.state !== 1})
            this.conductNum = this.contentList.length
            this.completeNum ++;
            this.flagNow = false;
            clearTimeout(timer)
          }
          // console.log(1111, v.overtime)
        });
      },
      initData() {
        let ws = this.WebSocket; // 创建websocket连接
        let seq = ws.seq;
        ws.onMessage[seq] = { // 监听
          callback: (data) => {
            if(!data || data.body.ret !== 0) return;

            //let data={"ver":1,"op":32,"seq":7,"body":{"action":"orders_r","ret":0,"msg":"","data":{"count":15,"amount":2,"orders":[{"id":237011823210008576,"buyer":219248926602043392,"seller":222468031110979584,"sid":226423409892921344,"name":"user_19827796","contact":"douqq@mixotc.com","icon":"","currency":"doge","amountc":6666.666666,"money":"cny","amountm":200,"price":0.03,"fee":0,"trade_code":"494252","type":1,"state":1,"flag":0,"create":1531310910,"paytime":1531310910,"update":1531310910,"info":"","limit":10,"overtime":581,"time_to_appeal":1781},{"id":237011684596649984,"buyer":222371201475944448,"seller":219248926602043392,"sid":222494969821138944,"name":"社会人","contact":"lihh@mixotc.com","icon":"9D9E5EF1A6E217AE","currency":"doge","amountc":6633.33333267,"money":"cny","amountm":200,"price":0.03,"fee":0,"trade_code":"330274","type":2,"state":1,"flag":0,"create":1531310877,"paytime":1531310877,"update":1531310877,"info":"随时在线","limit":10,"overtime":548,"time_to_appeal":1748}]}}}

            this.contentList = data.body.data.orders ? data.body.data.orders : [];
            this.pageTotal = data.body.data.amount;
            // 购买成功的订单显示弹窗
            if (this.$store.state.newOrder) {
              this.updateTradeCode = this.contentList[0].trade_code;
              this.showPayment = true;
              this.$store.state.newOrder = false;
            }
            // 根据状态进行判断
            this.contentList && this.contentList.forEach((v,i) => {
              // 倒计时数据
              if (this.flagNow && v.state == 1) {
                this.endTime = (v.limit - (Math.floor(new Date().getTime() / 1000) - v.create * 1) / 60) * 60000
                this.showOverTimer();
              }
              //交易失败不显示手续费
              v.showFee=!(v.state===4|| v.state===5||v.state===11);
              //是否被申诉人
              v.isApealed=(v.type===1&&v.flag===2)||(v.type===2&&v.flag===1);
              // 数据格式化
              v.price = this.JsonBig.stringify(v.price).formatFixed(2);
              // 状态数组
              let stateListObject = {
                1: [{name: '待付款', flag: 3}],
                2: [{name: '待付款'}, {name: '待放币', flag: 3}],
                3: [{name: '待付款'}, {name: '待放币'}, {name: '申诉中', flag: 1}],
                4: [{name: '待付款'}, {name: '失败', flag: 1}, {name: '取消'}],
                5: [{name: '待付款'}, {name: '失败', flag: 1}, {name: '超时'}],
                6: [{name: '待付款'}, {name: '待放币'}, {name: '完成', flag: 2}],
                7: this.JsonBig.stringify(v.buyer) == this.userId ? [{name: '待付款'}, {name: '待放币'}, {name: '完成', flag: 2}, {name: '已评价'}] : [{name: '待付款'}, {name: '待放币'}, {name: '完成', flag: 2}],
                8: this.JsonBig.stringify(v.buyer) == this.userId ? [{name: '待付款'}, {name: '待放币'}, {name: '完成', flag: 2}] : [{name: '待付款'}, {name: '待放币'}, {name: '完成', flag: 2}, {name: '已评价'}],
                9: [{name: '待付款'}, {name: '待放币'}, {name: '完成', flag: 2}, {name: '已评价'}],
                10: [{name: '待付款'}, {name: '待放币'}, {name: '完成', flag: 2}, {name: '强制放币'}],
                11: [{name: '待付款'}, {name: '待放币'}, {name: '失败', flag: 1}, {name: '终止'}]
              }
              v.stateList = stateListObject[v.state]
              // 操作数组
              let operationListObject = {
                1: this.JsonBig.stringify(v.buyer) == this.userId ? [{name: '标记已付款', flag: 3}, {name: '取消订单', flag: 4}] : [{name: '提醒付款', flag: 5}],
                //1: [{name: '标记已付款', flag: 3}, {name: '取消订单', flag: 4}],
                2: this.JsonBig.stringify(v.buyer) == this.userId ? [{name: '提醒放币', flag: 6}, {name: '申诉', flag: 7}] : [{name: '释放币', flag: 8}, {name: '申诉', flag: 7}],
                3: this.JsonBig.stringify(v.buyer) == this.userId ? [{name: '提醒放币', flag: 6}, {name: '撤销申诉', flag: 9}] : [{name: '释放币', flag: 8}, {name: '撤销申诉', flag: 9}],
                6: [{name: '去评价', flag: 1}],
                7: this.JsonBig.stringify(v.buyer) == this.userId ? [{name: '查看评价', flag: 2}] : [{name: '去评价', flag: 1}],
                8: this.JsonBig.stringify(v.buyer) == this.userId ? [{name: '去评价', flag: 1}] : [{name: '查看评价', flag: 2}],
                9: [{name: '查看评价', flag: 2}]
              }
              v.operationList = operationListObject[v.state]
              // 可申诉时间到计时
              v.timeToAppeal= 30 * 60 - (Math.floor(Date.now() / 1000) - v.paytime);
            });
            this.appealTimer();
      },
      date:new Date()
    };
        ws.send(sendConfig('otc', { // 发包
          seq: seq,
          body:{
            "action": "orders",
            data: {
              "type": this.selectOrder, // 1 买; 2 卖; 3 全部  <-state=0
              "state": this.selectState, // 订单状态
              "origin": this.curPage - 1, // 分页
              "count": 15, // 每页多少条数据
              "date": this.dateSort,// 时间排序 1降序 2升序
              "price": this.price,// 单价排序 1降序 2升序
              "amount": this.amount,// 电子币数量排序 1降序 2升序
              "money": this.money,// 法币金额排序 1降序 2升序
              "currency": this.selectCurrency,// 币种筛选
              "start": this.startValueDate, // 开始时间
              "end": this.endValueDate,// 结束时间
              "order_id": this.orderId, // 订单号
              "trade_code": this.tradeCode, // 资金码
              "trader": this.trader, // 账号
              "comment": Number(this.comment), // 1 已 2 未 评价
            }
          }
        }))
      },
      getCompleteData() { // 已完成状态
        let ws = this.WebSocket; // 创建websocket连接
        ws.onMessage['upd_ord'] = { // 完成状态的action
          callback: (res) => {
            if (res.op && res.op === 24 && res.body.type === 'upd_ord') {
              this.contentList = this.contentList.filter(v => {
                return this.JsonBig.stringify(v.id) !== this.JsonBig.stringify(res.body.data.order)
              })
              this.conductNum--
              this.completeNum++
            }
          },
        };
      },
      getInitNum() { // 获取进行中和已完成数量
        this.WsProxy.send('otc','get_orders_num',{
          type: 1 // 1: 进行中, 2: 已完成
        }).then((data)=>{
          // console.log('num', data)
          this.conductNum = data.amount ? data.amount : 0
        }).catch((msg)=>{
          console.log(msg);
        });
        this.WsProxy.send('otc','get_orders_num',{
          type: 2 // 1: 进行中, 2: 已完成
        }).then((data)=>{
          // console.log('num', data)
          this.completeNum = data.amount ? data.amount : 0
        }).catch((msg)=>{
          console.log(msg);
        });
      },
      getOrderCoin() { // 获取订单币种
        this.WsProxy.send('otc','get_orders_currency',{
          type: this.contentTabIndex // 1: 进行中, 2: 已完成
        }).then((data)=>{
          this.currencyBox = []
          data.coins && data.coins.forEach(v => {
            this.currencyBox.push({type: v.currency.toUpperCase(), state: false, code: v.currency})
          })
          this.isDisabled = this.currencyBox.length == 0 ? true : false
        }).catch((msg)=>{
          console.log(msg);
        });
      },
      selectStatus(type) { // Tab切换
        this.contentTabIndex = type;
        this.$store.state.newOrder = false;
        this.clickUp = 20;

        // 获取用户id
        this.userId = this.JsonBig.stringify(this.$store.state.userInfo.uid)
        // console.log(this.userId)
        if (this.contentTabIndex === 1) {
          this.selectState = "1,2,3"
        }
        if (this.contentTabIndex === 2) {
          this.selectState = "4,5,6,7,8,9,10,11"
        }
        this.initData()
        this.getOrderCoin();
      },
      selectTime(index) { // 时间切换
        //this.num = index;
        if (index === 0) {
          this.$refs.di.setDays(1);
        }
        if (index === 1) {
          this.$refs.di.setDays(3);
        }
        if (index === 2) {
          this.$refs.di.setDays(7);
        }
      },
      showOperation(index) { // 去评价
        if (this.contentList[index].operationList[0].flag == 1) { // 去评价
          this.$router.push({path: '/order/evaluate', query: {type: '0'}});
          this.$store.commit({type: 'evaluateOrder', data: this.contentList[index]}) // 存储当前订单信息
        }
        if (this.contentList[index].operationList[0].flag == 2) { // 查看评价
          this.$router.push({path: '/order/evaluate', query: {type: '1'}});
          this.$store.commit({type: 'evaluateOrder', data: this.contentList[index]}) // 存储当前订单信息
        }
      },
      closePayment() { // 控制标记已付款弹窗
        this.showPayment = false
      },
      remindCoin(content) { // 提醒弹窗
        // console.log('content', content)
        this.remindCoinLayer = true;
        this.remindCoinContent = '提醒发送成功'
        this.WsProxy.send('otc','remind_order',{
          uid: content.sid,
          id: content.id,
          state: content.state,
          info: content.info
        }).then((data)=>{
          // console.log('remind_order', data)
        }).catch((msg)=>{
          console.log(msg);
        });
        setTimeout(() => {
          this.remindCoinLayer = false
        }, 3000)
      },
      openReleaseCoin(st, content) { // 释放币弹窗
        if (st === 'false') {
          this.showReleaseCoin = false
        } else {
          this.showReleaseCoin = true
          this.updateId = content.id
          this.updateUid = content.sid
          this.$store.commit({type: 'showTransform', data: 0}) // 支付标识来源
        }
      },
      goExchange() {
        this.remindCoinLayer = true
        this.remindCoinContent = '请前往<a href="" style="text-decoration: underline; color: #FFB422">交易所</a>开通币币账户'
        setTimeout(() => {
          this.remindCoinLayer = false
        }, 3000)
      },
      // openTransform(st) { // 资金互转弹窗
      //   this.showTransform = st === 'false' ? false : true
      // },
      openSelect(st, operation, index, content) { // 双选择公共弹窗
        if (st === 'false') {
          this.showSelect = false
        } else {
          this.showType = operation.flag;
          // console.log('this.showType', this.showType)
          switch (operation.flag) {
            case 4: // 取消订单弹窗
              this.selectContent = '确定取消订单？'; // 内容
              this.selectLeft = '取消'; // 左边内容
              this.selectRight = '确定'; // 右边内容
              this.otherId = this.JsonBig.stringify(content.buyer) == this.userId ? content.seller : content.buyer;
              this.updateId = this.contentList[index].id;
              break;
            case 7: // 买家申请弹窗
              if(content.timeToAppeal>0) return;
              this.selectContent = this.JsonBig.stringify(content.buyer) === this.userId ? '请先与对方联系，核实对方是否放币' : '请先与对方联系，核实对方是否付款'; // 内容
              this.selectLeft = '申诉'; // 左边内容
              this.selectRight = '联系对方'; // 右边内容
              this.otherId = this.JsonBig.stringify(content.buyer) == this.userId ? content.seller : content.buyer;
              this.updateId = this.contentList[index].id;
              this.updateInfo = this.contentList[index].info;
              break;
            case 9: // 撤销订单弹窗
              this.selectContent = '确定撤销申诉？'
              this.selectLeft = '取消'; // 左边内容
              this.selectRight = '确定'; // 右边内容
              this.otherId = this.JsonBig.stringify(content.buyer) == this.userId ? content.seller : content.buyer;
              this.updateId = this.contentList[index].id;
              this.updateInfo = this.contentList[index].info;
          }
          this.showSelect = true
        }
      },
      toSort(title, index) { // 排序操作
        this.clickUp = index;
        this.sortActive = this.sortFlag === index ? !this.sortActive : true;
        this.dateSort = title.flag === 0 ? (this.sortActive ?  2 : 1) : 0;
        this.price = title.flag === 4 ? (this.sortActive ? 2 : 1) : 0;
        this.amount = title.flag === 5 ? (this.sortActive ? 2 : 1) : 0;
        this.money = title.flag === 6 ? (this.sortActive ? 2 : 1) : 0;
        this.sortFlag = title.flag;
        this.initData()
      },
      markPay(content,index) { // 标记已付款
        //禁用按钮
        let $markPayBtn=this.$refs.markPayBtn[index];
        $markPayBtn.style.pointerEvents="none";
        $markPayBtn.style.opacity="0.8";
        //
        this.WsProxy.send("otc","update_order",{
          "id": content.id,
          "state": 2, // 1 等待买家付款; 2 卖家确认收款／等待卖家发货; 3申诉中; 4 已取消; 5 已超时; 6交易完成; 7 买家评价; 8 卖家评价; 9 双方已评
          "info": content.info
        }).then(data=>{
          window.location.reload();
        }).catch(msg=>{
          //解除禁用
          $markPayBtn.style.pointerEvents="all";
          $markPayBtn.style.opacity="1";
          this.$refs.alert.showAlert({content:getErrorMsg(msg.ret)});
        });
      }
    }
  }
</script>

<style scoped lang="stylus">
  @import "../../stylus/base.styl"
  .my-order-wrap
    margin-top 11px
    margin-bottom 40px
    h1
      font-size 12px
      color #333
      letter-spacing 0.25px
      margin-bottom 20px
      a:hover
        color $col422

    /*font-size $fz20
    font-weight bold
    color $col333
    margin-bottom 30px
    &:before
      display inline-block
      width 3px
      height 20px
      position relative
      top 2px
      left 0
      content ''
      margin-right 9px
      background-color $col422*/

    .order-item
      height 60px
      margin-bottom 1px
      padding 0 30px
      background #FFF
      line-height 60px
      font-size 16px
      cursor pointer
      span
        float left
        padding 0 15px
      span:first-child
        margin-right 30px
      .content-btn
        color #999
      .content-btn-active
        margin-top -2px
        color $col422
        border-bottom 2px solid $col422
      button
        float right
        width 88px
        height 25px
        margin-top 17px
        font-size 13px
        background #FFF
        color #FFB422
        letter-spacing 0.27px
        border 1px solid #FFB422
        border-radius 2px
        cursor pointer
        text-align center

    .order-select
      height 50px
      padding 0 30px
      margin-bottom 1px
      background #FFF
      .order-choice-search
        float left
        margin-right 0
        margin-top 10px
      .order-choice-time
        float right
        margin-top 10px
        .date-group
          float left
          margin-right 20px
        li
          float left
        ol
          line-height 30px
          margin-right 22px
          li:nth-child(2)
            margin 0 10px
        ul
          float left
          line-height 30px
          border 1px solid #FFF3EB
          border-radius 0 2px 2px 0
          li
            width 50px
            text-align center
            background #FFF3EB
            color #999
            cursor pointer
            &:hover
              background #FFF
              color #FFB422
          .time-active
            background #FFF
            color #FFB422
        /*img*/
          /*width 16px*/
          /*height 16px*/
          /*margin 8px 10px 0 0*/

    .order-content
      margin-bottom 44px
      li
        width 110px
        font-size $fz13
        .hidden-text
          display block
          width 100px
          overflow hidden
          white-space nowrap
          text-overflow ellipsis
      li:nth-child(1)
        width 130px
      li:nth-child(4)
        width: 140px
      li:nth-child(8)
        width 90px
      ol
        margin 20px 0
        padding 0 30px
        li
          float left
          color #999

      .sort
        cursor pointer

        span
          position relative
          i.before
            position absolute
            top 3px
            right -19px
            triangle_up($col999)

          i.after
            position absolute
            top 10px
            right -19px
            triangle_down($col999)

      .sort-up
        span
          i.before
            border-bottom-color $col422
      .sort-down
        span
          i.after
            border-top-color $col422

      .order-content-info
        padding 18px 30px
        border 1px solid #E1E1E1
        background #FFF
        margin-bottom 10px
        ul
          padding-bottom 10px
          border-bottom 1px solid #E1E1E1
          .state-li
            p
              color #999
            .text-r
              color #ff794c
            .text-g
              color #57a100
            .text-b
              color #333
              cursor pointer

          .operation-li
            p
              color #FFB422
              cursor pointer
              &:hover
                color $col350
              >span.disabled
                color #999
                pointer-events none
            .active-btn
              display inline-block
              width 100px
              height 25px
              text-align center
              line-height 25px
              color #FFF
              background: #FFB422
              border-radius: 2px
              cursor pointer
              &:hover
                background $col350
            .text-b
              color #333
              cursor pointer
              &:hover
                color $col422


          li
            float left
            p
              margin-bottom 10px
            .talk
              position relative
              padding-left 30px
              color #FFB422
              cursor pointer
              &:before
                position absolute
                top 0
                left 0
                width 18px
                height 18px
                content ''
                background url(/static/images/talk.png) no-repeat
                background-size 18px 18px
              &:hover
                color $col350

          .text-g
            color $col100
          .text-r
            color #FF794C
        .order-content-extre
          padding-top 17px
          font-size 13px
          color #999
          span
            float left
          span:nth-child(1)
            margin-right 30px
          .reset-time
            float right


  /*弹窗部分*/
  .remind-coin-layer
    text-align center
    line-height 94px

  /*分页部分*/
  .page-btn
    width 300px
    margin 0 auto
    text-align center
    button
      width 80px
      height 40px
      background #FFB422
      color #FFF
      cursor pointer
    button:first-child
      margin-right 100px
    .unable-btn
      background #999


</style>
