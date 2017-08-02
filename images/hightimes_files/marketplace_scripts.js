var map;

var markers = [];

var markersid = [];

var nelat;

var nelng;

var swlat;

var swlng;

var styles = [{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"hue":"#f49935"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"hue":"#fad959"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"hue":"#a1cdfc"},{"saturation":30},{"lightness":49}]}];

var loc_dialog_left = 100;

var dialog = $("#location-dialog").dialog({

    autoOpen: false,

    height: 234,

    width: 320,

    modal: true,

    resizable: false,

    draggable: false,

    dialogClass: 'location-dialog',

    appendTo: "#marketplace-map-section",
});

$(document).ready(function(){

    var mplace_width = $("#map_width").val();

    var mplace_width_val = mplace_width+'px';

    if(mplace_width.indexOf("%") != -1)

    {

        mplace_width_val = mplace_width;

    }

    var mplace_height = $("#map_height").val();

    var mplace_height_val = mplace_height+'px';

    if(mplace_height.indexOf("%") != -1)

    {

        mplace_height_val = mplace_height;

    }

    $("#marketplace-map-section").css('width',mplace_width_val);

    $("#marketplace-map-section").css('height',mplace_height_val);

    addmarketplaceclass();

    if(document.cookie.indexOf("user_city") > 0)

    {

        var usercityval = getCookie('user_city');

        usercityval = usercityval.replace('+',' ');;

        $("#user_city").val(usercityval);

    }

    if(document.cookie.indexOf("user_state") > 0)

    {

        var userstateval = getCookie('user_state');

        userstateval = userstateval.replace('+',' ');;

        $("#user_state").val(userstateval);

    }

    /*if($("#user_city").val()=='')

    {

        $("#user_city").val('Seattle');

        $("#user_state").val('Washington');

    }*/

    initialise_map();

	

	// manual location change script

    $(".location-box").click(function(e){

        e.stopPropagation();

        open_city_dialog();

        return false;

    });

    

    // top city click script

    $(".top-locations a").click(function(){

        var city_name = $(this).html();

        dialog.dialog("close");

        $.ajax({

            type: "POST",

            url: "https://www.wikileaf.com/common/checklocation/",

            data: {city_name: city_name},

            success: function(statename) {

                if(statename=='')

                {

                    open_city_dialog();

                    return false;

                }else{

                    if($(".marketplacepage").length >0)

                    {

                        var usercityname=city_name.toLowerCase();

                        usercityname=usercityname.replace(' ','-');

                        usercityname=usercityname.replace(/[^a-z0-9\-]/gi, '');

                        var userstatename=statename.toLowerCase();

                        userstatename=userstatename.replace(' ','-');

                        userstatename=userstatename.replace(/[^a-z0-9\-]/gi, '')

                        var usercityurl=sitepath+"dispensary/in/"+userstatename+"/"+usercityname+"/";

                        window.location.href = usercityurl;

                    }

                    $("#user_city").val(city_name);

                    $("#user_state").val(statename);

                    initialise_map();

                    storecity(city_name,statename);

                    return false;

                }

            },

            fail: function() {

                

            }

        });

        return false;

    });

    // search city script

    var autocomplete;

    var city_input = document.getElementById('txt_city');

    var autocomplete_options = {

        /*componentRestrictions: {

            'country':'us'

        },*/

        types: ['(regions)'] // (cities)

    };

    autocomplete = new google.maps.places.Autocomplete(city_input,autocomplete_options);

    autocomplete.addListener('finished', function() {

        console.log("hii");

    });

    autocomplete.addListener('place_changed', function() {

        dialog.dialog( "close" );

        console.log(autocomplete.getPlace());

        var user_city ="";

        var user_state ="";

        if(autocomplete.getPlace().types[0]=='postal_code')

        {

            user_city = autocomplete.getPlace().address_components[1].long_name;

            user_state = autocomplete.getPlace().address_components[3].long_name;

            if(autocomplete.getPlace().address_components[3].types[0]=='country')

            {

               user_state = autocomplete.getPlace().address_components[2].long_name; 

            }

        }

        else if(autocomplete.getPlace().types[0]=='locality')

        {

            user_city = autocomplete.getPlace().address_components[0].long_name;

            user_state = autocomplete.getPlace().address_components[2].long_name;

        }

        else if(autocomplete.getPlace().types[0]=='administrative_area_level_1')

        {

            user_city = autocomplete.getPlace().address_components[0].long_name;

            user_state = autocomplete.getPlace().address_components[1].long_name;

        }

        $("#user_location").html(user_city);

        if($(".homepage").length > 0 || $(".marketplacepage").length >0)

        {

            $("#user_location_mobile").html(user_city);

        }

        if($(".wp_marketplacepage").length>0)

        {

            $(".weight-filter #user_location").html(user_city);

            $(".location-label").show();

        }

        $("#txt_city").val('');

        $("#user_city").val(user_city);

        $("#user_state").val(user_state);

        $("#user_zip").val('');

        storecity(user_city,user_state);

        initialise_map();

    });

    // gram change script

    $(".filter-box,#user_weight").click(function(){

        if($(".weight-filter .filter-options").is(":hidden"))

        {

            $(".weight-filter .filter-options").slideDown(500);

        }

        else

        {

            $(".weight-filter .filter-options").slideUp(500);

        }

        return false;

    });

    /*$('html').click(function() {

        $(".weight-filter .filter-options").slideUp(500);

    });

    $(".weight-filter").click(function(e){

        e.stopPropagation();

    });

    $(".filter-box").click(function(e){

        e.stopPropagation();

    });*/

    $(".weight-filter .filter-options li").click(function(){

        if(!$(this).hasClass('active')) 

        {

            var weightid= $(this).attr('id');

            var weighttext = $(this).html();

            weightid = weightid.split("weight-");

            var weight = weightid[1];

            $("#user_weight").attr('rel',weight);

            $("#user_weight").html(weighttext);

            $(".weight-filter .filter-options li").removeClass('active');

            $(this).addClass('active');

            $(".weight-filter .filter-options").hide();

            $(".spinner-box").show();

            search_for_markers(nelat,nelng,swlat,swlng,1,0);

        }

        return false;

    });

});

