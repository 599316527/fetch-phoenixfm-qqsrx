/**
 * @file 抓取凤凰FM某节目的音频列表生成rss
 * @author Kyle He (x@hk1229.cn)
 */

// var argv = require('optimist').argv;
var request = require('request');
var _ = require('underscore');
var fs = require('fs');
var etpl = require('etpl');

// yyyy-mm-dd 日期格式转换成 gmt 格式
etpl.addFilter('utc-date', require('./etpl-filter-utc-date'));

// 配置 etpl
etpl.config({
    strip: true     // 移除两次空白
});

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

/**
 * rss模板路径
 *
 * @type {String}
 */
const RSS_TPL_PATH = './rss.etpl';

/**
 * rss保存路径
 *
 * @type {String}
 */
const RSS_SAVE_PATH = './feed.xml';

/**
 * 缓存路径
 *
 * @type {String}
 */
const CACHE_PATH = './cache';

/**
 * 抓取音频列表页面数
 *
 * @type {Number}
 */
const MAX_PAGE = 1;

/**
 * 节目id
 * TODO: given id from argv
 *
 * @type {Number}
 */
const PID = 61509;

/**
 * 暂不知道干嘛的id
 *
 * @type {Number}
 */
const FID = 1;


function getQueryString(params) {
    var paramPairs = [];
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            paramPairs.push(key + '=' + encodeURIComponent(params[key]));
        }
    }
    return paramPairs.join('&');
}

function getPageUrl(page) {
    return REMOTE_LIST_URL + '?' + getQueryString({
        fid: FID,
        pid: PID,
        page: page,
        playOrder: 1
    });
}

function getItemUrl(rid) {
    return REMOTE_ITEM_URL + '?' + getQueryString({
        fid: FID,
        pid: PID,
        rid: rid
    });
}

function getCacheFilePath() {
    return CACHE_PATH + '/' + PID + '.json';
}

function getCacheData() {
    var cacheFilePath = getCacheFilePath();
    return new Promise(function (resolve, reject) {
        fs.stat(cacheFilePath, function (err, stats) {
            if (!err && stats.isFile()) {
                resolve(require(cacheFilePath));
            }
            else {
                resolve({
                    pfind: {},
                    items: []
                });
            }
        });
    });
}

function findItemByRid(rid, items) {
    for (var i = items.length - 1; i >= 0; i--) {
        if (items[i].rid === rid) {
            return items[i];
        }
    }
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
                throw new Error('HTTP Response code: ' + response.statusCode);
            }
        });
    });
}

function getRemoteList() {
    return Promise.all(_.range(MAX_PAGE).map(function (item, index) {
        return getPageUrl(index);
    }).map(getJSON)).then(function (pages) {
        // 读取远程列表
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

function saveRssPage(data) {
    return new Promise(function (resolve, reject) {
        fs.readFile(RSS_TPL_PATH, {
            encoding: 'utf-8',
            flag: 'r'
        }, function (err, tpl) {
            if (err) {
                throw err;
            }
            // 渲染 rss 模板
            var render = etpl.compile(tpl.toString());
            var text = render(data);
            resolve(text);
        });
    }).then(function (renderedText) {
        // 存 rss xml
        return new Promise(function (resolve, reject) {
            fs.writeFile(RSS_SAVE_PATH, renderedText, function (err) {
                if (err) {
                    throw err;
                }
                resolve('RSS has been saved in ' + RSS_SAVE_PATH);
            });
        });
    });
}

function saveCacheData(cacheData) {
    var cacheFilePath = getCacheFilePath();
    return new Promise(function (resolve, reject) {
        fs.writeFile(cacheFilePath, JSON.stringify(cacheData), function (err) {
            if (err) {
                throw err;
            }
            resolve('Cache has been saved in ' + cacheFilePath);
        });
    });
}

function fillItemsData(remoteItems, cacheItems) {
    return Promise.all(remoteItems.map(function (item) {
        // 先从缓存中读取
        var cacheItem = findItemByRid(item.rid, cacheItems);
        if (cacheItem && cacheItem.filepath) {
            console.log('Hit cache for ' + item.rid + '.');
            return cacheItem;
        }
        else {
            console.log('No cache for ' + item.rid + '.');
            return getJSON(getItemUrl(item.rid));
        }
    })).then(function (items) {
        items.forEach(function (item, index) {
            return _.extend(remoteItems[index], item);
        });
        return remoteItems;
    });
}

console.log((new Date()).toUTCString());

Promise.all([
    getRemoteList(),
    getCacheData()
]).then(function (data) {
    // 补全 mp3 地址等信息
    return fillItemsData(data[0].items, data[1].items).then(function (items) {
        data[0].items = items;
        return data[0];
    });
}).then(function (data) {
    data.year = (new Date()).getUTCFullYear();
    Promise.all([
        saveCacheData(data),
        saveRssPage(data)
    ]).then(function (messages) {
        messages.forEach(function (msg) {
            console.log(msg);
        });
    });
}).catch(function (err) {
    console.log('发生了一些错误，中国或成最大输家');
    console.log(err.stack);
});




