import { deleteQuantity } from "../constant";
import { Barrage } from "./barrage";
// 弹幕管理 实体类
export class BarrageManager {
  constructor(barrageVue) {
    this.barrages = []; // 填弹幕的数组
    this.barragesIds = [] // 批量删除弹幕的数组id
    this.sourceBarrages = [] // 源弹幕数据
    this.timer = null //控制弹幕的开启和关
    this.barrageVue = barrageVue // 弹幕组件实例
    this.deleteCount = 0, // 销毁弹幕的总数
      this.lastDeleteCount = 0, // 最后可销毁的数量
      this.row = 0,
      this.count = 0
  }
  /**
   * 
   * @param {*} obj  合并完整的的弹幕对象
   * @param  {...any} args 开发者以后可能需要传递的剩余参数
   */
  addBarrage(obj, ...args) {
    const barrage = new Barrage(obj, ...args)
    this.barrages.push(barrage)
  }
  /**
   * 
   * @param {*} barrageId  // 入参 弹幕id
   * @returns 无返回值
   * @description 添加需要批量删除的 id 到 批量删除的栈中 barragesIds
   */
  addBatchRemoveId(barrageId) {
    this.barragesIds.push(barrageId)
    this.batchRemoveHandle()
  }
  /**
   * 
   * @param {*} start  你需要从第几位开始删除
   * @param {*} deleteCount  // 删除的总数是多少个
   * @returns 无返回值
   */
  batchRemoveBarrage(start, deleteCount) {
    if (this.barrages.length === 0) return
    this.barrages.splice(start, deleteCount)
  }
  batchRemoveId(start, deleteCount) {
    if (this.barragesIds.length === 0) return
    this.barragesIds.splice(start, deleteCount)
  }
  /**
   * @param {*} barrageId  弹幕 id 针对单个删除弹幕时 使用 
   */
  removeBarrage(barrageId) {
    let index = this.barrages.findIndex(item => item.barrageId === barrageId)
    this.barrages.splice(index, 1)
  }
  /**
   * @description 删除全部的弹幕数据
   */
  removeAllBarrage() {
    this.barrages = []
  }
  // 批量移除逻辑处理
  batchRemoveHandle() {
    if (this.deleteCount === 0 || this.deleteCount === 0) {
      if (this.barragesIds.length === this.lastDeleteCount) {
        this.batchRemoveBarrage(0, this.lastDeleteCount)
        this.batchRemoveId(0, this.lastDeleteCount)
      }
    } else {
      if (this.barragesIds.length === deleteQuantity.FIFTY) {
        this.batchRemoveBarrage(0, deleteQuantity.FIFTY)
        this.batchRemoveId(0, deleteQuantity.FIFTY)
        this.deleteCount--
      }
    }
  }
  init(barrages) {
    this.sourceBarrages = barrages
    this.deleteCount = parseInt(this.sourceBarrages.length / deleteQuantity.FIFTY) // 计算可删除数量 
    this.lastDeleteCount = this.sourceBarrages.length % deleteQuantity.FIFTY // 计算 最后一次可删除数量
  }
  /**
   * 
   * @param {*} barrages 接收一个弹幕数组数据 
   * @description 循环创建 弹幕对象 ，将后台数据与 创建弹幕的属性结合 存入弹幕数组
   */
  loopCreateBarrage(barrages) {
    const { rows, createTime, crearteBarrageObject } = this.barrageVue
    // 判断后台弹幕数据 是否大于 用户传入的 创建数量 如果 大于 就取 用户传入的 否则循环 真实数据长度
    let maxRows = rows / 2 // 最大的弹幕行数
    this.timer = setInterval(() => {
      for (let i = 0; i < 1; i++) {
        let barrageItem = barrages[this.count]
        if (this.row >= maxRows) { this.row = 0 } // 如果当前已经到了 最大的弹幕行数临界点则 回到第0 行弹道继续 创建
        if (!barrageItem) return clearInterval(this.timer) // 如果取不到了则证明没数据了 ， 结束弹幕展示
        const item = crearteBarrageObject({ row: this.row, ...barrageItem }) // 添加对象到 弹幕数组中
        this.addBarrage(item)
        this.count++ // 用于取值 ,取了多少条
        this.row++ // 用于弹道
      }
    }, createTime * 1000);
  }
  getRow() {
    return this.row
  }
  setRow(row) {
    this.row = row
  }
  /**
   * @param {*} barrages 传入一个弹幕数组数据 
   * @returns 无返回值
   * @description 调用 该方法 开始播放弹幕
   */
  open(barrages) {
    if (barrages.length === 0) return
    this.init(barrages)
    this.loopCreateBarrage(this.sourceBarrages)
  }
  // 继续运行
  continueAnimation() {
    this.loopCreateBarrage(this.sourceBarrages)
  }
  // 暂停动画
  pausedAnimation() {
    clearInterval(this.timer)
  }
  /**
   * @return 无返回值 
   * @description 调用close 方法 关闭弹幕
   */
  close() {
    clearInterval(this.timer)
    this.removeAllBarrage()
  }
}
