// var argv = require('optimist').argv;
var request = require('request');
var _ = require('underscore');
var fs = require('fs');
var etpl = require('etpl');
etpl.addFilter('utc-date', require('./etpl-filter-utc-date'));

const LIST_URL = 'http://diantai.ifeng.com/index.php/home/getProgramItemList';
const ITEM_URL = 'http://diantai.ifeng.com/index.php/audio/GetAudioFind';
const RSS_TPL = './rss.tpl';
const RSS_SAVE_PATH = './feed.xml';

const MAX_PAGE = 1;

// TODO: given id from argv
const PID = 61509;
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
    return LIST_URL + '?' + getQueryString({
        fid: FID,
        pid: PID,
        page: page,
        playOrder: 1
    });
}

function getItemUrl(rid) {
    return ITEM_URL + '?' + getQueryString({
        fid: FID,
        pid: PID,
        rid: rid
    });
}

var fakeHeader = {
    'cookie': 'userid=1451465902004_ilc2qt8376; userkey=131dbbd1e14b0ebb845658744b3869f3',
    'referer': 'http://diantai.ifeng.com/',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
    'x-requested-with': 'XMLHttpRequest'
};

function getJSON(url) {
    console.log('[x] ' + url);
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


Promise.all(_.range(MAX_PAGE).map(function (item, index) {
    return getPageUrl(index);
}).map(getJSON)).then(function (pages) {
    // 读取列表
    var pfind = pages[0].pfind;
    var items = [];
    pages.forEach(function (page) {
        items = items.concat(page.data);
    });
    return {
        pfind: pfind,
        items: items
    };
}).then(function (data) {
    // 补全 mp3 地址等信息
    return Promise.all(data.items.map(function (item) {
        return getItemUrl(item.rid);
    }).map(getJSON)).then(function (items) {
        items.forEach(function (item, index) {
            return _.extend(data.items[index], item);
        });
        return data;
    });
}).then(function (data) {
    // 渲染 rss 模板
    data.year = (new Date()).getUTCFullYear();
    return new Promise(function (resolve, reject) {
        fs.readFile(RSS_TPL, {
            encoding: 'utf-8',
            flag: 'r'
        }, function (err, tpl) {
            if (err) {
                throw err;
            }
            var render = etpl.compile(tpl.toString());
            var text = render(data);
            resolve(text);
        });
    });
}).then(function (rssContent) {
    // 存 rss xml
    return new Promise(function (resolve, reject) {
        fs.writeFile(RSS_SAVE_PATH, rssContent, function (err) {
            if (err) {
                throw err;
            }
            resolve('Saved in ' + RSS_SAVE_PATH);
        });
    });
}).then(function (msg) {
    console.log(msg);
}).catch(function (err) {
    console.log('出错啦！');
    console.error(err);
});




