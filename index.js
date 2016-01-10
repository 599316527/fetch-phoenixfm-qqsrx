/**
 * @file 抓取凤凰FM某节目的音频列表生成rss
 * @author Kyle He (x@hk1229.cn)
 */

var _ = require('underscore');
var deepExtend = require('deep-extend');
var local = require('./local');
var remote = require('./remote');

var argv = require('optimist')
    .usage('Usage: npm run generate -- --pid [num]')
    .demand(['pid'])
    .default('pages', 1)
    .default('fid', 1)
    .describe('pid', '节目ID')
    .describe('pages', '列表页数')
    .argv;


/**
 * 根据rid从列表中找出项
 *
 * @param  {Number} rid   单集id
 * @param  {Array} items  列表
 * @return {Object}
 */
function findItemByRid(rid, items) {
    for (var i = items.length - 1; i >= 0; i--) {
        if (items[i].rid === rid) {
            return items[i];
        }
    }
}

/**
 * 合并远程列表和本地缓存列表
 *
 * @param  {Array} remoteItems 远程列表
 * @param  {Array} cacheItems  缓存列表
 * @return {Array}
 */
function fillItemsData(remoteItems, cacheItems) {
    return Promise.all(remoteItems.map(function (item) {
        // 先从缓存中读取
        var cacheItem = findItemByRid(item.rid, cacheItems);
        if (cacheItem && cacheItem.filepath) {
            console.log('Hit from cache of ', item.rid, item.rtle);
            return cacheItem;
        }
        else {
            console.log('No cache for ', item.rid, item.rtle);
            return remote.getItem(argv.pid, argv.fid, item.rid);
        }
    })).then(function (items) {
        items.forEach(function (item, index) {
            return _.extend(remoteItems[index], item);
        });
        return remoteItems;
    });
}



console.log((new Date()).toUTCString());

// 读取远程列表和本地缓存
Promise.all([
    remote.getList(argv.pid, argv.fid, argv.pages),
    local.readCacheByPid(argv.pid)
]).then(function (data) {
    // 补全 mp3 地址等信息
    return fillItemsData(data[0].items, data[1].items).then(function (items) {
        data[0].items = items;
        return data[0];
    });
}).then(function (data) {
    // 合并config
    return local.readConfigByPid(argv.pid).then(function (config) {
        deepExtend(data, config);
        return data;
    });
}).then(function (data) {
    // 保存缓存、rss文件
    data.year = (new Date()).getUTCFullYear();
    Promise.all([
        local.saveCacheByPid(argv.pid, data),
        local.saveRssPageByPid(argv.pid, data)
    ]).then(function () {
        console.log('DONE!');
    });
}).catch(function (err) {
    console.log('发生了一些错误，中国或成最大输家');
    console.log(err.stack);
});




