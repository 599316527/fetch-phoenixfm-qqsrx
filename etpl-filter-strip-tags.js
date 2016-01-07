module.exports = function (source, useExtra) {
    return source.replace(/\<\/?[a-z][^\>]*\>/ig, '');
};
