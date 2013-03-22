   $(function(){
        
        var content = $('#content');
        var generateSquare = function(k, x, y,z){
            if (!k) k = 1;
            if (!x) x = 1;
            if (!y) y =-1;
            if (!z) z = 1;
            var zindex =z;
            z = z/10;
            //create
            var square = $('<div class="square">');
            
            var width = content.width()*0.1*k;
            var height = content.height()*0.1*k;
            if (width > height) width = height;
            else height = width;
            square.css({
                width: width,
                height: height,
            });
            

            content.append(square);

            var realOffsets = square.offset();            
            
            x = realOffsets.top+getRandomOffset()*x;
            y = realOffsets.left+getRandomOffset()*y;
            square.css({
                top: x,
                left: y,
                'z-index': zindex,
            })
            .data('data', {z:z,x:x, y:y});
            return square;
        }
        
        var getRandomOffset = function(){
            var a = Math.random();
            return (parseInt(a)||parseInt(a*10)||parseInt(a*100))*2;
        }
        
        var getCenter = function(){
            var d = $(document);
            return {x: d.width()/2, y: d.height()/2};
        }
        
        $(document).mousemove(function(){
              var coords = {x:event.pageX, y:event.pageY};
              $('.square').each(function(i,square){moveSquare($(square), coords);});
        });
        
        var center = getCenter();
        $(window).resize(function(){
            center = getCenter();
        });
        var moveSquare = function(square, coords) {
            var data = square.data('data');
            var offsetX = parseInt((coords.x - center.x)*data.z);
            var offsetY = parseInt((coords.y - center.y)*data.z);
            square.css({'top': data.x+offsetY, 'left': data.y+offsetX});
        }
        generateSquare(1,1,-1,1);
        generateSquare(1,-1,1,2);
        generateSquare(2,-2,1,3);
        generateSquare(2.3,2,-1,5);
        var lastSquare = generateSquare(3,-3.5,1,6);
        lastSquare.css('font-size', (parseInt(lastSquare.css('height'))/2));
        lastSquare.text('404');
    });
