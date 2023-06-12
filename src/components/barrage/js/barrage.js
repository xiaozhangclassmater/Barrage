
export class Barrage {
  constructor(obj) {
    const { barrageId, speed, level, top, jumpUrl, barrageContent, animationPlayState, ...args } = obj
    this.barrageId = barrageId;
    this.speed = speed;
    this.level = level;
    this.top = top;
    this.jumpUrl = jumpUrl;
    this.barrageContent = barrageContent;
    this.animationPlayState = ''; // 设计弹幕 是否可 点击暂停功能
    this.color = '#FFF'
    this.args = args
  }
}

/**
* 弹幕类的设计 
*   -- 参数设计
*      id ： 每条弹幕的唯一id
*      speed ： 弹幕运行的速度，由外界控制 
*      level ： 弹幕的层级 --> 弹幕可分为设计可分为 上下 1 , 1 两个层级 ，可决定弹幕的显示是全屏还是半屏显示
*      top ：弹幕生成的位置相对于 level 的层级 决定 ，相对于 Level 层级 盒子距离顶部的位置
*      href ：点击弹幕需要跳转的链接
*      barrageContent ： 弹幕的内容
*      animationPlayState : 弹幕的 运行的生命周期状态 初始值为 pedding -> index > end  
*      color ：弹幕的颜色 
*         
*/