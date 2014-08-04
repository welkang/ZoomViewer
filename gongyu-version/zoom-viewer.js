(function ($) {

    $.fn.zoomViewer = function (options) {


        return this.each(function () {

            /**
             * 声明变量
             */
            var ConatainerW, ConatainerH, ImageOrginW, ImageOriginH, ImageOffsetX, ImageOffsetY, zoomPercent, angle;
            var $body, $wrapper, $zoombox, $image, $loading, $docDownload, $alert;
            var currentIndex = 0;
            $body = $('body');
            $wrapper = $('.js_zvWrapper');
            $zoombox = $('.zv_viewer');
            $image = $(this);
            $alert = $('.zv_alert');

            function loaded() {

                $image.closest('div').removeClass('loading-bg');
                $image.show();
                // Init
                ConatainerW = $zoombox.width();
                ConatainerH = $zoombox.height();


                ImageOrginW = $image.get(0).width;
                ImageOriginH = $image.get(0).height;
                console.log($image);
                console.log(ImageOrginW);

                ImageOffsetX = 0;
                ImageOffsetY = 0;

                zoomPercent = 0;
                angle = 0;
                /**
                 * 对外公开事件接口
                 * 通过$image.trigger('eventName')触发
                 */
                $image.unbind({
                    'zoom-in': zoomIn,
                    'zoom-out': zoomOut,
                    'zoom-fit': zoomFit,
                    'zoom-original': zoomOriginal,
                    'rotate-left': rotateLeft,
                    'rotate-right': rotateRight
                });

                $image.bind({
                    'zoom-in': zoomIn,
                    'zoom-out': zoomOut,
                    'zoom-fit': zoomFit,
                    'zoom-original': zoomOriginal,
                    'rotate-left': rotateLeft,
                    'rotate-right': rotateRight
                });

                // 缩放图片
                function zoomImg(percent) {
                    // 设置最小缩放到
                    if(ImageOrginW * percent <= 100 || ImageOriginH * percent <= 100){
                        return;
                    }

                    ImageOffsetX -= (ImageOrginW * percent - $image.width()) / 2;
                    ImageOffsetY -= (ImageOriginH * percent - $image.height()) / 2;

                    $image.css({
                        'width': ImageOrginW * percent,
                        'height': ImageOriginH * percent,
                        'left': ImageOffsetX,
                        'top': ImageOffsetY
                    });
                }

                // 放大
                function zoomIn() {
                    zoomPercent += 0.2;
                    zoomImg(zoomPercent);
                }

                // 缩小
                function zoomOut() {
                    if (zoomPercent <= 0.2) {
                        return;
                    }

                    // Todo: 缩小时往中心靠拢
                    if ($image.width() - $zoombox.width() <= 100) {
                        ImageOffsetX = (ConatainerW - $image.width()) / 2;
                        ImageOffsetY = (ConatainerH - $image.height()) / 2;
                    }

                    zoomPercent -= 0.2;
                    zoomImg(zoomPercent);
                }

                // 适应屏幕
                function zoomFit() {

                    if (ConatainerW / ConatainerH > ImageOrginW / ImageOriginH) {
                        var changedHeight = ConatainerH <= ImageOriginH ? ConatainerH : ImageOriginH;
                        var changedWidth = changedHeight * ImageOrginW / ImageOriginH;
                    } else {
                        var changedWidth = ConatainerW <= ImageOrginW ? ConatainerW : ImageOrginW;
                        var changedHeight = changedWidth * ImageOriginH / ImageOrginW;
                    }

                    ImageOffsetY = (ConatainerH - changedHeight) / 2;
                    ImageOffsetX = (ConatainerW - changedWidth) / 2;

                    $image.css({
                        'width': changedWidth,
                        'height': changedHeight,
                        'left': ImageOffsetX,
                        'top': ImageOffsetY
                    });

                    zoomPercent = $image.width() / ImageOrginW;

                }

                // 原图大小
                function zoomOriginal() {
                    ImageOffsetY = (ConatainerH - ImageOriginH) / 2;
                    ImageOffsetX = (ConatainerW - ImageOrginW) / 2;

                    $image.css({
                        'width': ImageOrginW,
                        'height': ImageOriginH,
                        'left': ImageOffsetX,
                        'top': ImageOffsetY
                    });
                    zoomPercent = $image.width() / ImageOrginW;
                }

                // 向左翻转
                function rotateLeft() {
                    angle -= 90;
                    $image.css('-webkit-transform', 'rotate(' + angle + 'deg)');
                }

                // 向右翻转
                function rotateRight() {
                    angle += 90;
                    $image.css('-webkit-transform', 'rotate(' + angle + 'deg)');
                }

                // 获得bottom距离
                function getBottom(){
                    return $zoombox.height()-($image.height() + parseInt($image.css('top')));
                }
                // 获得right距离
                function getRight(){
                    return $zoombox.width()-($image.width() + parseInt($image.css('left')));
                }

                zoomFit($image);

                // Mousewheel Event
                /*
                 $image.bind('mousewheel', function (event) {
                 event.preventDefault();

                 if (event.wheelDelta > 0) {
                 zoomOut($(this), 0.1);
                 } else {
                 zoomIn($(this), 0.1);
                 }
                 });
                 */

                // Drag Move Event
                $image.bind('mousedown', function (e) {
                    e.preventDefault();
                    $image.css('cursor', '-webkit-grabbing');
                    var last = e;

                    function drag(e) {
                        e.preventDefault();
                        // 判断水平拖动方向
                        if(e.pageX - last.pageX > 0 && parseInt($image.css('left')) < 0){
                            console.log('向右')
                            ImageOffsetX += (e.pageX - last.pageX);
                        }else if(e.pageX - last.pageX < 0 && getRight() < 0){
                            ImageOffsetX += (e.pageX - last.pageX);
                        }
                        // 判断垂直拖动方向
                        if(e.pageY - last.pageY > 0 && parseInt($image.css('top')) < 0){
                            console.log('向下')
                            ImageOffsetY += (e.pageY - last.pageY);
                        }else if(e.pageY - last.pageY < 0 && getBottom() < 0){
                            ImageOffsetY += (e.pageY - last.pageY);
                        }

                        last = e;
                        console.log($image.css('top'));
                        console.log($image.css('bottom'));
                        console.log(ImageOffsetX+'----'+ImageOffsetY);
                        $image.css({'left': parseInt(ImageOffsetX), 'top': parseInt(ImageOffsetY)});
                    }

                    $(document)
                        .bind('mousemove', drag)
                        .one('mouseup', function () {
                            $image.css('cursor', '-webkit-grab');
                            $(document).unbind('mousemove', drag);
                        });
                });
            }

            $image.load(function () {
                loaded();
            });
//            $image.one('load', loaded);

        })
    }


})(jQuery);