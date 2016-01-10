/**
 * @file 本地文件操作
 * @author Kyle He (x@hk1229.cn)
 */

var _ = require('underscore');
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

/**
 * 配置路径
 *
 * @type {String}
 */
const CONFIG_PATH = './config';

function getCacheFilePath(pid) {
    return CACHE_PATH + '/' + pid + '.json';
}

function getRssFilePath(pid) {
    return RSS_SAVE_PATH + '/' + pid + '.xml';
}

function getConfigPath(pid) {
    return CONFIG_PATH + '/' + pid + '.json';
}

function readJson(path) {
    return pfs.isFile(path).then(function () {
        return pfs.readFile(path);
    }, function () {
        throw new Error('No such file: ' + path);
    }).then(function (content) {
        return JSON.parse(content);
    });
}

/**
 * 读缓存
 *
 * @param  {Number} pid    节目id
 * @return {Promise}
 */
function readCacheByPid(pid) {
    return readJson(getCacheFilePath(pid)).then(function (json) {
        return json;
    }).catch(function () {
        return {
            pfind: {},
            items: []
        };
    });
}

function readConfigByPid(pid) {
    return readJson(getConfigPath(pid)).then(function (json) {
        return json;
    }).catch(function (err) {
        if (err instanceof SyntaxError) {
            throw err;
        }
        else {
            return {};
        }
    });
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
        // 加filter
        _.each(require('./etpl-filters'), function (filter, key) {
            etpl.addFilter(key, filter);
        });
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
exports.readConfigByPid = readConfigByPid;