$(window).resize(function(){

    addmarketplaceclass();

});

function addmarketplaceclass(){

    var mclass="default";

    var marketplacewidth = $("#marketplace-map-section").width();

    if(marketplacewidth>1365)

    {

       mclass="large"; 

    }

    if(marketplacewidth<1000)

    {

       mclass="small"; 

    }

    if(marketplacewidth<768)

    {

       mclass="x-small"; 

    }

    if(marketplacewidth<500)

    {

       mclass="x-small xx-small"; 

    }

    if(marketplacewidth<350)

    {

       mclass="x-small xx-small xxx-small"; 

    }

    $("#marketplace-map-section").removeClass('default').removeClass('large').removeClass('small').removeClass('x-small').removeClass('xx-small').removeClass('xxx-small').addClass(mclass);

}

function open_city_dialog(){

    dialog.dialog("open");

    if($(window).width()>767)

    {

        $(".location-dialog").css('left',loc_dialog_left+'px');

    }

    $("#txt_city").val('');

    if($("#user_city").val()!='' && $("#user_state").val()!='')

    {

        $('html').click(function() {

            dialog.dialog("close");

        });

        $("#location-close").click(function() {

            dialog.dialog("close");

        });

        $("#location-dialog").click(function(e){

            e.stopPropagation();

        });

        $(".location-box").click(function(e){

            e.stopPropagation();

        });

    }

    /*setTimeout(function(){

        $("#txt_city").focus();

    },1000);*/

}

function initialise_map(){

    var zControl = true;

    var scrollwheel = false;

    var zontrolpos = google.maps.ControlPosition.RIGHT_BOTTOM;

    var isDraggable = $(document).width() > 640 ? true : false;

    var zlevel = $(document).width() > 767 ? 14 : 12;

    var myOptions = {

        zoom: zlevel,

        scrollwheel: scrollwheel,

        disableDefaultUI: true,

        zoomControl: zControl,

        zoomControlOptions: {

              position: zontrolpos

        }

    }

    

    // intialise blank map

    map = new google.maps.Map(document.getElementById("marketplace-map-box"), myOptions);

    var geocoder = new google.maps.Geocoder();

    

    // check if city is already stored in cookie

    if($("#user_city").val()!='' && $("#user_state").val()!='')

    {

        var address = $("#user_city").val()+","+$("#user_state").val();

        $("#user_location").html($("#user_city").val());

        if (geocoder) 

        {

            geocoder.geocode({ 'address': address}, function (results, status) {

                if(status == google.maps.GeocoderStatus.OK) 

                {

                    console.log(results);

                    var latitutde=results[0].geometry.location.lat();

                    var longitude=results[0].geometry.location.lng();

                    set_map_position(latitutde,longitude);

                }

            });

        }    

    }

    else if(navigator.geolocation)

    {

       

        navigator.geolocation.getCurrentPosition(function(position) 

        {

            var latitutde=position.coords.latitude;

            var longitude=position.coords.longitude;

            var latlng = new google.maps.LatLng(latitutde, longitude);

            geocoder.geocode({ 'location': latlng}, function (results, status) {

                if (status == google.maps.GeocoderStatus.OK) 

                {

                    /*console.log(results);*/

                    var city_name;

                    for (j = 0; j < results.length; j++) {

                    if (results[j].types[0] === "locality")

                        city_name=results[j].address_components[0].short_name;

                    }

                    $.ajax({

                        type: "POST",

                        url: "https://www.wikileaf.com/common/checklocation/",

                        data: {city_name: city_name},

                        success: function(statename) {

                            if(statename=='')

                            {

                                open_city_dialog();

                            }

                            else{

                                $("#user_city").val(city_name);

                                $("#user_location").html(city_name);

                                $("#user_state").val(statename);

                                set_map_position(latitutde,longitude);

                                storecity(city_name,statename);

                            }

                        },

                    });

                }

                else{

                    open_city_dialog();

                }

            });

        },function() {

            open_city_dialog();

        },{timeout:10000});

    }

    else{

        /*open_city_dialog();*/

    }

}

