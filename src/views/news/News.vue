<template>
  <div>
    <div class="news-wrap clearfix" @click="openBox">
      <span v-if="!newMessage && unread" class="tip" ><b :class="{'move-top': unread > 10 }">{{unread > 10 ? '...' : unread }}</b></span>
      <div class="chat">
        <img src="/static/images/talk_icon.png" alt="">
        <i></i>
      </div>
      <p :class="{new: newMessage}">您有<span>{{unread}}</span>条新消息</p>
    </div>
    <NewsInfo v-if="$store.state.isLogin" :talkBoxShow="showTalkBox" @click="openBox"></NewsInfo>
  </div>

</template>

<script>
  import NewsInfo from '@/views/news/NewsInfo'

  export default {
    name: "news",
    data() {
      return {
        showTalkBox: false,
        newMessage: false,
        timer: null
      }
    },
    components: {
      NewsInfo
    },
    mounted() {
      if (this.unread) this.newMessage = true
    },
    computed: {
      unread() {
        return this.$store.state.unreadNumber
      }
    },
    methods: {
      addunread() {
        this.$store.commit({type: 'changeUnread', data: this.$store.state.unreadNumber + 1});
      },
      minunread() {
        this.$store.commit({type: 'changeUnread', data: this.$store.state.unreadNumber - 1});
      },
      openBox() {
        if(!this.$store.state.isLogin) {
          this.$store.commit({'type':'changeLoginForm', data: true})
          return;
        };
        this.$store.commit({'type':'changeChatBox', data: true})
      }
    },
    watch: {
      unread: {
        handler(curValue) {
          if (curValue) {
            !this.newMessage && (this.newMessage = true);
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
              this.newMessage = false
            }, 3000)
            return;
          }
          this.newMessage = false
        },
        immediate: true
      }
    }
  }
</script>

<style scoped lang="stylus">
  @import "../../stylus/base.styl"
  .news-wrap
    position fixed
    right 6px
    bottom 8px
    cursor pointer
    -webkit-box-shadow: -3px 0 3px 0 rgba(0,0,0,0.1), 0 -3px 3px 0 rgba(0,0,0,0.1)
    box-shadow: -3px 0 3px 0 rgba(0,0,0,0.1), 0 -3px 3px 0 rgba(0,0,0,0.1)
    .tip
      position absolute
      top -5px
      right -5px
      width 17px
      height 17px
      border-radius 50%
      background-color $col94C
      z-index 99
      b
        position absolute
        width 100%
        height 100%
        font-size $fz13
        text-align center
        line-height 17px
        color #FFF
        &.move-top
          top -4px
    .chat
      position:relative
      float right
      width:65px
      height:45px
      background linear-gradient(142deg, #FFBE00 0%, #FF5D21 100%);
      border-radius 2px
      text-align center
      img
        width 22px
        height 20px
        margin-top 13px
      i
        position absolute
        top 44px
        left 25px
        display block
        border-width 8px
        border-style solid dashed dashed
        border-color  #FF5D21 transparent transparent
        font-size 0
        line-height 0
    p
      position relative
      overflow hidden
      z-index 10
      float left
      width 0px
      height 45px
      margin-right -2px
      line-height 45px
      background #FFF
      text-align center
      letter-spacing 0.29px
      transition width 0.3s
      -moz-transition width 0.3s /* Firefox 4 */
      -webkit-transition width 0.3s /* Safari 和 Chrome */
      -o-transition width 0.3s /* Opera */
      &.new
        width 145px
      span
        color #FFB422
</style>
