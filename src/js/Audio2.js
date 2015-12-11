var spiker = {};

(function () {
    
    var context;
    var db = new ydn.db.Storage('db-name');   

    spiker.inited = false;

    spiker.init = function () {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();

        loadFiles(context, db,
            [
                'images/wheel.mp3'
            ],
            function (bufferList) {
                console.log("spiker inited");
                spiker.bufferList = bufferList;
            }
        );
    }

    spiker.konus = function (sayi) {

        var strSayi = sayi.toString();
        var len = strSayi.length;
        var sourceArray = [];
        var source, dosyaIndex;

        for (var i = 0; i < len; i++) {
            dosyaIndex = parseInt(strSayi[i]) - 1;
            source = context.createBufferSource();
            source.buffer = spiker.bufferList[dosyaIndex];
            source.connect(context.destination);
            sourceArray.push(source);
            source.start(0);
        }
    }

})();

function loadFiles (context, db, urlList, callback) {

    var bufferList = new Array();
    var loadCount = 0;

    for (var i = 0; i < urlList.length; ++i) {
        loadBuffer(urlList[i], i);
    }

    function loadBuffer (url, index) {
        oku(
            index,
            url,          // yol
            decodeFile,   // dosya lokalde var
            getFileAsync  // dosyayı indir
        );
    }

    function decodeFile (index, url, file) {
        
        context.decodeAudioData(
            file,
            function (buffer) {

                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }

                bufferList[index] = buffer;
                kaydet(file, url);

                if (++loadCount == urlList.length) {
                    callback(bufferList);
                }
            },
            function (error) {
                console.error('decodeAudioData error', error);
            }
        );
    }

    /* utility fonskyinoları */

    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    }

    function str2ab(str) {
        var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    function kaydet(buf, url) {
        var str = ab2str(buf);
        db.put('store-name', { buf: str }, url);
    }

    function oku(index, url, success, error) {
        db.get('store-name', url).always(function (record) {
            if (!record) {
                error(index, url);
                return;
            }
            var str = record.buf;
            var buf = str2ab(str);
            success(index, url, buf);
        });
    }

    function getFileAsync (index, url) {
        console.log("dosya indiriliyor", url);

        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.onload = function () { decodeFile(index, url, request.response); }
        request.onerror = function () { alert('BufferLoader: XHR error'); }
        request.send();
    }
}