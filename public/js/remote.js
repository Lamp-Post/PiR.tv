var apiKey = 'AIzaSyDQXRRdSNZcPoG8lidNcmDfcYUsbEZ_VnM';
googleApiClientReady = function() {
  gapi.auth.init(function() {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(loadAPIClientInterfaces, 1);
  });
}
function loadAPIClientInterfaces() {
  $('.pre-auth').hide();
  $('.post-auth').show();
  gapi.client.load('youtube', 'v3', function() {
  });
}

var host = document.location.origin;
var socket = io.connect(host); 
    socket.on('connect', function(data){
        socket.emit('remote');

        //Youtube
        var Youtube = {
            getVideo: function(query, socket){
                var request = gapi.client.youtube.search.list({
                    q: query,
                    part: 'snippet',
                    maxResults: 12
                });

                request.execute(function(response) {
                    $("ul.video").html("");
                    var jsonObj = [];

                    var srchItems = response.result.items;                      
                    $.each(srchItems, function(index, item) {
                        id = item.id.videoId;
                        console.log(id);
                        title = item.snippet.title;  
                        thumbnail =  item.snippet.thumbnails.default.url;                 
                        var duration = "0"

                        jsonObj = {
                            id:id,
                            title:title,
                            thumbnail:thumbnail,
                            duration:duration};


                        var template = $('#videoTpl').html(),
								html = Mustache.to_html(template, jsonObj);
                        $('ul.video').append(html);	

                    });
                    $(".watch").on("click",function(){
                        var video_id = $(this).data('id');
                        socket.emit('video',{action:"play", video_id:video_id});
                        load_control();
                    });
                });

            }
        }		

        $$(".r-container").swipeLeft(function(){
            socket.emit('controll',{action:"swipeLeft"}); 
        });

        $$(".r-container").swipeRight(function(){
            socket.emit('controll',{action:"swipeRight"}); 
        });
        $$(".r-header").tap(function(){
            socket.emit('controll',{action:"tap"}); 
            $(".app-body").fadeToggle("fast", function () {});
			$.get(host+'/omx/quit',function(data){
					console.log(data);
			});
        });
        $$(".app-body").tap(function(){
			$.get(host+'/omx/pause',function(data){
					console.log(data);
			});
        });
        $(".search input").change(function() {
            Youtube.getVideo($(this).val(), socket);
        });

        socket.on("loading", function(data){
            console.log(data);
        })	  
    });

