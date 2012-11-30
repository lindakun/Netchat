/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 12-11-30
 * Time: 下午3:11
 * To change this template use File | Settings | File Templates.
 */
$(function(){
  $("#loginform").validationEngine({
    onValidationComplete: onValidationComplete
  });
});

//表单验证完毕后操作
var onValidationComplete = function(form, status){
  if(status){
    //do something
    return true;
  }else{
    $(".alert").eq(0).removeClass().addClass("alert alert-error").children("span").text("输入有误,请检查输入!");
  }
};