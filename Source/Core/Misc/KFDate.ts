export function kfDateformat(dateobj,format)
{
    var date = {
        "M+": dateobj.getMonth() + 1,
        "d+": dateobj.getDate(),
        "h+": dateobj.getHours(),
        "m+": dateobj.getMinutes(),
        "s+": dateobj.getSeconds(),
        "q+": Math.floor((dateobj.getMonth() + 3) / 3),
        "S+": dateobj.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (dateobj.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
}