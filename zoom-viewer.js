/**
 *
 * zoom-in
 * zoom-out
 * rotate-left
 * rotate-right
 * prev
 * next 
 *
 */

/*
    ConatainerW
    ConatainerH

    ImageW
    ImageH
    ImageOffsetX
    ImageOffsetY
*/

(function($){

    $.fn.zoomViewer = function(options){

        var settings = $.extend({}, options);

        return this.each(function(){

            $zoombox = $(this);
            $image = $(this).find('img');
            var ConatainerW = $zoombox.width();
            var ConatainerH = $zoombox.height();

            var ImageW = $image.width();
            var ImageH = $image.height();

            var ImageOffsetX = 0;
            var ImageOffsetY = 0;

            var zoomPercent = 0;
            var angle = 0;

            if(ImageW >= ImageH){ // landscape
                $image.width(ConatainerW <= ImageW ? ConatainerW : ImageW);
                ImageOffsetY = (ConatainerH - $image.height())/2;
                $image.css('top', ImageOffsetY);
            }else{ // portrait
                $image.height(ConatainerH <= ImageH ? ConatainerH : ImageH);
                ImageOffsetX = (ConatainerW - $image.width())/2;
                $image.css('left', ImageOffsetX);
            }

            zoomPercent = $image.width()/ImageW;

            function zoomImg (img, percent) {
                // body...
                ImageOffsetX -= (ImageW*percent - img.width())/2;
                ImageOffsetY -= (ImageH*percent - img.height())/2;

                img.width(ImageW*percent);
                img.height(ImageH*percent);

                img.css('left', ImageOffsetX);
                img.css('top', ImageOffsetY);
            }


            // Mousewheel Event
            $zoombox.bind('mousewheel', function(event){

                if(event.wheelDelta > 0){
                    zoomPercent += 0.1;
                    zoomImg($image, zoomPercent);
                }else{
                    if(zoomPercent <= 0.1){
                        return;
                    }


                    // Todo: 缩小时往中心靠拢
                    if($image.width() - $zoombox.width() <= 100){
                        ImageOffsetX = (ConatainerW-$image.width())/2;
                        ImageOffsetY = (ConatainerH-$image.height())/2;
                    }

                    zoomPercent -= 0.1;
                    zoomImg($image, zoomPercent);
                }
            });


            // Drag Move Event
            $zoombox.get(0).onmousedown = function(e){
                var last = e;
                e.preventDefault();

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
                    $(document).unbind('mousemove', drag);
                });
            };


            // Rotate Event
            function rotateLeft(argument){
                // body...
                angle -= 90;
                $image.css('-webkit-transform', 'rotate('+angle+'deg)');
            }
            function rotateRight(argument){
                // body...
                angle += 90;
                $image.css('-webkit-transform', 'rotate('+angle+'deg)');
            }

            // $('.js_rotateLeft').click(function(){
            //     rotateLeft(); 
            // })
            // $('.js_rotateRight').click(function(){
            //     rotateRight(); 
            // })            

        })
    }


})(jQuery);