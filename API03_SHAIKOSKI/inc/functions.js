function response(sts,msg,aftrows,data=null){
    return{
        status:sts,
        message:msg,
        after_rows:aftrows,
        data:data,
        timestamp:new Date().getTime()

    }
}

module.exports={
    response
}