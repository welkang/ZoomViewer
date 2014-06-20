(function($){

    $.fn.zoomViewer = function(options){

        var settings = $.extend({
            mousewheel: true, //滚动支持
            theme: 'normal', // 主题
            currentIndex: 0,
            src: '',
            srcArray: []
        }, options);


        return this.each(function(){
            $('.zoomboxWrapper').remove();

            if(settings.theme === 'normal'){
                var $wrapper = $('<div class="zoomboxWrapper zoombox-normal"></div>');

                var control_ui = '<header class="iviewer_header">\
                    <div class="iviewer_header_wrapper clearfix">\
                        <h1> 图片标题、描述 </h1>\
                        <div class="iviewer_control">\
                            <div class="iviewer_prev iviewer_common iviewer_button"></div>\
                            <div class="iviewer_next iviewer_common iviewer_button"></div>\
                            <div class="iviewer_zoom_in iviewer_common iviewer_button"></div>\
                            <div class="iviewer_zoom_out iviewer_common iviewer_button"></div>\
                            <div class="iviewer_zoom_zero iviewer_common iviewer_button"></div>\
                            <div class="iviewer_zoom_fit iviewer_common iviewer_button"></div>\
                            <div class="iviewer_rotate_left iviewer_common iviewer_button"></div>\
                            <div class="iviewer_rotate_right iviewer_common iviewer_button"></div>\
                        </div>\
                    </div>\
                </header>';

            }else if(settings.theme === 'poplayer'){
                var $wrapper = $('<div class="zoomboxWrapper zoombox-poplayer"></div>');

                var control_ui = '<div class="light-control">\
                    <a href="javascript:;" class="zoom-in-light light-btn iviewer_zoom_in"></a>\
                    <a href="javascript:;" class="zoom-out-light light-btn iviewer_zoom_out"></a>\
                </div>\
                <a href="javascript:;" class="light-close"></a>';
            }

            $('body').append($wrapper);
            $wrapper.append(control_ui);



            var $zoombox = $('<div class="viewer"></div>');
            $wrapper.append($zoombox);

            var $image = $('<img>').css({position: "absolute", top: "0px", left: "0px", display:"none" });
            $loading = $('<img class="loading" src="img/spinner.gif">');

            if(settings.srcArray.length > 0){
                $image.attr('src', settings.srcArray[settings.currentIndex].src);
            }else if(settings.src !== ''){
                $image.attr('src', settings.src);
            }else{
                return;
            }

            $zoombox.html($image);

            var ConatainerW, ConatainerH, ImageW, ImageH, ImageOffsetX, ImageOffsetY, zoomPercent, angle;

            $image.load(function(){
                $('.loading').hide();

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
            $('.iviewer_zoom_in').click(function(){
                zoomIn(0.2);
            });

            $('.iviewer_zoom_out').click(function(){
                zoomOut(0.2);
            });

            $('.iviewer_zoom_zero').click(function(){
                zoomOriginal();
            });

            $('.iviewer_zoom_fit').click(function(){
                zoomFit();
            });

            $('.iviewer_rotate_left').click(function(){
                rotateLeft(); 
            });
            $('.iviewer_rotate_right').click(function(){
                rotateRight(); 
            }); 

            $('.light-close').live('click', function(){
                console.log(222);
                $wrapper.remove();
            });

            $('.iviewer_next').click(function(){
                if(settings.currentIndex >= settings.srcArray.length) {return}
                settings.currentIndex++;
                $image.attr('src', settings.srcArray[settings.currentIndex].src);
            });
            $('.iviewer_prev').click(function(){
                if(settings.currentIndex <= 0) {return}
                settings.currentIndex--;
                $image.attr('src', settings.srcArray[settings.currentIndex].src);
            });            
        })
    }


})(jQuery);