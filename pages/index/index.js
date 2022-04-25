/*  
                   _     _                 __                                    
                  | |   (_)               / _|                                   
 _ __ ___    __ _ | | __ _  _ __    __ _ | |_  _   _  _ __     __  __ _   _  ____
| '_ ` _ \  / _` || |/ /| || '_ \  / _` ||  _|| | | || '_ \    \ \/ /| | | ||_  /
| | | | | || (_| ||   < | || | | || (_| || |  | |_| || | | | _  >  < | |_| | / / 
|_| |_| |_| \__,_||_|\_\|_||_| |_| \__, ||_|   \__,_||_| |_|(_)/_/\_\ \__, |/___|
                                    __/ |                              __/ |     
                                   |___/                              |___/      
*/
//index.js
import mqtt from './../../utils/mqtt.js';
import * as echarts from '../../ec-canvas/echarts';

//获取应用实例
const app = getApp();
let chart = null;
Page({
  data: {
    client: null,
    topic: {
      LEDcontrolTopic: 'TOPIC1',
      lastwillTopic:'TOPIC2',
      H_Ttopic: 'TOPIC3',
    },
    value: {
      HumdValue: 0,
      TempValue: 0,
    },
    LEDValue: [{
      LEDlogo: './../images/LED_gray.png',
      ButtonValue: '开灯',
      ButtonFlag: true,
    }],
    esp8266:{
      state:'状态：离线',
      flag: false,
    }  ,    
    ec: {
      onInit: initChart,
    },
    timer: '',//定时器名字
  },
  onShareAppMessage: function (res) {
    return {
      title: 'esp8266设备控制',
      path: '/pages/index/index',
      success: function () {
        if(res.errMsg == 'shareAppMessage:ok'){
        　　　　　　}
       },
      fail: function () {
        // 转发失败之后的回调
　　　　　　if(res.errMsg == 'shareAppMessage:fail cancel'){
  　　　　　　　　// 用户取消转发
  　　　　　　}else if(res.errMsg == 'shareAppMessage:fail'){
  　　　　　　　　// 转发失败，其中 detail message 为详细失败信息
  　　　　　　}
       }
    }
  },

  onLoad: function() {
    var that = this;
    this.data.client = app.globalData.client;

    // console.log("on load");

    that.data.client.on('connect', that.ConnectCallback);
    that.data.client.on("message", that.MessageProcess);
    that.data.client.on("error", that.ConnectError);
    that.data.client.on("reconnect", that.ClientReconnect);
    that.data.client.on("offline", that.ClientOffline);
     //什么时候触发倒计时，就在什么地方调用这个函数
     this.countDown();
  },

  onShow: function() {
    // console.log("on show");
  },

  onHide: function() {
    console.log("on hide");
  },

  onUnload: function() {
    console.log("on unload");
    var that = this;
    //因为timer是存在data里面的，所以在关掉时，也要在data里取出后再关闭
    clearInterval(that.data.timer); 
    that.data.client.end();
  },

  LedControl: function(e) {
    var that = this;
    if(that.data.esp8266.flag){
      if (that.data.LEDValue[0].ButtonFlag) {
          that.setData({
            'LEDValue[0].ButtonValue': '关灯',
            'LEDValue[0].ButtonFlag': false,
            "LEDValue[0].LEDlogo": './../images/LED_red.png',
          })
        that.data.client.publish(that.data.topic.LEDcontrolTopic, "1",{
          qos: 1
        });
      } else {
            that.setData({
              'LEDValue[0].ButtonValue': '开灯',
              'LEDValue[0].ButtonFlag': true,
              "LEDValue[0].LEDlogo": './../images/LED_gray.png',
            })
        that.data.client.publish(that.data.topic.LEDcontrolTopic, "0",{
          qos: 1
        });
      }
    }else{
      wx.showToast({
        title: '设备未连接......',
        icon: 'none',
        duration: 2000//持续的时间
      })
    }
  },

  MessageProcess: function(topic, payload) {
    var that = this;
    if (topic == that.data.topic.H_Ttopic) {
      var obj = JSON.parse(payload);
      that.setData({
        'value.TempValue': parseFloat(obj.temp)
      });
      that.setData({
        'value.HumdValue': parseFloat(obj.humi)
      });
      that.setData({
        'esp8266.state': '状态：在线',
        'esp8266.flag': true,
      });
    }else if(topic == that.data.topic.lastwillTopic){
      that.setData({
        'esp8266.state': '状态：离线',
        'esp8266.flag': false,
      });
      
    }
  },

  ConnectCallback: function(connack) {
    var that = this;
    // console.log("connect callback ");
    for (var v in that.data.topic) {
      that.data.client.subscribe(that.data.topic[v], {
        qos: 1
      });
    }
  },

  ConnectError: function(error) {
    console.log(error)
  },

  ClientReconnect: function() {
    console.log("Client Reconnect")
  },

  ClientOffline: function() {
    console.log("Client Offline")
  },

  countDown: function () {
    let that = this;
    that.setData({
      timer: setInterval(function () {
        that.refreshData (that.data.value.TempValue,that.data.value.HumdValue)
      }, 1000)
    })
  },

  refreshData:function (data0,data1){
    //刷新数据
      var axisData = (new Date()).toLocaleTimeString().replace(/^\D*/, '');//正则表达式/^\D*/，表示匹配一个非数字字符
      //console.log(axisData);
      let option = chart.getOption();
      // option.series[0].data[6] = data0;
      // option.series[1].data[6] = data1;
      option.series[0].data.shift();
			option.series[0].data.push(data0);
			option.series[1].data.shift();
      option.series[1].data.push(data1);
      option.xAxis[0].data.shift();
			option.xAxis[0].data.push(axisData);
      chart.setOption(option);    
      },

  onReady() {
  }
})
function initChart(canvas, width, height, dpr) {
    chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);
  var colors = ['#4c0009','#012ea5'];
  var option = {//https://echarts.apache.org/zh/option.html#legend
    title: {
      text: '当前温湿度',
      textStyle:{
        color:'#82d8cf',
        fontStyle: ''//normal oblique italic
      } ,
      left: 'center',
      top: 'top',
      // backgroundColor: '#4c0009'
    },
    legend: {
      data: ['温度', '湿度'],
      top: 30,
      left: 'center',
      // backgroundColor: 'blue',
      z: 100
    },
    grid: {
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: 'axis',
      backgroundColor: '',
      textStyle:{
        fontStyle:'oblique'
      } 
    },
    // toolbox:{
    //   show:true,
    //   name:'chart',
    //   title: '保存为图片',
    //   right:50,
    //   feature:{
    //     saveAsImage:{
    //       show:true,
    //       excludeComponents:["toolbox"],
    //       pixelRatio:1,
    //       type: 'jpeg'
    //     }
    //   }
    // },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      data: [0, 0, 0, 0, 0, 0, 0],
      nameGap: 60,
      nameRotate: 80,
      name: '时间',
      nameLocation: 'start',
      nameTextStyle:{
        color:'#01847f',
        align:'right',
        verticalAlign:'top',
        fontWeight :'bolder'//lighter
      },
      axisLabel: {  //因为日期太长，显示不全，于是让横坐标斜着显示出来
        interval:0, 
        color:'#01847f',
        rotate:80  
     },
      //  show: false
    },
  //   {
  //     type: 'category',
  //     position: 'top',
  //     offset: 25,
  //     axisPointer: {
  //         type: 'none'
  //     },
  //     axisTick:{
  //         show: false
  //     },
  //     axisLine:{
  //         show: true
  //     },
  //     data: [0, 0, 0, 0, 0, 0, 0]
  // }
  ],
    yAxis: [{
      x: 'center',
      position: 'right',
      type: 'value',
      name: '湿度',
      nameGap: 20,
      nameTextStyle:{
        color:'#012ea5',
        fontWeight :'bolder',
        align:'left',
        verticalAlign:'top',
      },
      min: 0,
      max: 100,
      splitLine: {
        lineStyle: {
          type: 'dotted', //dashed
          color: colors[1]
        },
      },
      axisLabel: {
        color:'#012ea5',
        formatter: '{value} %'
      }
      // show: false
    },
    {
      type: 'value',
      name: '温度',
      nameGap: 20,
      position: 'left',
      nameTextStyle:{
        color:'#4c0009',
        fontWeight :'bolder',
        align:'right',
        verticalAlign:'top',
      },
      min: -20,
      max: 50,
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: colors[0]
        }
      },
      axisLabel: {
        color:'#4c0009',
        formatter: '{value} °C'
      }
    }
  ],
    series: [{
      name: '湿度',
      type: 'line',
      smooth: true,
      colorBy:'data',
      yAxisIndex: 1,//对应标签yAxis中的第二个数据
      itemStyle:{
        color:'#4c0009'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 0.9,
          colorStops: [{
            offset: 0, color: 'rgba(76,0,9, 1)'    // 0% 处的颜色
          }, {
            offset: 1, color: 'rgba(76,0,9, 0.1)' //   100% 处的颜色
          }],
          global: false // 缺省为 false
        }
      },
      data: [0, 0, 0, 0, 0, 0, 0]
    }, {
      name: '温度',
      type: 'line',
      smooth: true,
      yAxisIndex: 0,//对应标签yAxis中的第一个数据
      itemStyle:{
        color:'#012ea5'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(0,47,167, 1)'    // 0% 处的颜色
          }, {
            offset: 1, color: 'rgba(0,47,167, 0.1)' //   100% 处的颜色
          }],
          global: false // 缺省为 false
        }
      },
      data: [0, 0, 0, 0, 0, 0, 0]
    }]
  };
  chart.setOption(option);
  return chart;
}


