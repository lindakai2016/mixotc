<template>
  <div class="news-info-left">
    <div class="search-box">
      <input type="text" placeholder="查找昵称/账号" v-model="searchText" @blur="doSearch" @input="input" @keyup.enter="doSearch"/>
      <img src="/static/images/search_gray.png"/>
    </div>
      <happy-scroll style="width:159px;height:325px" resize bigger-move-h="start" hide-horizontal>
        <div class="wrap">
          <ul class="firend-list" v-if="!search">
            <li v-for="content in userList" :key="content.id" :class="{cur: content.id === $store.state.curChat}" @click="selectChat(content.id)">
              <img :src="content.icon ? content.icon : (content.isSingle ?  infoDiction[content.uid] && infoDiction[content.uid].icon : infoDiction[content.id] && infoDiction[content.id].icon)" alt="" class="head-portrait">
              <b v-if="content.unread"></b>
              <span>{{content.nickName ? content.nickName : (content.isSingle ? infoDiction[content.uid] && infoDiction[content.uid].name : infoDiction[content.uid] && infoDiction[content.id].name)}}{{content.length ? `(${content.length})` : ''}}</span>
              <img src="/static/images/close_btn.png" alt="" class="close-head" @click.stop="delUser(content)">
            </li>
          </ul>
          <ul class="firend-list" v-else>
            <li v-for="(content) in searchRange" :key="content.id" :class="{cur: content.id === $store.state.curChat}" @click="newChat(content)">
              <img :src="content.icon ? content.icon : (content.isSingle ?  infoDiction[content.uid].icon : infoDiction[content.id].icon)" alt="" class="head-portrait">
              <span>{{content.nickName ? content.nickName : (content.isSingle ? infoDiction[content.uid].name : infoDiction[content.id].name)}}{{content.group ? `(${groupLength[content.id]})` : ''}}</span>
            </li>
          </ul>
        </div>
      </happy-scroll>
    <div class="other-item">
      <div class="img system">
        <b v-if="$store.state.systemMessage"></b>
        <img src="/static/images/notice_icon.png" @click="toSystem">
      </div>
      <div class="img phone-img">
        <img src="/static/images/phoneicon.png">
        <p>
          <QrcodeVue class="qrcode" :value="`${HostUrl.download}download.html`" :size="70"></QrcodeVue>
          <span><i>下载APP沟通更方便</i></span>
        </p>
      </div>
    </div>
    <!-- 查看群 -->

  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  // import { HappyScroll } from 'vue-happy-scroll'
  // import QrcodeVue from 'qrcode.vue'
  export default {
    name: "new-info-left",
    data() {
      return {
        search: false,
        searchText: '',
        searchRange: [],
        userId: this.JsonBig.stringify(this.$store.state.userInfo.uid)
      }
    },
    mounted() {
      this.$store.dispatch({ type: 'getService', ws: this.WsProxy});
      this.initData()
      this.reqFriend()//监听好友请求
      this.beKickGroup()//监听被踢出群
      this.quitGroup()//监听退群
      document.querySelector('.news-info-left .happy-scroll-container').className = 'happy-scroll-container import';
    },
    computed: {
      ...mapGetters([
        'chatIds',
        'friendIds',
        'friendGid',
        'infoDiction',
        'groupLength'
      ]),
      userList() {
        return this.$store.state.chat
      }
    },
    components: {
      // HappyScroll,
      QrcodeVue
    },
    methods: {
      async fetchGroup() {
        await this.$store.dispatch({ type: 'getGroupList', ws: this.WsProxy})
      },
      //初始化拉取加工数据
      async initData() {
        let result = [];
        //拉取好友列表
        // console.log('sdfsdfdsfsdf', this.WebSocket.ws.readyState)
        await this.$store.dispatch({ type: 'getFriendList', ws: this.WsProxy})
        //拉取群組列表
        await this.fetchGroup();
        //拉取近十天对话列表
        let linkman = await this.WsProxy.send('control', 'recent_contact', {uid: this.$store.state.userInfo.uid}).then(data => {
          if(!data.contacts) return [];
          return data.contacts
        }).catch(error=>{
          console.log(error)
        })
        //加工数据
        // console.log(linkman)
        linkman && linkman.forEach(item => {
          let group = null;
          if (item.gid) {     // 群
            group = this.$store.state.groupList.filter(group => {
              return this.JsonBig.stringify(item.gid) === this.JsonBig.stringify(group.id)
            })[0]
            if(group.type === 1){     // 群-多聊
              result.push({
                mid: item.mid ? this.JsonBig.stringify(item.mid) : 0,
                id: this.JsonBig.stringify(item.gid),
                group: true,
                length: group.members.length,
                service: false,
                icon: "/static/images/groupChat_icon.png",
                nickName: !group.name ? group.members.map(item =>{
                  return item.name
                }).join('、') : `${group.name}`,
                phone: false,
                email: false,
                unread: 0,
                moreFlag: true,
                exists: true//踢出群聊的标志
              });
            }else {     // 群-单聊
              let other = group.members.filter( item => {
                return this.JsonBig.stringify(item.id) !== this.JsonBig.stringify(this.$store.state.userInfo.uid)
              })[0]
              let uid = this.JsonBig.stringify(other.id)
              result.push({
                mid: item.mid ? this.JsonBig.stringify(item.mid) : 0,
                id: this.JsonBig.stringify(group.id),
                uid: uid,
                isSingle: true,
                group: false,
                service: false,
                phone: other.phone,
                email: other.email,
                exists: true,
                moreFlag: true,
                unread: 0
              });
            }
          }else if (item.is_peer_admin){      // 与客服对话
            result.push({
              mid: item.mid ? this.JsonBig.stringify(item.mid) : 0,
              id: this.JsonBig.stringify(item.uid),
              group: false,
              service: true,
              icon: "/static/images/service_icon.png",
              nickName: '客服',
              phone: false,
              email: false,
              moreFlag: true,
              unread: 0
            });
          }else {
            let id = this.JsonBig.stringify(item.uid);
            this.$store.commit(
              {type: 'updateStrangerInfo', data: {
                id: id,
                icon: item.icon ? `${this.HostUrl.http}image/${item.icon}` : "/static/images/default_avator.png",
                name: item.name
              }
            })
            if (this.friendIds.includes(id) || this.userId === id) return;
            result.push({
              mid: item.mid ? this.JsonBig.stringify(item.mid) : 0,
              id: id,
              uid: id,
              group: false,
              service: false,
              phone: item.phone,
              email: item.email,
              moreFlag: true,
              unread: 0
            });
          }
        })
        linkman && this.$store.commit({type: 'changeChat', data: result});
      },
      // 监听系统消息(请求加好友)
      reqFriend(){
        this.WebSocket.onMessage['req_friend'] = {
          callback:(res) => {
            // console.log('sdfaasadfadsfasf', res)
            if (res.body && res.body.type === "req_fd") {
              let {id, info, icon, name} = res.body.data;
              const obj = {
                sid: this.JsonBig.stringify(res.body.id),
                id: this.JsonBig.stringify(id),
                info: info,
                isDeal: false
              }
              this.$store.commit({
                type: 'updateStrangerInfo', data:
                  {
                    id: this.JsonBig.stringify(id),
                    icon: icon ? `${this.HostUrl.http}image/${icon}` : "/static/images/default_avator.png",
                    name: name
                  }
              })
              this.$store.commit({type:'newSystemMes', data: obj})
            }
          }
        }
      },
      //监听被踢出群
      beKickGroup() {
         this.WebSocket.onMessage['kick_g_notify'] = {
          callback:async (res) => {
            if (res.body && res.body.type === 'kicked_g') {
              let {gid} = res.body.data;
              this.$store.commit({type: 'beKick', data: this.JsonBig.stringify(gid)})
            }
          }
        }
      },
      //监听退群
      quitGroup() {
        this.WebSocket.onMessage['quit_group'] = {
          callback:async (res) => {
            if (res.body && res.body.type === 'quit_g') {
              let {gid, uid} = res.body.data;
              if(this.JsonBig.stringify(uid) === this.userId) return;
              await this.fetchGroup();
              this.$store.commit({type: 'updateGroupInfo', data: { id :this.JsonBig.stringify(gid)}})
            }
          }
        }
      },
      //搜索框
      input() {
        this.searchText === '' && (this.search = false)
      },
      doSearch() {
        if(this.searchText === '') return;
        this.search = true;
        this.searchLinkman()
      },
      //切换至系统消息界面
      toSystem() {
        this.$store.commit({type: 'changeCurChat', data: {id: 'system'}})
      },
      selectChat(id, index) {
        this.$store.commit({type: 'changeCurChat', data: {id}})
      },
      //处理搜索范围，联系人列表，好友，群组
      searchLinkman() {
        let result = [];
        //联系人列表
        this.$store.state.chat.forEach(item => {
          if (this.infoDiction[item.uid] && this.infoDiction[item.uid].name.includes(this.searchText) || this.infoDiction[item.id] && this.infoDiction[item.id].name.includes(this.searchText) || item.nickName && item.nickName.includes(this.searchText) || item.phone && item.phone.includes(this.searchText) || item.email && item.email.includes(this.searchText)) {
            result.push(item);
          }
        })
        //好友
        this.$store.state.friendList.forEach(item => {
          let id = this.friendGid[this.JsonBig.stringify(item.id)]
          if (this.chatIds.includes(id)) return;
          if (item.name.includes(this.searchText) || item.phone && item.phone.includes(this.searchText) || item.email && item.email.includes(this.searchText)) {
            result.push({
              id: id,
              uid: this.JsonBig.stringify(item.id),
              isSingle: true,
              group: false,
              service: false,
              phone: item.phone,
              email: item.email,
              exists: true,
              moreFlag: true,
              unread: 0
            });
          }
        })
        //群组
        this.$store.state.groupList.forEach(item => {
          if (this.chatIds.includes(this.JsonBig.stringify(item.id))) return;
          if ( item.type === 1 && (item.name.includes(this.searchText) || item.phone && item.phone.includes(this.searchText) || item.email && item.email.includes(this.searchText) || this.JsonBig.stringify(item.id).includes(this.searchText))) {
            result.push({
              id: this.JsonBig.stringify(item.id),
              group: true,
              service: false,
              length: item.members.length,
              icon: "/static/images/groupChat_icon.png",
              nickName: !item.name ? item.members.map(item =>{
                return item.name
              }).join('、') : `${item.name}`,
              phone: false,
              email: false,
              unread: 0,
              moreFlag: false,
              exists: true
            });
          }
        })
        this.searchRange = result
        console.log(result);
      },
      delUser(chat) {
        let messages = this.$store.state.messages[chat.id],
            lastId = 0;
        if (messages) {
          for (let i = messages.length - 1; i < messages.length; i--) {
            if(messages[i].id) {
              lastId = messages[i].id;
              break;
            }
          }
        }
        if(!lastId) chat.mid && (lastId = chat.mid)
        let gid = (chat.isSingle || chat.group) ? chat.id : chat.uid,
            uid = chat.uid ? chat.uid : 0;
        lastId && this.WsProxy.send('control', 'ignore_group', {
          uid: this.JsonBig.parse(uid),
          gid: this.JsonBig.parse(gid),
          msg_id: this.JsonBig.parse(lastId)
        }).then(data => {
          }).catch(error=>{
            console.log(error)
        })
        this.$store.commit({type: 'delChat', data: chat.id})
      },
      newChat(chat) {
        this.search = false
        if (this.chatIds.includes(chat.id)) {
          this.$store.commit({type: 'changeCurChat', data: {id:chat.id}})
          return;
        }
        this.$store.commit({type: 'newChat', data: chat})
      }
    }
  }
