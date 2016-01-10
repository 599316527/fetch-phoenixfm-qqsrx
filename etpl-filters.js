/**
 * @file etpl filters
 * @author Kyle He (x@hk1229.cn)
 */

// yyyy-mm-dd 日期格式转换成 gmt 格式
exports['utc-date'] = function (source, useExtra) {
    if (!/^\d{4}(-\d{2}){2}$/.test(source)) {
        return source;
    }
    var p = source.split('-');
    var d = new Date();
    d.setUTCFullYear(parseInt(p[0], 10));
    d.setUTCMonth(parseInt(p[1], 10) - 1);
    d.setUTCDate(parseInt(p[2], 10));
    d.setUTCHours(15);
    d.setUTCMinutes(0);
    d.setUTCSeconds(0);
    return d.toUTCString();
};

// 移除 html 标签
exports['strip-tags'] = function (source, useExtra) {
    return source.replace(/\<\/?[a-z][^\>]*\>/ig, '').trim();
};
