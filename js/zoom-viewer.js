(function($){

    $.fn.zoomViewer = function(options){

        var settings = $.extend({
            mousewheel: true,
            theme: 'normal',
            currentIndex: 0,
            src: '',
            groupTitle: ''
            // src: []
        }, options);


        return this.each(function(){
            $('.js_zvWrapper').remove();

            // 声明变量
            var ConatainerW, ConatainerH, ImageW, ImageH, ImageOffsetX, ImageOffsetY, zoomPercent, angle;
            var $body, $wrapper, $controllUI, $zoombox, $image, $loading, $docDownload, $alert;

            var normalUI = '<header class="zv_header">\
                    <div class="zv_header_wrapper clearfix">\
                        <h1>'+ settings.groupTitle +'</h1>\
                        <div class="zv_control">\
                            <div class="zv_prev zv_btn js_prev"></div>\
                            <div class="zv_next zv_btn js_next"></div>\
                            <div class="zv_zoom_in zv_btn js_zoomIn"></div>\
                            <div class="zv_zoom_out zv_btn js_zoomOut"></div>\
                            <div class="zv_zoom_zero zv_btn js_zoomZero"></div>\
                            <div class="zv_zoom_fit zv_btn js_zoomFit"></div>\
                            <div class="zv_rotate_left zv_btn js_rotateLeft"></div>\
                            <div class="zv_rotate_right zv_btn js_rotateRight"></div>\
                        </div>\
                    </div>\
                </header>';

            var lightUI = '<div class="zvp_control">\
                            <a href="javascript:;" class="zvp_zoom_in zvp_btn js_zoomIn"></a>\
                            <a href="javascript:;" class="zvp_zoom_out zvp_btn js_zoomOut"></a>\
                        </div>\
                        <a href="javascript:;" class="zvp_close js_lightClose"></a>';

            if(settings.theme === 'normal'){
                $wrapper = $('<div class="zv_wrapper js_zvWrapper"></div>');
                $zoombox = $('<div class="zv_viewer"></div>');
                $controllUI = $(normalUI);
            }else if(settings.theme === 'poplayer'){
                $wrapper = $('<div class="zvp_wrapper js_zvWrapper"></div>');
                $zoombox = $('<div class="zvp_viewer"></div>');
                $controllUI = $(lightUI);
            }

            // Init wrapper style
            $body = $('body');
            $body.append($wrapper);
            $wrapper.append($controllUI);
            $wrapper.append($zoombox);

            $image = $('<img>').css({position: "absolute", top: "0px", left: "0px", display:"none", cursor:"-webkit-grab"});
            $loading = $('<img class="zv_loading" src="http://dui.dooioo.com/public/js/plugs/zoom-viewer/img/spinner.gif">');

            $docDownload = $('<div class="zv_doc">非图片类型文件，请点击下载后查看：<span></span></div>');
            $alert = $('<div class="zv_alert"></div>');

            $wrapper.append($docDownload);
            $wrapper.append($alert);
            $body.append($loading);

            $image.load(function(){

                // 初始化图片
                $image.css({position: "absolute", top: "0px", left: "0px", width:'', height:'', '-webkit-transform':'rotate(0deg)', 'display': 'block'});

                $loading.hide();
                $image.show();

                ConatainerW = $zoombox.width();
                ConatainerH = $zoombox.height();

                ImageW = $image.width();
                ImageH = $image.height();

                ImageOffsetX = 0;
                ImageOffsetY = 0;

                zoomPercent = 0;
                angle = 0;

                if(ConatainerW/ConatainerH > ImageW/ImageH){
                    var changedHeight = ConatainerH <= ImageH ? ConatainerH : ImageH;
                    var changedWidth = changedHeight*ImageW/ImageH;
                }else{
                    var changedWidth = ConatainerW <= ImageW ? ConatainerW : ImageW;
                    var changedHeight = changedWidth*ImageH/ImageW;
                }

                ImageOffsetY = (ConatainerH - changedHeight)/2;
                ImageOffsetX = (ConatainerW - changedWidth)/2;

                $image.css({
                    'width': changedWidth,
                    'height': changedHeight,
                    'left': ImageOffsetX,
                    'top': ImageOffsetY
                });
                zoomPercent = $image.width()/ImageW;

            }).error(function(){
                $loading.remove();
                $image.hide();

                $docDownload.show();

                if(settings.theme === 'poplayer'){
                    $docDownload.html('该图片无大图');
                }else{
                    $docDownload.html('该图片无法查看');
                }
            });


            $zoombox.html($image);

            if(typeof settings.src == 'object' && settings.src.length > 0){
                changeFile(settings.src[settings.currentIndex].src, settings.src[settings.currentIndex].title)
                // $image.attr({'src':settings.src[settings.currentIndex].src, 'title':settings.src[settings.currentIndex].title});
            }else if(typeof settings.src == 'string'){
                changeFile(settings.src, '下载')
            }else{
                return;
            }


            function zoomImg (img, percent) {

                ImageOffsetX -= (ImageW*percent - img.width())/2;
                ImageOffsetY -= (ImageH*percent - img.height())/2;

                img.css({
                    'width': ImageW*percent,
                    'height': ImageH*percent,
                    'left': ImageOffsetX,
                    'top': ImageOffsetY
                });
            }

            // 放大
            function zoomIn (range) {
                zoomPercent += range;
                zoomImg($image, zoomPercent);
            }
            // 缩小
            function zoomOut (range) {
                if(zoomPercent <= range){
                    return;
                }

                // Todo: 缩小时往中心靠拢
                if($image.width() - $zoombox.width() <= 100){
                    ImageOffsetX = (ConatainerW-$image.width())/2;
                    ImageOffsetY = (ConatainerH-$image.height())/2;
                }

                zoomPercent -= range;
                zoomImg($image, zoomPercent);
            }

            function zoomFit () {

                if(ConatainerW/ConatainerH > ImageW/ImageH){
                    var changedHeight = ConatainerH <= ImageH ? ConatainerH : ImageH;
                    var changedWidth = changedHeight*ImageW/ImageH;
                }else{
                    var changedWidth = ConatainerW <= ImageW ? ConatainerW : ImageW;
                    var changedHeight = changedWidth*ImageH/ImageW;
                }

                ImageOffsetY = (ConatainerH - changedHeight)/2;
                ImageOffsetX = (ConatainerW - changedWidth)/2;

                $image.css({
                    'width': changedWidth,
                    'height': changedHeight,
                    'left': ImageOffsetX,
                    'top': ImageOffsetY
                });

                zoomPercent = $image.width()/ImageW;

            }

            function zoomOriginal () {
                ImageOffsetY = (ConatainerH - ImageH)/2;
                ImageOffsetX = (ConatainerW - ImageW)/2;

                $image.css({
                    'width': ImageW,
                    'height': ImageH,
                    'left': ImageOffsetX,
                    'top': ImageOffsetY
                });
                zoomPercent = $image.width()/ImageW;
            }

            // Rotate Event
            function rotateLeft(argument){
                angle -= 90;
                $image.css('-webkit-transform', 'rotate('+angle+'deg)');
            }
            function rotateRight(argument){
                angle += 90;
                $image.css('-webkit-transform', 'rotate('+angle+'deg)');
            }

            // var docTypeExp = /\.(doc|docx|wps|xls|xlsx|et|pdf)$/i;
            // Change File
            function changeFile(src, title){
                $loading.show();
                //Todo: 空地址情况 (.underfined)
//                var isFilePath = src.search(/\.underfined$/)
//                if(isFilePath < 0){
//                    $image.hide();
//                    $loading.hide();
//                    $docDownload.html('文件地址有误，无法预览');
//                    $docDownload.show();
//
//                    return;
//                }

                var imgTypeExp = /\.(jpg|jpeg|bmp|gif|png)$/i;

                if(imgTypeExp.test(src)){
                    // 图片类型
                    $image.hide();
                    $docDownload.hide();

                    $image.attr({'src': src, 'title': title});
                    // $image.trigger('load');
                }else{
                    // 其他类型
                    $image.hide();
                    $loading.hide();
                    $docDownload.html('非图片类型文件，请点击下载后查看：<a href="'+src+'" download="'+title+'">'+title+'</a>');
                    $docDownload.show();
                }
            }


            // Mousewheel Event
            $zoombox.bind('mousewheel', function(event){
                event.preventDefault();

                if(event.wheelDelta > 0){
                    zoomOut(0.1);
                }else{
                    zoomIn(0.1);
                }
            });

            // Drag Move Event
            $image.bind('mousedown', function(e){
                e.preventDefault();
                $image.css('cursor', '-webkit-grabbing');
                var last = e;
                function drag(e) {
                    e.preventDefault();
                    ImageOffsetX += (e.pageX - last.pageX);
                    ImageOffsetY += (e.pageY - last.pageY);
                    last = e;

                    $image.css({'left':ImageOffsetX, 'top':ImageOffsetY});
                }

                $(document)
                .bind('mousemove', drag)
                .one('mouseup', function () {
                    $image.css('cursor', '-webkit-grab');
                    $(document).unbind('mousemove', drag);
                });

            });

            // Button Click Control
            $wrapper.find('.js_zoomIn').click(function(){
                zoomIn(0.2);
            });
            $wrapper.find('.js_zoomOut').click(function(){
                zoomOut(0.2);
            });
            $wrapper.find('.js_zoomZero').click(function(){
                zoomOriginal();
            });
            $wrapper.find('.js_zoomFit').click(function(){
                zoomFit();
            });
            $wrapper.find('.js_rotateLeft').click(function(){
                rotateLeft(); 
            });
            $wrapper.find('.js_rotateRight').click(function(){
                rotateRight(); 
            }); 
            $wrapper.find('.js_next').click(function(){
                if(settings.currentIndex >= (settings.src.length - 1)) {
                    $alert.html('已到最后一张').stop(true, true).slideDown('fast').delay(1000).slideUp('normal');
                    return
                }
                settings.currentIndex++;
                changeFile(settings.src[settings.currentIndex].src, settings.src[settings.currentIndex].title)
                // $image.attr({'src': settings.src[settings.currentIndex].src, 'title': settings.src[settings.currentIndex].title});
            });
            $wrapper.find('.js_prev').click(function(){
                if(settings.currentIndex <= 0) {
                    $alert.html('已到第一张').stop(true, true).slideDown('fast').delay(1000).slideUp('normal');
                    return
                }
                settings.currentIndex--;
                changeFile(settings.src[settings.currentIndex].src, settings.src[settings.currentIndex].title)
                // $image.attr({'src': settings.src[settings.currentIndex].src, 'title': settings.src[settings.currentIndex].title});
            }); 
            $wrapper.find('.js_lightClose').click(function(){
                $wrapper.remove();
                $loading.remove();
        });


            // 左、右按键切换图片
            if(settings.theme === 'normal'){
                $(document).keyup(function(e) {
                    switch(e.keyCode) { 
                        case 37 : $wrapper.find('.js_prev').click(); break;
                        case 39 : $wrapper.find('.js_next').click(); break;
                    }
                });
            }
        })
    }


})(jQuery);