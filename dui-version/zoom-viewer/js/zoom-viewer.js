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

            var normalUI = '<header class="zv_header">\
                    <div class="zv_header_wrapper clearfix">\
                        <h1>'+ settings.groupTitle +'</h1>\
                        <div class="zv_control">\
                            <div class="zv_pageNo"><span></span>/<span></span></div>\
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
                var $wrapper = $('<div class="zv_wrapper js_zvWrapper"></div>');
                var $zoombox = $('<div class="zv_viewer"></div>');
                var control_ui = normalUI;
                var $alert = $('<div class="zv_alert"></div>');
                $wrapper.append($alert);

            }else if(settings.theme === 'poplayer'){
                var $wrapper = $('<div class="zvp_wrapper js_zvWrapper"></div>');
                var $zoombox = $('<div class="zvp_viewer"></div>');
                var control_ui = lightUI;
            }

            $('body').append($wrapper);
            $wrapper.append(control_ui);
            $wrapper.append($zoombox);

            // 设置页码
            if(settings.theme === 'normal'){
                $('.zv_pageNo span').eq(1).text(settings.src.length);
                $('.zv_pageNo span').eq(0).text(settings.currentIndex + 1);
            }


            var $image = $('<img>').css({position: "absolute", top: "0px", left: "0px", display:"none", cursor:"-webkit-grab"});
            var $loading = $('<img class="zv_loading" src="http://dui.dooioo.com/public/js/plugs/zoom-viewer/img/spinner.gif">');


            $('body').append($loading);

            if(typeof settings.src == 'object' && settings.src.length > 0){
                $image.attr({'src':settings.src[settings.currentIndex].src, 'title':settings.src[settings.currentIndex].title});
            }else if(typeof settings.src == 'string'){
                $image.attr({'src': settings.src});
            }else{
                return;
            }

            $zoombox.html($image);

            var ConatainerW, ConatainerH, ImageW, ImageH, ImageOffsetX, ImageOffsetY, zoomPercent, angle;

            $image.load(function(){
                $loading.hide();

                // 初始化图片
                $image.css({position: "absolute", top: "0px", left: "0px", width:'', height:'', '-webkit-transform':'rotate(0deg)', 'display': 'block'});

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
                alert('该图片无大图');
                $wrapper.remove();
                $loading.remove();
            });



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

            // Mousewheel Event
            $zoombox.bind('mousewheel', function(event){
                event.preventDefault();

                if(event.wheelDelta > 0){
                    zoomIn(0.1);
                }else{
                    zoomOut(0.1);
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
                    return;
                }
                settings.currentIndex++;
                $loading.show();
                $alert.hide();

                $image.attr({'src': settings.src[settings.currentIndex].src, 'title': settings.src[settings.currentIndex].title});
                $('.zv_pageNo span').eq(0).text(settings.currentIndex + 1);
            });
            $wrapper.find('.js_prev').click(function(){
                if(settings.currentIndex <= 0) {
                    $alert.html('已到第一张').stop(true, true).slideDown('fast').delay(1000).slideUp('normal');
                    return;
                }
                settings.currentIndex--;
                $alert.hide();
                $loading.show();

                $image.attr({'src': settings.src[settings.currentIndex].src, 'title': settings.src[settings.currentIndex].title});
                $('.zv_pageNo span').eq(0).text(settings.currentIndex + 1);
            });
            $wrapper.find('.js_lightClose').click(function(){
                $wrapper.remove();
                $loading.remove();
            });           
        })
    }


})(jQuery);