function set_map_position(latitutde,longitude)

{

    var pos = new google.maps.LatLng(latitutde, longitude);

    map.setCenter(pos);

    map.setOptions({styles: styles});

    var usermarker = new MarkerWithLabel({

        map: map,

        position: pos,

        icon: "https://www.wikileaf.com/assets/images/marker.png"

    });

    if($(window).width()>767)

    {

        var circle = new google.maps.Circle({

            map: map,

            radius: 1609,    // 1 miles in metres

            strokeColor: '#4285F4',

            strokeOpacity: 0.5,

            strokeWeight: 1,

            fillColor: '#4285F4',

            fillOpacity: 0.35,

        });

        circle.bindTo('center', usermarker, 'position');

    }

    google.maps.event.addListener(map, 'idle', function() {

        var bounds =  map.getBounds();

        var ne = bounds.getNorthEast();

        var sw = bounds.getSouthWest();

        nelat=ne.lat();

        nelng=ne.lng();

        swlat=sw.lat();

        swlng=sw.lng();

        search_for_markers(nelat,nelng,swlat,swlng,0,0);

        //alert(markersid);

    });

}

function search_for_markers(nelat,nelng,swlat,swlng,weight_change,order_change){

    var weight =2;

    var strainid = 0;

    var sortorder = "";

    var targetblank = 0;

	var weight = $("#user_weight").attr('rel');

    if(order_change==0)

    {

        $.ajax({

            type: "POST",

            url: "https://www.wikileaf.com/common/load_markers/",

            data: {nelat: nelat,nelng: nelng,swlat: swlat,swlng: swlng,weight: weight,strainid: strainid},

            dataType: "json",

            success: function(markerdata) {

                if(markerdata!='')

                {

                    $(".spinner-box").hide();

                    for (var i = 0; i < markerdata.length; i++) {

                        var locations = markerdata[i];

                        var latlng = new google.maps.LatLng(parseFloat(locations['lat']),parseFloat(locations['lng']));

                        if(weight_change==0)

                        {

                            if($.inArray(locations['did'], markersid) == -1)

                            {

                                createmarker(locations['did'], locations['name'], locations['slug'], locations['phone'], locations['city_slug'], locations['state_slug'], latlng,locations['icon'], locations['image'], locations['type'], locations['price'], locations['store'], locations['oid']);

                            }

                        }

                        else

                        {

                            createmarker(locations['did'], locations['name'], locations['slug'], locations['phone'], locations['city_slug'], locations['state_slug'], latlng,locations['icon'], locations['image'], locations['type'], locations['price'], locations['store'], locations['oid']);

                        }

                    }

                }

                else

                {

                    $(".spinner-box").hide();

                }

            },

        });

    }

}

