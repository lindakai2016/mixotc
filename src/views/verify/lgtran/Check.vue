<template>
  <!--已审核-->
  <div class="check">
    <div class="filter">
      <div class="f1">
        <input type="text" placeholder="搜索用户昵称/账号" v-model="srchText" v-clickoutside="()=>{srchShowTip=false}"
               @focus="fuzzyInput" @input="fuzzyInput">
        <img src="/static/images/cancel_icon.png" @click="srchText=''" v-show="srchText.length>0">
        <button @click="search"></button>
        <ul v-show="srchShowTip && tips.length>0">
          <li v-for="(o,i) in tips" @mousedown="srchText=o.nickname" @click="search">
            <span class="sp1">{{o.nickname}}</span><span class="sp2">{{o.account}}</span>
          </li>
        </ul>
      </div>
      <div class="f2">
        <DateInterval ref="di"></DateInterval>
      </div>
      <div class="f3">
        <a href="javascript:void(0)" @click="days=1">今天</a>
        <a href="javascript:void(0)" @click="days=3">三天</a>
        <a href="javascript:void(0)" @click="days=7">七天</a>
      </div>
    </div>
    <div class="tb-head">
      <span class="tjsj">提交时间</span>
      <span class="yh">用户</span>
      <span class="shr">审批人</span>
      <span class="shsj sortable" @click="sort=(sort+1)%2">
          审核时间<i class="sort" :class="{up:sort===0,down:sort===1}"></i>
        </span>
      <span class="ys sortable" @click="sort=(sort+1)%2+2">
          用时<i class="sort" :class="{up:sort===2,down:sort===3}"></i>
        </span>
      <span class="zt drop">
          <a href="javascript:void(0)" v-clickoutside="()=>{statusDropShow=false}" @click="statusDropShow=!statusDropShow">{{status[statusDropSel].text}}</a>
          <ul v-show="statusDropShow">
            <li @click="statusDropSel=i" v-for="(e,i) in status" :key="i">{{e.text}}</li>
          </ul>
        </span>
      <span class="cz">操作</span>
    </div>
    <div v-if="err===0">
      <div class="li" v-for="(e,i) in list" :key="i">
        <div class="booth">
          <div class="tjsj">
            <p>{{e.submitTime1}}</p>
            <p>{{e.submitTime2}}</p>
          </div>
          <div class="yh"><a :href="'#/homepage?uid='+e.uid" target="_blank">{{e.nickname}}</a></div>
          <div class="shr">{{e.nicknameCk}}</div>
          <div class="shsj">
            <p>{{e.checkTime1}}</p>
            <p>{{e.checkTime2}}</p>
          </div>
          <div class="ys">{{e.spend}}</div>
          <div class="zt">{{e.checkResult}}</div>
          <div class="cz"><a href="javascript:void(0)" @click="showPop(i)">查看</a></div>
        </div>
        <div class="division"></div>
        <div class="remark">备注：{{e.checkRemark}}</div>
      </div>
      <Pagination :total="total" :pageSize="pageSize" :curPage="curPage"></Pagination>
      <BasePopup :show="pop" :width="764" :height="382" :top="50">
        <div class="pop">
          <p class="inf-li"><label>提交时间</label><span>{{list[popSel].submitTime}}</span></p>
          <p class="inf-li"><label>银行卡号</label><span>{{list[popSel].bankcard}}</span></p>
          <p class="inf-li"><label>开户行</label><span>{{list[popSel].bank}}</span></p>
          <p class="check-img">
            <img :src="list[popSel].img1">
            <img :src="list[popSel].img2">
            <img :src="list[popSel].img3">
          </p>
          <i class="close" @click="pop=false">&times;</i>
        </div>
      </BasePopup>
    </div>
    <div v-else-if="err===1">
      <div class="err no-result">无相应的数据，请重新搜索</div>
    </div>
    <div v-else-if="err===2">
      <div class="err load-failed">网络异常，请重新搜索</div>
    </div>
    <div v-else-if="err===3">
      <div class="err net-error">加载失败，请重新搜索</div>
    </div>
    <div v-else-if="err===4">
      <div class="err loading">加载中...</div>
    </div>
    <div v-else>
      <div class="err empty">没有已审核数据</div>
    </div>
  </div>
