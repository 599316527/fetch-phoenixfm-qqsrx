/**
 * @file 本地文件操作
 * @author Kyle He (x@hk1229.cn)
 */

var pfs = require('./promise-fs');

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
const RSS_SAVE_PATH = './rss';

/**
 * 缓存路径
 *
 * @type {String}
 */
const CACHE_PATH = './cache';


function getCacheFilePath(pid) {
    return CACHE_PATH + '/' + pid + '.json';
}

/**
 * 读缓存
 *
 * @param  {Number} pid    节目id
 * @return {Promise}
 */
function readCacheByPid(pid) {
    var cacheFilePath = getCacheFilePath(pid);
    return pfs.isFile(cacheFilePath).then(function () {
        // 偷懒用 require 来加载 #^_^#
        return require(cacheFilePath);
    }, function () {
        return {
            pfind: {},
            items: []
        };
    });
}

function getRssFilePath(pid) {
    return RSS_SAVE_PATH + '/' + pid + '.xml';
}

/**
 * 写rss文件
 *
 * @param  {Number} pid       节目id
 * @param  {Object} data      节目数据
 * @return {Promise}
 */
function saveRssPageByPid(pid, data) {
    return pfs.isDirectory(RSS_SAVE_PATH).then(function () {
        return Promise.resolve();
    }, function () {
        return pfs.mkdir(RSS_SAVE_PATH, 0o755);
    }).then(function () {
        return pfs.readFile(RSS_TPL_PATH)
    }).then(function (tpl) {
        // 渲染 rss 模板
        var etpl = require('etpl');
        // yyyy-mm-dd 日期格式转换成 gmt 格式
        etpl.addFilter('utc-date', require('./etpl-filter-utc-date'));
        etpl.addFilter('strip-tags', require('./etpl-filter-strip-tags'));
        // 配置 etpl
        etpl.config({
            strip: true // 移除两侧空白
        });
        return etpl.compile(tpl)(data);
    }).then(function (renderedText) {
        var path = getRssFilePath(pid);
        return pfs.writeFile(path, renderedText);
    });
}

/**
 * 写缓存
 *
 * @param  {Number} pid       节目id
 * @param  {Object} cacheData 缓存数据
 * @return {Promise}
 */
function saveCacheByPid(pid, cacheData) {
    var cacheFilePath = getCacheFilePath(pid);
    return pfs.isDirectory(CACHE_PATH).then(function () {
        return Promise.resolve();
    }, function () {
        return pfs.mkdir(CACHE_PATH, 0o755);
    }).then(function () {
        return pfs.writeFile(cacheFilePath, JSON.stringify(cacheData));
    });
}


exports.saveRssPageByPid = saveRssPageByPid;
exports.readCacheByPid = readCacheByPid;
exports.saveCacheByPid = saveCacheByPid;


