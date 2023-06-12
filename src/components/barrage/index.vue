<template>
  <div class="barrage">
    <div class="barrage-container" ref="barrageContainer">
      <div class="barrage-half-screen" ref="halfScreenContainer">
        <template v-for="item in barrageFiltering.level1">
          <barrage-item 
            :item="item" :class="{pausedAnimation : paused }" 
            :options='barrageTypeCallback(item)' 
            @destory="destoryBraageItem" :key="item.barrageId">
          </barrage-item>
        </template>
      </div>
      <div class="barrage-full-screen" v-if="fullScreen">
        <template v-for="item in barrageFiltering.level2">
          <barrage-item 
            :item="item" :class="{pausedAnimation : paused }"
            :options='barrageTypeCallback(item)'
            @destory="destoryBraageItem" :key="item.barrageId">
          </barrage-item>
        </template>
      </div>
    </div>
    <user-input ref="publishBarrage" v-if="openPublishBarrage" @onBlur="handleBlur">
      <template #user-operatio-right>
        <div class="send" @click="sendBarrage($event)">
          <slot name="rightRegion"></slot>
        </div>
      </template>
    </user-input>
  </div>
</template>
<script>
import { BarrageManager } from "./class/index.js";
import BarrageItem from "./components/barrageItem.vue";
import userInput from "./components/userInput.vue";
import { barrageLevel, sessionStorageField } from "./constant/index.js";
export default {
  components: { BarrageItem, userInput},
  props: {
    // 弹幕数组
    barrages: {
      type: Array,
      default: [],
      required: true
    },
    // 弹幕的弹道 ，可使每条弹幕在对应的弹道中 不重复 叠加（相当于你的弹幕盒子高度计算）
    rows: {
      type: Number,
      default: 6
    },
    // 你是否需要全屏弹幕
    fullScreen: {
      type: Boolean,
      default: false
    },
    //你希望弹幕需要多少秒滚动一屏,弹幕文组滑过容器的时间
    delay: {
      type: Number,
      default: 8
    },
    // 你希望每多少秒创建一次弹幕
    createTime: {
      type: Number,
      default: 3
    },
    // 开启发布弹幕 ， 如果为 true 显示 userPublishBarrage.vue ， 否则不显示
    openPublishBarrage: {
      type: Boolean,
      default: false
    },
    // 弹幕开关
    barrageSwitch: {
      type: Boolean,
      default: false
    },
    // 发布弹幕的字数控制
    barrageLen: {
      type: Number,
      default: 20
    },
    resetBarrage: {
      type: Boolean,
      default: false
    },
    // 用户自己发布的弹幕的样式,可配置
    style: {
      type: Object,
      default: () => ({
        border: "0.005rem solid rgba(255,117,21,1)"
      })
    },
    // 用户发布弹幕的类型
    userBarrageType : {
      type : String,
      default : ''
    },
    barrageTypeCallback : {
      type : Function,
    },
    // 是否暂停弹幕
    isPaused : {
      type : Boolean,
      default : false
    }
  },
  created () {
    this.barrageManager = new BarrageManager(this)
  },
  mounted() {
    // 初始化弹幕渲染数据
    this.initBarrageRenderData();
  },
  data() {
    return {
      barrageManager : null,
      isClickSend: false,
      paused : false
    };
  },
  methods: {
    initBarrageRenderData() {
      console.info("this.barrages", this.barrages);
      this.barrageManager.open(this.barrages);
    },
    /**
     * @params
     * i : 创建的索引号 ， 根据i 决定弹幕生成在哪个弹道
     * herf ： 弹幕跳转的链接
     * barrageId ： 弹幕id
     * barrageContent ： 弹幕内容
     * @description 该方法用于创建弹幕对象数据
     */
    crearteBarrageObject({
      row,
      jumpUrl = "",
      barrageId,
      barrageContent,
      ...args
    }) {
      let speed = this.cacheSpeed;
      let top = (row * this.byTrajetoryCalcHeight) / 100 + "rem";
      let level = this.fullScreen ? Math.floor(Math.random() * 2) + 1 : 1; // 优化调用
      return { 
        top, level, speed, jumpUrl,
        barrageId, barrageContent,
        barrageCtnOffsetWidth : this.getBarrageCtnOffsetWidth,
        ...args
      };
    },
    // 性能优化 ，批量删除dom
    destoryBraageItem({ barrageId, args }) {
      if (!args.type) return this.barrageManager.addBatchRemoveId(barrageId);
      this.barrageManager.removeBarrage(barrageId);
    },
    handleBlur(barrageContent) {
      // 优化用户体验问题 获取失去焦点 有内容 但未发布 下一次弹起输入框应该是 上一次输入的值
      if (!this.isClickSend && barrageContent) {
        sessionStorage.setItem(
          sessionStorageField.BARRAGECONTENT,
          barrageContent
        );
      }
      this.$emit("onBlur");
    },
    sendBarrage(event) {
      this.isClickSend = !this.isClickSend;
      // 点击发送的时候获取发布弹幕组件的弹幕内容
      let barrageContent = this.$refs.publishBarrage.barrageContent;

      let valistate = this.validateBarrageContent(event, barrageContent);

      if (!valistate) return;

      this.$emit("send", barrageContent);

      this.addBarrage(barrageContent);

      // 发布成功后 清除掉session 中的缓存字段数据 并且重置 发布按钮状态
      this.clearSessionStorageField([sessionStorageField.BARRAGECONTENT]);

      // 发布成功后清空 输入框的值
      this.$refs.publishBarrage.barrageContent = "";

      this.isClickSend = !this.isClickSend;
    },
    validateBarrageContent(event, barrageContent) {
      // 空值校验
      if (!barrageContent) {
        Toast.text("请输入弹幕内容", { duration: 1500 });
        event.preventDefault();
        return false;
      }
      if (barrageContent.trim().length > this.barrageLen) {
        Toast.text('最多输入undefined字');
        return false;
      }
      return true;
    },
    addBarrage(barrageContent) {
      // 获取当前 定时器正在创建的 一行
      let currentRow = this.barrageManager.getRow();
      let row = currentRow === this.rows / 2 ? 0 : currentRow + 1;
      if (row === this.rows / 2) {
        row = 0;
      }
      let myBarrage = {
        row,
        barrageId: '1686292223004',
        barrageContent,
        style: this.style,
        type: "mySelf", // 用户自己发布的弹幕类型
        barrageCategory: this.userBarrageType
      };
      
      const item = this.crearteBarrageObject(myBarrage);

      this.barrageManager.addBarrage(item);

      console.info("发送成功")

      this.barrageManager.setRow(row + 1);
    },
    clearSessionStorageField(fields = []) {
      if (fields.length === 0) return;
      if (Array.isArray(fields) && fields.length > 0) {
        fields.forEach(field => sessionStorage.removeItem(field));
      }
    },
  },
  computed: {
    barrageFiltering() {
      return {
        level1:
          this.barrageManager.barrages.filter(
            item => item.level === barrageLevel.LEVEL1
          ) || [],
        level2:
          this.barrageManager.barrages.filter(
            item => item.level === barrageLevel.LEVEL2
          ) || []
      };
    },
    cacheSpeed() {
      return 'undefineds';
    },
    // 获取弹幕容器高度
    getBarrageContainerClientHeight() {
      return this.$refs.barrageContainer.clientHeight;
    },
    // 获取容器的宽度
    getBarrageCtnOffsetWidth () {
      return (this.$refs.barrageContainer.offsetWidth / 100) + 'rem'
    },
    // 根据弹道数量 计算弹道高度
    byTrajetoryCalcHeight() {
      let barrageContainerClientHeight = this.getBarrageContainerClientHeight;
      let barrageClientHeight = this.fullScreen ? barrageContainerClientHeight : barrageContainerClientHeight / 2;
      // 根据是否需要全屏 计算弹道高度  ， 如果是全屏弹幕，那就是整个弹幕容器高度，否则则是弹幕容器的一半高度
      return parseInt(
        barrageClientHeight / (this.fullScreen ? this.rows : this.rows / 2)
      );
    }
  },
  watch: {
    // 弹幕开关 状态监听
    barrageSwitch: {
      handler(newBarrageSwitch) {
       
        // 当弹幕开启时，需要开启定时器生成弹幕
        if (newBarrageSwitch) {
          //确保弹幕存储栈是干净的
          this.barrageManager.removeAllBarrage();
          this.barrageManager.open();
        } else {
          // 关闭弹幕时
          this.barrageManager.barrages.length > 0 && this.barrageManager.close();
        }
      }
    },
    // 重置弹幕
    resetBarrage: {
      async handler(newResetBarrage) {
        console.info('newResetBarrage' , newResetBarrage)
        if (!newResetBarrage) return;
        await this.barrageManager.close();
        this.barrageManager.open(this.barrages);
      }
    },
    isPaused : {
      handler (newVal){
        if(newVal){
          this.paused = newVal
          this.barrageManager.pausedAnimation()
        }else{
          this.paused = newVal
          this.barrageManager.continueAnimation()
        }
        
      }
    }
  },
  destroyed() {
    this.barrageManager.close();
    this.clearSessionStorageField([sessionStorageField.BARRAGECONTENT]);
  }
};
</script>

<style lang="less" scoped>
.barrage {
  height: 100%;
  width: 100%;
  .barrage-container {
    position: relative;
    height: 100%;
    width: 100%;
    user-select: none;
    padding: 0.1rem 0rem;
    box-sizing: border-box;
    overflow: hidden;
    .barrage-half-screen,
    .barrage-full-screen {
      position: relative;
      // padding: 0.1rem 0.05rem;
      height: 50%;
      box-sizing: border-box;
      .pausedAnimation{
        animation-play-state: paused !important;
      }
    }
  }
  .send {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 0.4rem;
    height: 100%;
    margin-left: 0.14rem;
  }
}
</style>