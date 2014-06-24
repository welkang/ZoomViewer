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

                // Init
                ConatainerW = $zoombox.width() + 370;
                ConatainerH = $zoombox.height();


                ImageOrginW = $image.width();
                ImageOriginH = $image.height();

                ImageOffsetX = 0;
                ImageOffsetY = 0;

                zoomPercent = 0;
                angle = 0;
                /**
                 * 对外公开事件接口
                 * 通过$image.trigger('eventName')触发
                 */
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

                zoomFit($image);

                // Mousewheel Event
                $image.bind('mousewheel', function (event) {
                    event.preventDefault();

                    if (event.wheelDelta > 0) {
                        zoomOut($(this), 0.1);
                    } else {
                        zoomIn($(this), 0.1);
                    }
                });

                // Drag Move Event
                $image.bind('mousedown', function (e) {
                    e.preventDefault();
                    $image.css('cursor', '-webkit-grabbing');
                    var last = e;

                    function drag(e) {
                        e.preventDefault();
                        ImageOffsetX += (e.pageX - last.pageX);
                        ImageOffsetY += (e.pageY - last.pageY);
                        last = e;

                        $image.css({'left': ImageOffsetX, 'top': ImageOffsetY});
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
            })
//            if ($image.get(0).complete) {
//            } else {
//                $image.one('load', loaded);
//            }
        })
    }


})(jQuery);