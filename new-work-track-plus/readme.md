##### 说明
“工作轨迹plus”二开控件

##### 注意事项
* 1.需在二开控件开发项目环境的package.json中添加如下依赖
``` json
// package.json
{
    "dependencies": {
        "jquery": "^3.1.1",
        "lodash": "^4.17.15"
    } 
}
```


##### 新工作轨迹plus

使用说明：
1、编译打包该二开控件
2、IDE注册二开控件，如‘newworktrackplus’
3、定义如下‘自定义属性’：
 1）工作轨迹-数据上报 - getworktrackdata
 2）工作轨迹-轨迹分析 - getworktrackanalyze
 3）工作轨迹-拜访对比 - getcomparedata
 4）工作时间轴 - worktrackdetail
 5）配置图标 - configmapicon
 6）是否显示负责客户 - isshowcustomer
 7) 是否显示拜访对比 - isshowcustomer
4、创建新工作轨迹表单，引入二开控件，配置事件，绑定数据
 - 参考测试环境（V8.5.1-base租户）表单 - 工作轨迹plus-新 （1265845985695895651）