/**
 * @file 本地文件操作
 * @author Kyle He (x@hk1229.cn)
 */

var fs = require('fs');

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
 * 文件模式
 *
 * @type {Enum}
 */
var FileMode = {
    File: 'File',
    Directory: 'Directory',
    BlockDevice: 'BlockDevice',
    CharacterDevice: 'CharacterDevice',
    SymbolicLink: 'SymbolicLink',
    FIFO: 'FIFO',
    Socket: 'Socket'
};

function capital(word) {
    return word.charAt(0).toUpperCase() + word.substring(1);
}

function exist(path, type) {
    return new Promise(function (resolve, reject) {
        fs.stat(path, function (err, stats) {
            if (!err && stats['is' + capital(type)]()) {
                resolve();
            }
            else {
                reject();
            }
        });
    });
}

function mkdir(path, mode) {
    return new Promise(function (resolve, reject) {
        fs.mkdir(path, mode, function (err) {
            if (err) {
                throw err;
            }
            else {
                resolve();
            }
        });
    });
}

function readFile(path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, {
            encoding: 'utf-8',
            flag: 'r'
        }, function (err, tpl) {
            if (err) {
                throw err;
            }
            else {
                resolve(tpl.toString());
            }
        });
    });
}

function writeFile(path, content) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(path, content, function (err) {
            if (err) {
                throw err;
            }
            else {
                resolve();
            }
        });
    });
}

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
    return exist(cacheFilePath, FileMode.File).then(function () {
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
    return exist(RSS_SAVE_PATH, FileMode.Directory).then(function () {
        return Promise.resolve();
    }, function () {
        return mkdir(RSS_SAVE_PATH, 0o755);
    }).then(function () {
        return readFile(RSS_TPL_PATH)
    }).then(function (tpl) {
        // 渲染 rss 模板
        var etpl = require('etpl');
        // yyyy-mm-dd 日期格式转换成 gmt 格式
        etpl.addFilter('utc-date', require('./etpl-filter-utc-date'));
        // 配置 etpl
        etpl.config({
            strip: true // 移除两侧空白
        });
        return etpl.compile(tpl)(data);
    }).then(function (renderedText) {
        var path = getRssFilePath(pid);
        return writeFile(path, renderedText);
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
    return exist(CACHE_PATH, FileMode.Directory).then(function () {
        return Promise.resolve();
    }, function () {
        return mkdir(CACHE_PATH, 0o755);
    }).then(function () {
        return writeFile(cacheFilePath, JSON.stringify(cacheData));
    });
}


exports.saveRssPageByPid = saveRssPageByPid;
exports.readCacheByPid = readCacheByPid;
exports.saveCacheByPid = saveCacheByPid;


