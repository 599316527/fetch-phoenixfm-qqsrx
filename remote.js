/**
 * @file 读取远程数据
 * @author Kyle He (x@hk1229.cn)
 */

var request = require('request');
var _ = require('underscore');

/**
 * 远程音频列表接口
 *
 * @type {String}
 */
const REMOTE_LIST_URL = 'http://diantai.ifeng.com/index.php/home/getProgramItemList';

/**
 * 远程音频信息接口
 *
 * @type {String}
 */
const REMOTE_ITEM_URL = 'http://diantai.ifeng.com/index.php/audio/GetAudioFind';


function getQueryString(params) {
    var paramPairs = [];
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            paramPairs.push(key + '=' + encodeURIComponent(params[key]));
        }
    }
    return paramPairs.join('&');
}

function getPageUrl(pid, fid, page) {
    return REMOTE_LIST_URL + '?' + getQueryString({
        fid: fid,
        pid: pid,
        page: page,
        playOrder: 1
    });
}

function getItemUrl(pid, fid, rid) {
    return REMOTE_ITEM_URL + '?' + getQueryString({
        fid: fid,
        pid: pid,
        rid: rid
    });
}



/**
 * 伪造请求头
 *
 * @type {Object}
 */
var fakeHeader = {
    'cookie': 'userid=1451465902004_ilc2qt8376; userkey=131dbbd1e14b0ebb845658744b3869f3',
    'referer': 'http://diantai.ifeng.com/',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest'
};

function getJSON(url) {
    console.log('Loading ' + url);
    return new Promise(function (resolve, reject) {
        request({
            url: url,
            method: 'GET',
            headers: fakeHeader
        }, function(error, response, body){
            if(error) {
                throw error;
            } else if (response.statusCode === 200) {
                var data = JSON.parse(body);
                resolve(data);
            } else {
                throw new Error('Can\'t load ' + url
                    + ' (' + response.statusCode + ')\n' + body);
            }
        });
    });
}

/**
 * 读取远程列表
 *
 * @param  {Number} pid       节目id
 * @param  {Number} fid       fid
 * @param  {Number} pageCount 读取页面数
 * @return {Promise}
 */
function getList(pid, fid, pageCount) {
    return Promise.all(_.range(pageCount).map(function (item, index) {
        return getPageUrl(pid, fid, index);
    }).map(getJSON)).then(function (pages) {
        var pfind = pages[0].pfind;
        var items = [];
        pages.forEach(function (page) {
            items = items.concat(page.data);
        });
        return {
            pfind: pfind,
            items: items
        };
    });
}

/**
 * 读取单个单集信息
 *
 * @param  {Number} pid       节目id
 * @param  {Number} fid       fid
 * @param  {Number} rid       单集id
 * @return {Promise}
 */
function getItem(pid, fid, rid) {
    return getJSON(getItemUrl(pid, fid, rid));
}

exports.getList = getList;
exports.getItem = getItem;

