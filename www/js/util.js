/*
 * 混合器，将src对象中所有属性混合到target对象中
 * params:
 *      object:子对象，它扩展src,并继承了 src的所有功能
 *      src:父对象，它是创建object对象的模板
 * return:
 *       object返回object
 */
function mixer(src, target) {
    if (!src)
        return target;
    for (var p in src) {//遍历 src对象,并将所有属性赋值给target，从而实现对象的混合
        target[p] = src[p];
    }
    return target;
}

function clone(src, target) {
    if (!src)
        return target;
    for (var p in src) {//遍历 src对象,并将所有属性赋值给target，从而实现对象的混合
        target[p] = src[p];
    }
    return target;
}


/**
 *   定义模型对象，模型对象中用于存放模型实体
 */
function $Model(parent) {
    if (parent) {
        this._$parent = parent;
        this.__proto__ = parent;
    } else {
        this._$parent = null;
    }

}

/**
 * 定义环境变量
 */
function $Env(parent) {
    if (parent) {
        this._$parent = parent;
        this.__proto__ = parent;
    } else {
        this._$parent = null;
    }
}


/**
 * 缓存消息的队列
 *
 */
function createCache() {
    return (function () {
        var _count = 0;//计数器
        var _queue = [];//队列

        //删除队列元素
        var delQueue = function (data) {
            for (var i = 0; i < _queue.length; i++) {
                if (_queue[i].id == data.id) {
                    _queue.splice(i, 1);
                    break;
                }
            }
        };
        //插入队列
        var pushQueue = function (data) {
            _queue.push(data);
        };

        //清空队列
        var clearQueue = function () {
            _queue.splice(0, _queue.length);
        };

        var count = function () {
            _count++;
            return _count;
        };

        var queue = function () {
            return _queue;
        };

        return {
            count: count,
            clearQueue: clearQueue,
            pushQueue: pushQueue,
            delQueue: delQueue,
            queue: queue
        };

    })();
}
//构建缓存
//window.CACHE = createCache();


/**
 *BASE64工具类
 *可以和java的BASE64编码和解码互相转化
 *    用法：
 *    var base64 = BASE64.encoder("中国");//返回编码后的字符
 *        var unicode= BASE64.decoder(base64Str);//返回会解码后的unicode码数组。
 */
(function () {
    var B64 = {
        alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
        lookup: null,
        ie: /MSIE /.test(navigator.userAgent),
        ieo: /MSIE [67]/.test(navigator.userAgent),
        encode: function (s) {
            /* jshint bitwise:false */
            var buffer = B64.toUtf8(s),
                position = -1,
                result,
                len = buffer.length,
                nan0, nan1, nan2, enc = [, , ,];

            if (B64.ie) {
                result = [];
                while (++position < len) {
                    nan0 = buffer[position];
                    nan1 = buffer[++position];
                    enc[0] = nan0 >> 2;
                    enc[1] = ((nan0 & 3) << 4) | (nan1 >> 4);
                    if (isNaN(nan1))
                        enc[2] = enc[3] = 64;
                    else {
                        nan2 = buffer[++position];
                        enc[2] = ((nan1 & 15) << 2) | (nan2 >> 6);
                        enc[3] = (isNaN(nan2)) ? 64 : nan2 & 63;
                    }
                    result.push(B64.alphabet.charAt(enc[0]), B64.alphabet.charAt(enc[1]), B64.alphabet.charAt(enc[2]), B64.alphabet.charAt(enc[3]));
                }
                return result.join('');
            } else {
                result = '';
                while (++position < len) {
                    nan0 = buffer[position];
                    nan1 = buffer[++position];
                    enc[0] = nan0 >> 2;
                    enc[1] = ((nan0 & 3) << 4) | (nan1 >> 4);
                    if (isNaN(nan1))
                        enc[2] = enc[3] = 64;
                    else {
                        nan2 = buffer[++position];
                        enc[2] = ((nan1 & 15) << 2) | (nan2 >> 6);
                        enc[3] = (isNaN(nan2)) ? 64 : nan2 & 63;
                    }
                    result += B64.alphabet[enc[0]] + B64.alphabet[enc[1]] + B64.alphabet[enc[2]] + B64.alphabet[enc[3]];
                }
                return result;
            }
        },
        decode: function (s) {
            /* jshint bitwise:false */
            s = s.replace(/\s/g, '');
            if (s.length % 4)
                throw new Error('InvalidLengthError: decode failed: The string to be decoded is not the correct length for a base64 encoded string.');
            if (/[^A-Za-z0-9+\/=\s]/g.test(s))
                throw new Error('InvalidCharacterError: decode failed: The string contains characters invalid in a base64 encoded string.');

            var buffer = B64.fromUtf8(s),
                position = 0,
                result,
                len = buffer.length;

            if (B64.ieo) {
                result = [];
                while (position < len) {
                    if (buffer[position] < 128)
                        result.push(String.fromCharCode(buffer[position++]));
                    else if (buffer[position] > 191 && buffer[position] < 224)
                        result.push(String.fromCharCode(((buffer[position++] & 31) << 6) | (buffer[position++] & 63)));
                    else
                        result.push(String.fromCharCode(((buffer[position++] & 15) << 12) | ((buffer[position++] & 63) << 6) | (buffer[position++] & 63)));
                }
                return result.join('');
            } else {
                result = '';
                while (position < len) {
                    if (buffer[position] < 128)
                        result += String.fromCharCode(buffer[position++]);
                    else if (buffer[position] > 191 && buffer[position] < 224)
                        result += String.fromCharCode(((buffer[position++] & 31) << 6) | (buffer[position++] & 63));
                    else
                        result += String.fromCharCode(((buffer[position++] & 15) << 12) | ((buffer[position++] & 63) << 6) | (buffer[position++] & 63));
                }
                return result;
            }
        },
        toUtf8: function (s) {
            /* jshint bitwise:false */
            if(!s || s==''){
              return;
            };
            var position = -1,
                len = s.length,
                chr, buffer = [];
            if (/^[\x00-\x7f]*$/.test(s)) while (++position < len)
                buffer.push(s.charCodeAt(position));
            else while (++position < len) {
                chr = s.charCodeAt(position);
                if (chr < 128)
                    buffer.push(chr);
                else if (chr < 2048)
                    buffer.push((chr >> 6) | 192, (chr & 63) | 128);
                else
                    buffer.push((chr >> 12) | 224, ((chr >> 6) & 63) | 128, (chr & 63) | 128);
            }
            return buffer;
        },
        fromUtf8: function (s) {
            /* jshint bitwise:false */
            var position = -1,
                len, buffer = [],
                enc = [, , ,];
            if (!B64.lookup) {
                len = B64.alphabet.length;
                B64.lookup = {};
                while (++position < len)
                    B64.lookup[B64.alphabet.charAt(position)] = position;
                position = -1;
            }
            len = s.length;
            while (++position < len) {
                enc[0] = B64.lookup[s.charAt(position)];
                enc[1] = B64.lookup[s.charAt(++position)];
                buffer.push((enc[0] << 2) | (enc[1] >> 4));
                enc[2] = B64.lookup[s.charAt(++position)];
                if (enc[2] === 64)
                    break;
                buffer.push(((enc[1] & 15) << 4) | (enc[2] >> 2));
                enc[3] = B64.lookup[s.charAt(++position)];
                if (enc[3] === 64)
                    break;
                buffer.push(((enc[2] & 3) << 6) | enc[3]);
            }
            return buffer;
        }
    };

    var B64url = {
        decode: function (input) {
            // Replace non-url compatible chars with base64 standard chars
            input = input
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            // Pad out with standard base64 required padding characters
            var pad = input.length % 4;
            if (pad) {
                if (pad === 1) {
                    throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
                }
                input += new Array(5 - pad).join('=');
            }

            return B64.decode(input);
        },

        encode: function (input) {
            var output = B64.encode(input);
            return output
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .split('=', 1)[0];
        }
    };

    window.BASE64 = {
        decoder: B64.decode,
        encoder: B64.encode,
        urlDecoder: B64url.decode,
        urlEncoder: B64url.encode,
    }

})();


