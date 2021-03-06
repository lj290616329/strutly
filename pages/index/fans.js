const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../config/api.js');
var that;
Page({
  data:{
    noDataMsg:'还没人关注你,赶快去主页逛逛吧!',
    noDataTo:'/pages/index/index',
    noDataBtn:'去主页看看'
  },
  onLoad(options){
    that = this;
    that.setData({
      options:options
    })
    util.request(api.Fans,{},"GET").then(res=>{
      if(res.data.fans.length>0){
        that.setData({
          fans:res.data.fans,
          follows:res.data.toids
        })
      }else{
        that.setData({
          noData:true          
        })
      }  
    })
  },
  follow(e){
    let uid = e.currentTarget.dataset.uid;
    let index = e.currentTarget.dataset.index;
    util.request(api.Fans,{oid:uid},"POST").then(res=>{
      if(res.code==0){
        let follows = that.data.follows;
        if(follows.indexOf(uid)>-1){
          follows.splice(follows.findIndex(item => item === index), 1);
        }else{
          follows.push(uid);
        }        
        that.setData({
          follows:follows
        })
      }
      console.log(res)
    })
  }
})