function createmarker(disp_id,disp_name,disp_slug,disp_phone,disp_city_slug,disp_state_slug,disp_latlng,disp_icon,disp_photo,disp_type,weight_price,store_type,oid){ 

    var target='target="_blank"';

    var gram_price;

    var weightname = $("#user_weight").html();

    gram_price = "<sup>$</sup>"+weight_price;

    var gramprice2;

    gram_price2 = "$"+weight_price;

    if(weight_price==0 || weight_price=='0.00')

    {

        gram_price = "NA";

        gram_price2 = "NA";

    }

	var marker = new MarkerWithLabel({

		map: map,

		position: disp_latlng,

		icon: "https://www.wikileaf.com/assets/images/none.png",

		id: disp_id,

        labelContent: gram_price,

        /*labelAnchor: new google.maps.Point(0, 0),*/

        labelClass: "markers "+disp_icon

  	});

    var disp_url;

    if(disp_slug!='' && disp_city_slug!='' && disp_state_slug!='')

    {

        disp_url="https://www.wikileaf.com/dispensary/"+disp_state_slug+"/"+disp_city_slug+"/"+disp_slug+"/";

    }

    var disp_short_name;

    if(disp_name.length > 22){

        disp_short_name=disp_name.substr(0,22)+'..';

    }else{

        disp_short_name=disp_name;

    }

    var infowindow_data='<div class="windowbox cf '+oid+'" onclick="redirectuser('+oid+')"><div class="windowbox-top cf">';

    if(disp_photo==null){

    infowindow_data+="<div class='windowbox-img'><img src='https://www.wikileaf.com/assets/images/noimage.svg'/></div>";

    }else{

    infowindow_data+="<div class='windowbox-img'><img src='https://www.wikileaf.com/assets/photogallery/"+disp_photo+"'/></div>";    

    }

    infowindow_data+="<div class='windowbox-info'><input type='hidden' id='dispurl"+oid+"' value='"+disp_url+"'/>";

    infowindow_data+="<div class='disptitle'>"+disp_short_name+"</div>";

    infowindow_data+="<div class='disptype "+store_type+"'>"+store_type+"</div><div class='dispprice'><span>"+gram_price2+"</span> avg price for "+weightname+"</div></div></div>";

    infowindow_data+="</div><div class='clear'></div></div>";

    

    var leftoffset = -165;

    var topoffset = -102;

    if($("#marketplace-map-section").hasClass('xxx-small'))

    {

       leftoffset = -162;

         /*topoffset = -129;*/

    }

    var infoboxid="infobox"+disp_id;

    infoboxid = new InfoBox({

         content: infowindow_data,

         disableAutoPan: false,

         maxWidth: 250,

         pixelOffset: new google.maps.Size(leftoffset, topoffset),

         zIndex: null



    });

	google.maps.event.addListener(marker, 'click', function() {

        /*if($(window).width() < 768)

        {

            $("#infowindow-mobile").show();

            $("#infowindow-mobile").html(infowindow_data_mobile);

            $('.map-box').click(function(){

                $("#infowindow-mobile").hide();

                resetmarkers();

            });

            $("#infowindow-mobile").click(function(){

                window.open($(this).find(".disptitle a").attr("href"), '_blank');

            })

        }

        else{*/

            $(".infoBox").hide();

            infoboxid.open(map, this);

            $('html').click(function(e){

                e.stopPropagation;

                infoboxid.close();

                resetmarkers();

            });

        /*}*/

        resetmarkers();

        marker.set("labelClass", "markers "+disp_icon+" active");

	});

    markers.push(marker);

    markersid.push(marker.id);

}

function resetmarkers(){

    $.each(markers,function(index,obj)

    {

        var classlist = markers[index].labelClass;

        if(classlist.indexOf('active') != -1){

            classlist = classlist.replace("active", "");

            markers[index].set('labelClass',classlist);

        }

    });

}

function storecity(city_name,state_name){

    $.ajax({

        type: "POST",

        url: "https://www.wikileaf.com/common/storecity/",

        data: {city_name: city_name,state_name: state_name},

        success: function(citydata) {

            if(citydata==1)

            {

                var usercityname=city_name.toLowerCase();

                usercityname=usercityname.replace(' ','-');

                usercityname=usercityname.replace(/[^a-z0-9\-]/gi, '');

                var userstatename=state_name.toLowerCase();

                userstatename=userstatename.replace(' ','-');

                userstatename=userstatename.replace(/[^a-z0-9\-]/gi, '')

                var usercityurl="https://www.wikileaf.com/dispensary/in/"+userstatename+"/"+usercityname+"/";

                $("#full_map_url").attr("href", usercityurl);

            }

            else{

                var mplaceurl = "https://www.wikileaf.com/marketplace/";

                $("#full_map_url").attr("href", mplaceurl);

            }

        },

        fail: function() {

            // do nothing

        }

    });

}

function getCookie(cname) {

    var name = cname + "=";

    var ca = document.cookie.split(';');

    for(var i = 0; i < ca.length; i++) {

        var c = ca[i];

        while (c.charAt(0) == ' ') {

            c = c.substring(1);

        }

        if (c.indexOf(name) == 0) {

            return c.substring(name.length, c.length);

        }

    }

    return "";

}

function redirectuser(dispid){

    window.open($("#dispurl"+dispid).val(), '_blank');

}