Array.prototype.clear = function () {
    this.splice(0, this.length);
};

Array.prototype.addAll = function (arr) {
    for (var i = 0; i < arr.length; i++) {
        this.push(arr[i]);
    }
};

Array.prototype.delByValue = function (obj) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == obj) {
            this.splice(i, 1);
            break;
        }
    }
};

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
};


String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
};

/**
 * 扩展Map对象
 *  var map=new Map();
 *    //放入值
 *  map.put("key","value");
 *    //删除
 *    map.remove("key");
 * @returns
 */
function Map() {

    this.elements = new Array();

    this.size = function () {
        return this.elements.length;
    }

    this.isEmpty = function () {
        return (this.elements.length < 1);
    }

    this.clear = function () {
        this.elements = new Array();
    }

    this.put = function (_key, _value) {
        if (!this.containsKey(_key))
            this.elements.push({
                key: _key,
                value: _value
            });
    }

    this.remove = function (_key) {
        var bln = false;

        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    this.elements.splice(i, 1);
                    return true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    }

    this.get = function (_key) {
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    return this.elements[i].value;
                }
            }
        } catch (e) {
            return null;
        }
    }

    this.element = function (_index) {
        if (_index < 0 || _index >= this.elements.length) {
            return null;
        }
        return this.elements[_index];
    }

    this.containsKey = function (_key) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].key == _key) {
                    bln = true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    }

    this.containsValue = function (_value) {
        var bln = false;
        try {
            for (i = 0; i < this.elements.length; i++) {
                if (this.elements[i].value == _value) {
                    bln = true;
                }
            }
        } catch (e) {
            bln = false;
        }
        return bln;
    }

    this.values = function () {
        var arr = new Array();
        for (i = 0; i < this.elements.length; i++) {
            arr.push(this.elements[i].value);
        }
        return arr;
    }

    this.keys = function () {
        var arr = new Array();
        for (i = 0; i < this.elements.length; i++) {
            arr.push(this.elements[i].key);
        }
        return arr;
    }
}

var add0 = function (m) {
  return m < 10 ? '0' + m : m
};

function formatDate(date) {
  if(!date){
    return;
  }
  var now = new Date(date);
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var d = now.getDate();
  var h = now.getHours();
  var mm = now.getMinutes();
  var s = now.getSeconds();
  return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
};
