jQuery.support.cors = true;
	
var state;
var value;
	
function adddimmer(id,name,room,state,value) {
	var selecton = '';
	var selectoff = '';
	if(state == 'on') {
		var selecton = 'selected';
	} else {
		var selectoff = 'selected';
		value = '0';
	}
	$("#primary"+room).append(
		'<div data-role="popup" id="popup'+id+'" data-theme="c" style="min-width: 295px;">'+
			'<div data-role="header" data-theme="b" class="ui-corner-top">'+
				'<h1>Dimmen</h1>'+
			'</div>'+
			'<input type="range" name="'+id+'" id="'+id+'val" value="'+value+'" min="0" max="100" data-highlight="true" class="dimmerval" style="margin-left:5px;" />'+
		'</div>'+
		'<div data-role="fieldcontain">'+
			'<label for="'+id+'flip">'+name+':</label>'+
			'<select name="'+id+'" id="'+id+'flip" class="dimmerflip" data-role="slider">'+
				'<option value="off" '+selectoff+'>Aus</option>'+
				'<option value="on" '+selecton+'>An</option>'+
			'</select>'+
			'<a href="#popup'+id+'" data-rel="popup" data-role="button" data-inline="true" style="margin-top: -10px">Dimmen</a>'+
		'</div>');
}
	
function addlight(id,name,room,state) {
	var selecton = '';
	var selectoff = '';
	if(state == 'on') {
		var selecton = 'selected';
	} else {
		var selectoff = 'selected';
	}
	$("#primary"+room).append(
	'<div data-role="fieldcontain">'+
		'<label for="'+id+'flip">'+name+':</label>'+
		'<select name="'+id+'" id="'+id+'flip" class="lightflip" data-role="slider">'+
			'<option value="off" '+selectoff+'>Aus</option>'+
			'<option value="on" '+selecton+'>An</option>'+
		'</select>'+
	'</div>');
}
	
function addshutter(id,name,room,state) {
	var checkup = '';
	var checkdown = '';
	var checknone = '';
	if(state == 'up') {
		var checkup = 'checked';
	} else if(state == 'down') {
		var checkdown = 'checked';
	} else {
		var checknone = 'checked';
	}
	$("#primary"+room).append(
	'<div data-role="fieldcontain">'+
		'<fieldset data-role="controlgroup" data-type="horizontal" >'+
			'<legend>'+name+'</legend>'+
				'<input type="radio" name="'+id+'" id="'+id+'up" value="up" '+checkup+' />'+
				'<label for="'+id+'up">Auf</label>'+
				'<input type="radio" name="'+id+'" id="'+id+'none" value="none" '+checknone+' />'+
				'<label for="'+id+'none">Stop</label>'+
				'<input type="radio" name="'+id+'" id="'+id+'down" value="down" '+checkdown+' />'+
				'<label for="'+id+'down">Zu</label>'+
		'</fieldset>'+
	'</div>');
}
	
function addswitch() {
}
	
function ajaxCall(data,type,async) {
	if($.cookie('serverUsername') != '') {
		return $.ajax({
			type: 'GET',
			url: 'http://'+$.cookie('serverAddress')+':'+$.cookie('serverPort')+'/fhem',
			data: data,
			dataType: type,
			async: async,
			crossDomain: true,
			xhrFields: { withCredentials: true },
			headers: { 'Authorization': 'Basic '+$.base64.encode($.cookie('serverUsername')+':'+$.cookie('serverPassword')+':x') },
			cache: false
		});
	} else {
		return $.ajax({
			type: 'GET',
			url: 'http://'+$.cookie('serverAddress')+':'+$.cookie('serverPort')+'/fhem',
			data: data,
			dataType: type,
			async: async,
			crossDomain: true,
			cache: false
		});
	}
}
	
function init() {
	var rooms = new Array();
	var actors = new Array();
	
	$('#serverAddress').val($.cookie('serverAddress'));
	$('#serverPort').val($.cookie('serverPort'));
	$('#serverUsername').val($.cookie('serverUsername'));
	$('#serverPassword').val($.cookie('serverPassword'));
	$('#serverPrefix').val($.cookie('serverPrefix'));
		
	ajaxCall({ cmd: 'jsonlist', XHR: 1, CORS: 1 },'json',false).success(function(data) {
		$.each(data.Results, function(one, two) {
			$.each(two, function(three, four) {
				$.each(four, function(five, six) {
					if(six.ATTR && six.ATTR.webType) {
						if(jQuery.inArray(six.ATTR.room,rooms) == -1) { rooms.push(six.ATTR.room); }
							$.each(six.READINGS, function(seven, eight) {
								if(eight.state) { state = eight.state; }
								if(eight.dimmValue) { value = eight.dimmValue; }
							});
							actors.push({"type": six.ATTR.webType, "name": six.NAME, "room": six.ATTR.room, "state": state, "value": value});
					}
				});
			});
		});
	});
	$.each(rooms, function(id, room) {
		$('body').append(
			'<div data-role="page" class="type-interior" id="page'+room+'">'+
				'<div data-role="header" data-theme="b">'+
					'<h1>'+room+'</h1>'+
					'<a href="#pageHome" data-icon="home" data-iconpos="notext" data-direction="reverse">Startseite</a>'+
					'<a href="#pageConfig" data-icon="gear" data-iconpos="notext" data-rel="dialog" data-transition="none">Einstellungen</a>'+
				'</div>'+
				'<div data-role="content">'+
					'<div class="content-primary" id="primary'+room+'"></div>'+
					'<div class="content-secondary">'+
						'<div data-role="collapsible" data-collapsed="true" data-theme="b" data-content-theme="d" >'+
							'<h3>Raum w&auml;hlen</h3>'+
							'<ul data-role="listview" data-theme="c" data-dividertheme="d" class="rooms">'+
							'</ul>'+
						'</div>'+
					'</div>'+
				'</div>'+
				'<div data-role="footer" class="footer-test" data-theme="c">'+
					'<p>&copy; 2012 Gerrit Sturm</p>'+
				'</div>'+
			'</div>');	
	});
	$.each(rooms, function(id, room) {
		$(".rooms").append('<li><a href="#page'+room+'" data-transition="none">'+room+'</a></li>');
	});
	$.each(actors, function(key, value) {
		if(value.type == 'dimmer') {
			adddimmer(value.name,'Licht',value.room,value.state,value.value);
		}else if(value.type == 'light') {
			addlight(value.name,'Licht',value.room,value.state);
		}else if(value.type == 'shutter') {
			addshutter(value.name,'Rolladen',value.room,value.state);
		}else if(value.type == 'switch') {
			addswitch(value.name,'Schalter',value.room,value.state);
		}
	});
}

