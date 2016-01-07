/**
 * @file 把 fs 的方法用 Promise 封装下
 * @author Kyle He (x@hk1229.cn)
 */

var fs = require('fs');


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

function exist(path, type) {
    return new Promise(function (resolve, reject) {
        fs.stat(path, function (err, stats) {
            if (!err && stats['is' + type]()) {
                resolve();
            }
            else {
                reject();
            }
        });
    });
}

function isFile(path) {
    return exist(path, FileMode.File);
}

function isDirectory(path) {
    return exist(path, FileMode.Directory);
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

exports.isFile = isFile;
exports.isDirectory = isDirectory;
exports.mkdir = mkdir;
exports.readFile = readFile;
exports.writeFile = writeFile;
