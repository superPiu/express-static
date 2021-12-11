module.exports={
    //时间单位转化为s
    unitToSecond:function(time){
        let unit = time.charAt(time.length - 1)
        let val = +time.substr(0,time.length-1)
        let afterTransTime = ''
        switch (unit){
            case 's':
               afterTransTime = val;
               break;
            case 'm':
               afterTransTime = val * 60;
               break;
            case 'h':
                afterTransTime = val * 3600;
               break;
            case 'd':
               afterTransTime = val * 3600 * 24;
               break;
            case 'M':
               afterTransTime = val * 3600 * 24 * 30;
               break;
            case 'y':
               afterTransTime = val * 3600 * 24 * 30 * 365;
               break;
            default:
                afterTransTime = val;

        }
        return afterTransTime;
    }
}