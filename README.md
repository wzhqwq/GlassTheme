# GlassTheme

Design elements library inspired from iOS 13.

**This project has been achieved(thrown away).**

It's my pleasure that this project is more powerful than I thought a year ago.
Successful projects like Vue.js and react have built enough powerful Component System, Renderer System, Data Binding and so on. So there's no need to finish their works again with my poor web technologies and useless perspectives.
I learned many web technologies during development. It's time to accept Vue.js and develop [FocusOI](https://github.com/wzhqwq/Focus-OI).

# Usage

## Color System

It has some basic colors which both fit in light style and dark style.

Add a dash before the name of color to make it recognized as a system color.

For example: '-red' will be changed into 'var(--red)';


## 接下来应如何架构

目前的想法是，支持HTML元素的名称绑定

然后以构造函数的方式建立js与元素的联系，同时也可以通过构造函数创建元素，目前将完全依赖id，toolbar组件未完全转化

凡是带有gt-前缀的均被记录，若构造函数有相同后缀名，则构建关联，然后就不能再关联了

~~什么辣鸡想法~~

## TODO（WFC)

整出来按钮、文本框（input和TextNode），并适配到toolbar上