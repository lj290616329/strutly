var that;
const app = getApp();
const api = require("../../config/api");
const util = require("../../utils/util");
Page({
  data:{
    lists:[],
    noDataMsg:"您还为评论任何人哦!去主页看看吧!",
    noDataBtn:"主页",
    noDataTo:"/pages/index/index",
    confirm:false,
    confirmMsg:"确认删除这条评论吗?"
  },
  onLoad(){
    that = this;
    that.pageComment(0);
  },
  pageComment(pageNo){
    let lists = that.data.lists;
    util.request(api.Comment,{pageNo:pageNo},"GET").then((res) => {
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
          pageNo:pageNo,
          lists:lists.concat(res.data)
        })
      }
    }).catch(err=>{
      that.setData({
        prompt:true,
        promptMsg:err.msg
      })
    })
  },
  onReachBottom(){
    let endline = that.data.endline;
    if(!endline){
      let pageNo = that.data.pageNo + 1;
      that.pageComment(pageNo);
    }    
  },
  handleLongPress(e){
    console.log(e);
    that.setData({
      confirm:true
    })
    that.yes =()=>{
      util.request(api.Comment+"/"+e.currentTarget.dataset.id,{},"DELETE").then(res=>{
        that.setData({
          confirm:false
        })
        if(res.code!=0){
          util.warn(that,res.msg)
        }
      })      
    }
    that.no =()=>{
      that.setData({
        confirm:false
      })
    }
  }
})