</script>

<style scoped lang="stylus">
  @import "../../../stylus/base.styl"

    .news-info-left
      position relative
      float left
      width 159px
      height 420px
      background #FFF
      border-right 1px solid #E1E1E1
      .search-box
        position relative
        height 40px
        line-height 40px
        border-bottom 1px solid #E1E1E1
        input
          box-sizing()
          width 150px
          height 30px
          font-size $fz13
          padding-left 10px
          padding-right 30px
          background #F4F6FA
          border-radius 2px 2px 2px 0
          margin-left 5px
          placeholder()
        img
          position absolute
          top 12px
          right 15px
          width 18px
          height 18px
      .wrap
        width 159px
        .firend-list
          background #FFF
          margin-bottom 5px
          li
            position relative
            height 42px
            line-height 42px
            cursor pointer
            &:hover, &.cur
              background-color $col6FA
              .close-head
                display block
                width 5.7px
                height 5.7px
            b
              position absolute
              left 27px
              top 7px
              width 9px
              height 9px
              background $col94C
              border-radius 50%
            img
              vertical-align middle
            .head-portrait
              width 30px
              height 30px
              border-radius 50%
              margin 0 10px 0 5px
            .close-head
              display none
              position absolute
              top 18px
              right 8px
              width 5px
              height 5px
              cursor pointer
            span
              display inline-block
              width 90px
              font-size 12px
              margin-right 5px
              overflow hidden
              white-space nowrap
              text-overflow ellipsis
              vertical-align middle
      .other-item
        position absolute
        left 0
        bottom 0
        width 123px
        height 36px
        padding 8px 0 6px
        padding-left 36px
        -webkit-box-shadow: 0 -3px 3px 0 rgba(0,0,0,0.1)
        box-shadow:  0 -3px 3px 0 rgba(0,0,0,0.1)
        b
          position absolute
          left 57px
          top 8px
          width 9px
          height 9px
          background $col94C
          border-radius 50%
        .img
          display inline-block
          width 30px
          height 30px
          vertical-align middle
          cursor pointer
          &.system
            margin-right 37px
        .phone-img
          position relative
          width 16px
          height 24px
          &:hover
            p
              display block
          p
            display none
            position absolute
            top -112px
            right -26px
            width 80px
            height 100px
            text-align center
            background #FFF
            box-shadow -2px -2px 8px 0 rgba(51,51,51,0.30)
            .qrcode
              margin-top 8px
            span
              float left
              width 100%
              margin-left 5px
              i
                display inline-block
                width 100%
                white-space nowrap
                fz8()
                color $col333
                letter-spacing 0.09px

</style>
