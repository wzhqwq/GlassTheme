/*
场景：toolbar group的弹出（原地，blur）
    数据点预览（居中，replace，menu）


分为原地弹出和居中弹出
需要传入：原元素(需要确定长宽)，弹出元素(需要确定宽和最大长度)，replace（当居中弹出时有效），blur
可传入menu
居中弹出：setRangeElement(DOM)

请确保弹出元素比原元素大以挡住原元素
按照blur设定fix2样式
弹出元素转入fix2
fix1在2之上


pop周期：
mouseover引发计时100（mousemove重启计时）
计时结束开始蓄力（pop框设置accumulate），计时500（mousemove终止过程）
计时结束将原元素转入fix1
    若replace为true，fix1变大并消失，fix2扩展并出现
    若false，fix1挪向指定位置，fix2扩展并出现
*/
class PopControl {
  
}