function longPoll() {
	var rooms = new Array();
	var actors = new Array();
	ajaxCall({ room: 'all', inform: 1, XHR: 1, CORS: 1 },'',true).success(function(data) {
		// catches any changes of FHEM devices
		var response = data.split("\n");
		$.each(response, function(key, value) {
			// dont do anything if actor state isnt changed
			if(value != '' && value.search(/schalter/i) == -1) {
				ajaxCall({ cmd: 'jsonlist', XHR: 1, CORS: 1 },'json',false).success(function(data) {
					$.each(data.Results, function(one, two) {
						$.each(two, function(three, four) {
							$.each(four, function(five, six) {
								if(six.ATTR && six.ATTR.webType) {
									if(jQuery.inArray(six.ATTR.room,rooms) == -1) { rooms.push(six.ATTR.room); }
										$.each(six.READINGS, function(seven, eight) {
											if(eight.state) { state = eight.state; }
											if(eight.dimmValue) { value = eight.dimmValue; }
										});
										actors.push({"type": six.ATTR.webType, "name": six.NAME, "room": six.ATTR.room, "state": state, "value": value});
								}
							});
						});
					});
					$.each(actors, function(key, value) {
						// do this if actor has webType dimmer
						if(value.type == 'dimmer') {
							if($('#'+value.name+'flip').val() != value.state) {
								$('#'+value.name+'flip').val(value.state).slider().slider("refresh");
							} else {
								if($('#'+value.name+'val').val() != value.value && value.state == 'on') {
									$('#'+value.name+'val').val(value.value).slider().slider("refresh");
								}
							}
							if(value.state != 'on') {
								$('#'+value.name+'val').val(0).slider().slider("refresh");
							}
						// do this if actor has webType light
						} else if(value.type == 'light') {
							$('#'+value.name+'flip').val(value.state).slider().slider("refresh");
						// do this if actor has webType shutter
						} else if(value.type == 'shutter') {
//							$("input[name='"+value.name+"']:"+value.state).attr("checked",true).checkboxradio("refresh");
							$('#'+value.name+value.state).attr('checked',true);
							$('input[name='+value.name+']').checkboxradio().checkboxradio('refresh');
//							$('#'+value.name).attr('checked',true).checkboxradio("refresh");
						// do this if actor has webType switch
						} else if(value.type == 'switch') {
							
						}							
					});	
				});	
			}
		});
		longPoll();
	});
}	
	
$(".dimmerval").live("slidestop" , function() {
	ajaxCall({ cmd: 'set schalter_'+this.name+' dimm '+this.value+' 10', XHR: 1, CORS: 1 },'',true);
});

$(".dimmerflip").live("change" , function() {
	if($(this).val() == 'on') {
		ajaxCall({ cmd: 'set schalter_'+this.name+' dimm 100 10', XHR: 1, CORS: 1 },'',true);
	} else {
		ajaxCall({ cmd: 'set schalter_'+this.name+' dimm 0 10', XHR: 1, CORS: 1 },'',true);
	}
});

$(".lightflip").live("change" , function() {
	ajaxCall({ cmd: 'trigger nForTimer schalter_'+this.name+' on 0.1 released', XHR: 1, CORS: 1 },'',true);
});

$("#serverTest").live("click", function() {
	$.ajax({
		type: 'GET',
		url: 'http://'+$('#serverAddress').val()+':'+$('#serverPort').val()+'/fhem',
		data: { cmd: 'jsonlist', XHR: 1, CORS: 1 },
		dataType: 'json',
		async: false,
		crossDomain: true,
		xhrFields: { withCredentials: true },
		headers: { 'Authorization': 'Basic '+$.base64.encode($('#serverUsername').val()+':'+$('#serverPassword').val()+':x') },
		cache: false,

		success: function(data){
			$('#serverTestLog').html('<h3><span style="color: green">Erfolg</span></h3>');
		},
		
		error: function(XMLHttpRequest, textStatus, errorThrown){
			$('#serverTestLog').html('<h3><span style="color: red">Fehler</h3></span><p>'+errorThrown+'</p>');
		}
	
	});
});	

$("#saveConfig").live("click", function() {
	$.cookie('serverAddress', $('#serverAddress').val(), { expires: 9999 });
	$.cookie('serverPort', $('#serverPort').val(), { expires: 9999 });
	$.cookie('serverUsername', $('#serverUsername').val(), { expires: 9999 });
	$.cookie('serverPassword', $('#serverPassword').val(), { expires: 9999 });
	$.cookie('serverPrefix', $('#serverPrefix').val(), { expires: 9999 });
});

$.mobile.autoInitializePage = false