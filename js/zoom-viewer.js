(function ($) {

    $.fn.zoomViewer = function (options) {


        return this.each(function () {

            $image = $(this);

            // 声明变量
            var ConatainerW, ConatainerH, ImageW, ImageH, ImageOffsetX, ImageOffsetY, zoomPercent, angle;
            var $body, $wrapper, $zoombox, $image, $loading, $docDownload, $alert;


            $wrapper = $('.js_zvWrapper');
            $zoombox = $('.zv_viewer');

            // Init wrapper style
            $body = $('body');

            $image.css({position: "absolute", top: "0px", left: "0px", display: "none", cursor: "-webkit-grab"});
            $loading = $('<img class="zv_loading" src="http://dui.dooioo.com/public/js/plugs/zoom-viewer/img/spinner.gif">');

            $alert = $('<div class="zv_alert"></div>');

            $wrapper.append($docDownload);
            $wrapper.append($alert);
            $body.append($loading);

            $image.load(function () {

                // 初始化图片
                $image.css({position: "absolute", top: "0px", left: "0px", width: '', height: '', '-webkit-transform': 'rotate(0deg)'});

                $loading.hide();
//                $image.show();

                ConatainerW = $zoombox.width() + 370;
                ConatainerH = $zoombox.height();

                ImageW = $image.width();
                ImageH = $image.height();

                ImageOffsetX = 0;
                ImageOffsetY = 0;

                zoomPercent = 0;
                angle = 0;

                if (ConatainerW / ConatainerH > ImageW / ImageH) {
                    var changedHeight = ConatainerH <= ImageH ? ConatainerH : ImageH;
                    var changedWidth = changedHeight * ImageW / ImageH;
                } else {
                    var changedWidth = ConatainerW <= ImageW ? ConatainerW : ImageW;
                    var changedHeight = changedWidth * ImageH / ImageW;
                }

                ImageOffsetY = (ConatainerH - changedHeight) / 2;
                ImageOffsetX = (ConatainerW - changedWidth) / 2;

                $image.css({
                    'width': changedWidth,
                    'height': changedHeight,
                    'left': ImageOffsetX,
                    'top': ImageOffsetY
                });
                zoomPercent = $image.width() / ImageW;

            }).error(function () {
                $loading.remove();
                $image.hide();

                $docDownload.show();

                if (settings.theme === 'poplayer') {
                    $docDownload.html('该图片无大图');
                } else {
                    $docDownload.html('该图片无法查看');
                }
            });

//            changeFile(settings.src[settings.currentIndex].src, settings.src[settings.currentIndex].title)
            // $image.attr({'src':settings.src[settings.currentIndex].src, 'title':settings.src[settings.currentIndex].title});


            function zoomImg($image, percent) {

                ImageOffsetX -= (ImageW * percent - $image.width()) / 2;
                ImageOffsetY -= (ImageH * percent - $image.height()) / 2;

                $image.css({
                    'width': ImageW * percent,
                    'height': ImageH * percent,
                    'left': ImageOffsetX,
                    'top': ImageOffsetY
                });
            }

            // 放大
            function zoomIn($image, range) {
                zoomPercent += range;
                zoomImg($image, zoomPercent);
            }

            // 缩小
            function zoomOut($image, range) {
                if (zoomPercent <= range) {
                    return;
                }

                // Todo: 缩小时往中心靠拢
                if ($image.width() - $zoombox.width() <= 100) {
                    ImageOffsetX = (ConatainerW - $image.width()) / 2;
                    ImageOffsetY = (ConatainerH - $image.height()) / 2;
                }

                zoomPercent -= range;
                zoomImg($image, zoomPercent);
            }

            function zoomFit($image) {

                if (ConatainerW / ConatainerH > ImageW / ImageH) {
                    var changedHeight = ConatainerH <= ImageH ? ConatainerH : ImageH;
                    var changedWidth = changedHeight * ImageW / ImageH;
                } else {
                    var changedWidth = ConatainerW <= ImageW ? ConatainerW : ImageW;
                    var changedHeight = changedWidth * ImageH / ImageW;
                }

                ImageOffsetY = (ConatainerH - changedHeight) / 2;
                ImageOffsetX = (ConatainerW - changedWidth) / 2;

                $image.css({
                    'width': changedWidth,
                    'height': changedHeight,
                    'left': ImageOffsetX,
                    'top': ImageOffsetY
                });

                zoomPercent = $image.width() / ImageW;

            }

            function zoomOriginal($image) {
                ImageOffsetY = (ConatainerH - ImageH) / 2;
                ImageOffsetX = (ConatainerW - ImageW) / 2;

                $image.css({
                    'width': ImageW,
                    'height': ImageH,
                    'left': ImageOffsetX,
                    'top': ImageOffsetY
                });
                zoomPercent = $image.width() / ImageW;
            }

            // Rotate Event
            function rotateLeft($image) {
                angle -= 90;
                $image.css('-webkit-transform', 'rotate(' + angle + 'deg)');
            }

            function rotateRight($image) {
                angle += 90;
                $image.css('-webkit-transform', 'rotate(' + angle + 'deg)');
            }

            function changeFile(src, title) {
                $loading.show();


                var imgTypeExp = /\.(jpg|jpeg|bmp|gif|png)$/i;

                if (imgTypeExp.test(src)) {
                    // 图片类型
                    $image.hide();
                    $docDownload.hide();

                    $image.attr({'src': src, 'title': title});
                    // $image.trigger('load');
                } else {
                    // 其他类型
                    $image.hide();
                    $loading.hide();
                    $docDownload.html('非图片类型文件，请点击下载后查看：<a href="' + src + '" download="' + title + '">' + title + '</a>');
                    $docDownload.show();
                }
            }


            // Mousewheel Event
            $image.bind('mousewheel', function (event) {
                event.preventDefault();

                if (event.wheelDelta > 0) {
                    zoomOut($(this),0.1);
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


        })
    }


})(jQuery);