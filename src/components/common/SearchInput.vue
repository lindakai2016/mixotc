<template>
  <div class="clearfix">
    <div class="search" v-clickoutside="hideSelect" @click="$refs.input.focus()" :class="{'search-active': showActive}">
      <input
        type="text"
        :style="{borderColor: color}"
        ref='input'
        v-model="inputContent"
        @keyup.enter="changeInputContent"
        @click="showResult = true"
        @focus="(showCancel = true) && (showActive = true)"
        @blur="showActive = false"
        @input="input"
      >
      <span ref='title' @click="showTitleItem">{{title}}</span>
      <ul class="clearfix search-title" v-show="showSelect">
        <li v-for="(item, index) of content" @click="changeTitle(item)" :key="index" :class="{ active: item.title === title}">{{item.title}}</li>
      </ul>
      <ul class="search-result" v-if="showResult && inputContent">
        <li v-if="!result.length">暂无搜索结果</li>
        <li v-for="(item, index) of result" :key="index" @click="selectInputContent(item)">{{item.name}}<i v-if="item.cname">（{{item.cname}}）</i></li>
      </ul>
      <img src="/static/images/cancel_icon.png" alt="" v-show="inputContent && showCancel" @click="inputContent = ''">
    </div>
    <button @click="changeInputContent" :style="{backgroundColor: color}" :class="{'btn-active': showActive}">
      <img src="/static/images/search_icon.png" alt="" class="search-icon">
    </button>
  </div>
</template>

<script>
export default {
  props: {
    //下拉框内容
    content: {
      type: Array,
      default: function() {
        return []
      }
    },
    result: {
      type: Array,
      default:  function() {
        return ['btc','ltc',59,"dd"]
      }
    },
    //显示标题
    title: {
      type: String,
      default: ''
    },
    //按钮颜色自定义
    color: String,
    //自定义事件
    emitValue1: String,//筛选项改变触发事件
    //筛选内容改变触发事件
    emitValue2: {
      type:String,
      default: 'changeInputContent'
    },
    emitValue3: {
      type:String,
      default: 'input'
    }
  },
  data() {
    return {
      type: '',
      showSelect: false,
      inputContent: '',
      showResult: false,
      showCancel: false,
      showActive: false
    }
  },
  methods: {
    input() {
      this.type === '' && (this.type = this.content[0].type);
      this.Bus.$emit(this.emitValue3, {type:this.type, data: this.inputContent});
    },
    showTitleItem() {
      this.showSelect = !this.showSelect;
      this.showResult = false;
    },
    changeTitle(item) {
      this.showSelect = false;
      this.Bus.$emit(this.emitValue1, item.title);
      this.type = item.type;
    },
    changeInputContent() {
      this.hideSelect();
      this.type === '' && (this.type = this.content[0].type);
      this.showResult = false;
      this.Bus.$emit(this.emitValue2, {type: this.type, data: this.inputContent});
    },
    selectInputContent(item) {
      this.inputContent = item.name;
      this.changeInputContent();
    },
    hideSelect() {
      this.showResult = false
      this.showCancel = false;
      if(!this.showSelect) return;
      this.showSelect = false;
    }
  },
  watch:{
    // title(newValue,oldValue) {
    //   setTimeout(()=>{
    //     this.$refs.input.style.paddingLeft = this.$refs.title.clientWidth + 26 + 'px';
    //   },0)
    // }
  }
};
</script>

<style scoped lang="stylus">
@import '../../stylus/base.styl'
.search
  float left
  position relative
  height 30px
  input
    box-sizing()
    position relative
    width 384px
    height 30px
    padding-left 150px
    padding-right 25px
    background $colFFF
    border 1px solid #E1E1E1
    /*border 1px solid $col422*/
    border-radius 2px 0 0 0
    &:focus
      outline 0
  span
    position absolute
    top 0
    left 0
    width 115px
    height 28px
    padding-left 10px
    padding-right 15px
    line-height 28px
    font-size 13px
    color #999
    letter-spacing 0
    border 1px solid #E1E1E1
    background #F4F6FA
    cursor pointer
    &::after
      position absolute
      top 13px
      right 5px
      content ''
      triangle_down(#999)
  ul
    box-sizing()
    position absolute
    left 0px
    top 30px
    width 456px
    font-size $fz13
    color $col333
    letter-spacing 0.27px
    border 1px solid #E1E1E1
    z-index 9
    li
      box-sizing()
      float left
      width 100%
      height 30px
      padding 0 10px
      line-height 30px
      background-color #FFF
      cursor pointer
      &:hover, &.active
        background-color $col3EB
  .search-title
    width 142px
  img
    position absolute
    top 10px
    right 10px
    cursor pointer

button
  position relative
  width 72px
  height 30px
  margin-right 125px
  background #E1E1E1
  border-radius 0 2px 2px 0
  border 0
  cursor pointer
  &:hover
    background $col422
  .search-icon
    display block
    position absolute
    top 50%
    left 50%
    margin -8px 0 0 -8px
    width 16px
    height 16px

.search-active
  input
    box-sizing()
    border 1px solid $col422
  span
    border 1px solid $col422

.btn-active
  background $col422
  &:hover
    background $col350


</style>