</template>
<script>
  import DateInterval from "@/components/common/DateInterval";
  import BasePopup from "@/components/common/BasePopup";
  import Pagination from "../component/Pagination";
  export default {
    components: {
      BasePopup,
      DateInterval,
      Pagination,
    },
    data() {
      return {
        srchText: "",
        srchShowTip: false,
        tips: [],     //模糊搜索结果

        days: 0,
        sort: 1, //0-审核时间升序,1-审核时间降序,2-用时升序,3-用时降序

        statusDropShow: false,    //审核结果下拉框
        statusDropSel: 0,
        status:[
          {text:"全部结果",value:0},
          {text:"通过",value:1},
          {text:"不通过",value:2},
          {text:"恶意上传",value:3},
        ],

        err: -1, //0-正常,1-无相应的用户，2-网络异常，3-加载失败
        list: [],   //分页数据
        total: 0,   //数据长度
        pageSize:20,  //分页大小
        curPage: 1,  //第几页

        popSel: 0,
        pop: false,  //弹窗-查看
      }
    },
    watch:{
      statusDropSel:function(){
        this.loadCheckedList();
      },
      sort:function(){
        this.loadCheckedList();
      },
      days:function(){
        this.$refs.di.setDays(this.days);
      },
    },
    methods: {
      fuzzyInput(){
        if(this.srchText.length<=0){
          this.srchShowTip=false;
        }else{
          this.srchShowTip=true;
          this.loadTips();
        }
      },
      search(){
        this.loadCheckedList();
      },
      showPop(id){
        this.popSel=id;
        this.pop=true;
      },
      loadCheckedList(p=0){
        //
        let srchKey=this.srchText;
        let start= this.$refs.di.paramDate1;
        let end= this.$refs.di.paramDate2;
        let result=this.status[this.statusDropSel].value;
        let sort=this.sort;
        switch (sort){
          case 0:sort=1;break;
          case 1:sort=0;break;
          case 2:sort=3;break;
          case 3:sort=2;break;
          default:sort=0;break;
        }
        //
        this.err=4;
        this.WsProxy.send("control","a_get_identity_list",{
          type:2,
          state:2,
          result: result,
          sort: sort,
          keyword:srchKey,
          start: start,
          end: end,
          page: p,
          count:this.pageSize
        }).then((data)=>{
          if(!data||!data.identities||data.identities.length<=0){
            this.err=1; //无数据
          }else{
            this.err=0;
            this.total=data.amount;
            this.parseList(data.identities);
          }
        }).catch((msg)=>{
          if(!msg){
            this.err=2; //网络异常
          }else if(msg.ret!==0){
            this.err=3; //加载异常
          }
        });
      },
      loadTips(){
        let srchKey=this.srchText;
        this.WsProxy.send("control","a_get_identity_tips",{
          type:2,
          state:2,
          keyword: srchKey,
          count: 10
        }).then((data)=>{
          this.parseTips(data.tips);
        }).catch((msg)=>{
          console.log(msg);
        });
      },
      parseList(data){
        this.list=[];
        data && data.forEach((e,i)=>{
          this.list.push({
            id: e.id,
            submitTime: new Date(e.create*1000).dateHandle("yyyy/MM/dd HH:mm:ss"),
            submitTime1: new Date(e.create*1000).dateHandle("yyyy/MM/dd"),
            submitTime2: new Date(e.create*1000).dateHandle("HH:mm:ss"),
            uid: e.uid,
            nickname: e.nick || "-",
            account: e.phone || e.email || "-",
            nicknameCk: e.verify_name || "-",
            accountCk: e.verify_phone || e.verify_email || "-",
            checkTime: new Date(e.update*1000).dateHandle("yyyy/MM/dd HH:mm:ss"),
            checkTime1: new Date(e.update*1000).dateHandle("yyyy/MM/dd"),
            checkTime2: new Date(e.update*1000).dateHandle("HH:mm:ss"),
            spend: (e.used && e.used.formatSecord()) || "-",
            checkResult: (e.state && ["待审核","通过","不通过","恶意上传"][e.state-1]) || "-",
            checkRemark: e.info||"无",
            name: e.name || "-",
            bankcard: e.number || "-",
            bank: e.bank_name || "-",
            img1: this.HostUrl.http+"image/"+e.image1+"?size=thumb",
            img2: this.HostUrl.http+"image/"+e.image2+"?size=thumb",
            img3: this.HostUrl.http+"image/"+e.image3+"?size=thumb",
          });
        });
      },
      parseTips(data){
        this.tips=[];
        data && data.forEach((e)=>{
          this.tips.push({
            uid: e.uid || 0,
            nickname: e.name || "-",
            account:e.phone || e.email || "-",
          });
        });
      }
    },
    mounted(){
      this.loadCheckedList();
      this.Bus.$on("onPageChange",(p)=>{
        this.curPage=p;
        this.loadCheckedList(p-1);
      });
      this.Bus.$on("onDiChange",()=>{
        this.loadCheckedList();
      });
    },
    destroyed(){
      this.Bus.$off("onDiChange");
      this.Bus.$off("onPageChange");
    }
  }
</script>
<style scoped lang="stylus">
  @import "../../../stylus/base";
  @import "../stylus/check";
</style>
