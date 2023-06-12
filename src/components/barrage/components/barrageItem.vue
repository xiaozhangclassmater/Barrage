<template>
  <div class="barrage-item stop running" v-once :class="[options ? options.className : '']" :style="bindStyle"
    @click="handleClickBarrage(item.jumpUrl)" @animationend='destroyBarrageItem(item)'>
    <icon :options="options.children" v-if="options.children"></icon>
    {{ item.barrageContent }}
    {{ paused }}
  </div>
</template>

<script>
import icon from './icon.vue'
export default {
  props: {
    item: {
      type: Object,
      default: () => { }
    },
    options: {
      type: Object,
      default: () => ({})
    },
  },
  components: { icon },
  data() {
    return {
    }
  },
  methods: {
    destroyBarrageItem(item) {
      this.$emit('destory', this.item)
    },
    handleClickBarrage(href) {
      if (!href) return
      window.location.href = href
    },

  },
  computed: {
    bindBraageItemStyle() {
      const { speed, top, args } = this.item
      const { barrageCtnOffsetWidth } = args
      // console.info('play' , this.item)
      return {
        '--runTime': speed,
        // 动画需要的变量
        '--offsetWidth': '-' + barrageCtnOffsetWidth,
        top,
      }
    },
    bindStyle() {
      let { bindBraageItemStyle, item, options } = this
      return {
        ...bindBraageItemStyle,
        ...item.args.style,
        ...(options ? options.style : {}),
      }
    }
  }
}
</script>

<style lang="less" scoped>
.barrage-item {
  position: absolute;
  right: 0;
  height: 0.26rem;
  white-space: nowrap;
  line-height: 0.26rem;
  border-radius: 0.17rem;
  padding: 0 0.1rem;
  box-sizing: border-box;
  margin-top: 0.12rem;
  font-size: 0.12rem;
  color: #fff;
  letter-spacing: 0;
  font-weight: 400;
  animation: BraageRunningAnimation var(--runTime) linear;
}

// 普通弹幕
.default {
  color: #666666;
  background-color: rgba(221, 221, 221, .4);
}

// 普通运营样式
.ordinaryOperate {
  color: #FF7515;
  background-image: linear-gradient(95deg, rgba(255, 123, 32, .2) 0%, rgba(255, 217, 59, .2) 100%);
}

.stop {
  transform: translateX(110%)
}

@keyframes BraageRunningAnimation {
  0% {
    transform: translateX(110%)
  }

  100% {
    transform: translateX(var(--offsetWidth))
  }

}
</style>