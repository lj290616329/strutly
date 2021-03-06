const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../config/api.js');
var that;
Page({
  data: {
    index:0,
    endline:false,
    datas:[],
    num:app.globalData.num,
    black:[],
    uid:wx.getStorageSync('uid'),
    confirmMsg:"确认将Ta关进小黑屋7天吗?",
    isIphoneX:wx.getStorageSync('isIphoneX')
  },  
  onLoad: function (options) {
    that = this;
    that.setData({
      options:options,
      datas:[],
      endline:false
    })
    that.listRecord(0);
  },
  onShow: function () {
    console.log("onshow")
    if(app.globalData.indexRefresh){ 
      app.globalData.indexRefresh = false;
      util.request(api.Black,{},"get").then(res=>{
        console.log(res);
        that.setData({
          black:res.data
        })
      }).catch(err=>{
        console.log(err);
      })
    }
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      that.getTabBar().setData({
        selected: 0
      })
    }
  },

  onReady(){
    let syncTime = wx.getStorageSync('syncTime')||new Date().getTime();
    let time = new Date().getTime();
    let ifAuth = wx.getStorageSync('ifAuth')||false;
    /**小小的同步一下用户数据吧!*/
    if(ifAuth && syncTime <= time){
      util.getUserInfo().then(user=>{
        console.log(user)
        util.request(api.MyInfo,user.userInfo,"POST").then(res=>{
          if(res.code==0){
            wx.setStorageSync('syncTime', time + 7*24*60*60);
          }
        })
      })
    }    
  },
  home(e){
    let ifAuth = wx.getStorageSync('ifAuth')||false;
    if(ifAuth){
      let uid = e.currentTarget.dataset.uid;
      let id = wx.getStorageSync('uid');
      if(uid != id){
        wx.navigateTo({
          url: "/pages/index/you?uid="+uid,
        })
      }else{
        wx.switchTab({
          url: '/pages/index/my',
        })
      }      
    }else{
      that.setData({
        auth:true,
        callBack:function(){
          that.home(e)
        }
      })
    }    
  },
  black(datas){
    let black = that.data.black;
    datas = datas.filter(item => black.indexOf(item.miniUser.id)<0)
    that.setData({
      datas:datas
    })
  },
  listRecord(pageNo){
    let datas = that.data.datas;    
    util.request(api.Record,{pageNo:pageNo},"GET").then((res) => {
      if((pageNo==0)&&(res.data==null || res.data.length==0)){
        that.setData({
          noData:true,
        })
      }else if((pageNo!=0)&&(res.data==null || res.data.length==0)){
          that.setData({
            endline:true
          })
      }else{        
        that.setData({
          pageNo:pageNo          
        })
        that.black(datas.concat(res.data))
      }
    }).catch(err=>{
      that.setData({
        prompt:true,
        promptMsg:err.msg
      })
    })
  },
  push(){
    let ifAuth = wx.getStorageSync('ifAuth')||false;
    if(ifAuth){
      wx.navigateTo({
        url: '/pages/index/form',
      })
    }else{
      that.setData({
        auth:true,
        callBack:function(){
          that.push()
        }
      })
    }    
  },
  cancle(){
    that.setData({
      auth:false
    })
  },
  auth(e){
    console.log(3);
    wx.showLoading({
      mask:true,
      title: '授权中~~',
    })
    if (e.detail.errMsg !== 'getUserInfo:ok') {
      wx.hideLoading();
      if (e.detail.errMsg === 'getUserInfo:fail auth deny') {
        util.warn(that,"授权失败");
        return false;
      }
      return false;
    };
    util.auth().then(res=>{
      that.setData({
        auth:false
      })
      that.data.callBack(); 
    }).catch(err=>{
      util.warn(that,err.msg);
    })      
  },  
  refresh(){
    that.setData({
      prompt:false
    });
    that.onLoad(that.data.options)
  },
  onPullDownRefresh:function(){
    wx.showNavigationBarLoading() //在标题栏中显示加载
    //模拟加载

    setTimeout(function(){
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      that.reLoad();
    },1500);
  },
  onReachBottom(){
    let endline = that.data.endline;
    if(!endline){
      let pageNo = that.data.pageNo + 1;
      that.listRecord(pageNo);
    }    
  },
  confirm(e){
    console.log(e);
    let ifAuth = wx.getStorageSync('ifAuth')||false;
    let black = that.data.black;
    if(ifAuth){
      that.setData({
        confirm:true
      })
      that.yes =()=>{
        let uid = e.currentTarget.dataset.uid;
        util.request(api.Black+"/"+uid,{},"POST").then(res=>{
          console.log(res);
          black.push(uid);
          that.setData({
            confirm:false,
            black:black
          })
          that.black(that.data.datas);
        }).catch(err=>{
          console.log("添加黑名单失败")
        })      
      }
      that.no =()=>{
        that.setData({
          confirm:false
        })
      }
    }else{
      that.setData({
        auth:true,
        callBack:function(){
          that.confirm(e)
        }
      })
    }
  },
  onShareAppMessage: function (res) {
    return {
      title: 'Baby-Record',
      path: '/pages/index/index'
    }
  },
  onShareTimeline:function(res){
    return {
      title: 'Baby-Record',
      path: '/pages/index/index'
    }
  }
})
