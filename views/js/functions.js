var map;
var googleObj;
var markersArray = [];
var script_tag;

function unloadMap(){
    if(window.google !== undefined && google.maps !== undefined){
        delete google.maps;
        $("script").each(function(){
            if(this.src.indexOf("googleapis.com/maps") >= 0 || this.src.indexOf("maps.gstatic.com") >= 0 || this.src.indexOf("earthbuilder.googleapis.com") >= 0){
                $(this).remove();
            }
        });
    }
}

function clearMap(){
    for(var i = 0; i < markersArray.length; i++ ){
        markersArray[i].setMap(null);
    }

    markersArray.length = 0;
}

function updateMap(array){
    clearMap();
    
    array.forEach(function(row){
        markersArray.push(new googleObj.maps.Marker({
            position: {
                lat: row.lat,
                lng: row.lng
            },
            map: map,
            title: row.date
        }));
    });
}