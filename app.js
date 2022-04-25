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
//app.js
import mqtt from './utils/mqtt.js';

const host = '百度天工地址';//
const options = {
  protocolVersion: 4, //MQTT连接协议版本
  clientId: randomString(10),
  clean: true,
  username: '用户名',
  password: '密钥',
  //
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  resubscribe: true
};

App({
  onLaunch: function() {

  },

  globalData: {
    client_ID: randomString(10),
    client: mqtt.connect(host, options),
  },
})

function randomString(len) {
  len = len || 32;
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  var maxPos = $chars.length;
  var pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}