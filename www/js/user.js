//yaHAi - yet another Home Automation interface
//Copyright (C) 2012  Gerrit Sturm
//
//This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.
//This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//You should have received a copy of the GNU General Public License along with this program; if not, see <http://www.gnu.org/licenses/>.

$.getScript("./js/EnOcean.js");										// contains EnOcean_get and _send functions
$.getScript("./js/FS20.js");										// contains FS20_get and _send functions
$.getScript("./js/MAX.js");											// contains MAX_get and _send functions
$.getScript("./js/IT.js");											// contains IT_get and _send functions

jQuery.support.cors = true;
	
var data1, data2, timeout, result, count = 0;
var actors = new Array();
	
function addDimmer(id,protocol,name,alias,sendActor,room,state,dimmValue) {								// adding the controls for a dimmer to the interface
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
			'<input type="range" data-protocol="'+protocol+'" data-web-type="dimmer" data-actor="'+id+'" data-send-actor="'+sendActor+'" name="'+id+'" id="'+id+'val" value="'+dimmValue+'" min="0" max="100" data-highlight="true" class="slider" style="margin-left:5px;" />'+
		'</div>'+
		'<div data-role="fieldcontain">'+
			'<label for="'+id+'flip"><h5>'+alias+'</h5></label>'+
			'<select data-protocol="'+protocol+'" data-web-type="dimmer" data-actor="'+id+'" data-send-actor="'+sendActor+'" name="'+id+'" id="'+id+'flip" class="switch" data-role="slider">'+
				'<option value="off" '+selectoff+'>Aus</option>'+
				'<option value="on" '+selecton+'>An</option>'+
			'</select>'+
			'<a href="#popup'+id+'" data-rel="popup" data-role="button" data-inline="true" style="margin-top: -10px">Dimmen</a>'+
		'</div>');
};
		
function addShutter(id,protocol,name,alias,sendActor,room,state) {										// adding the controls for a shutter to the interface
	if(state == 'up') {
		var activeup = 'ui-btn-active';
	} else if(state == 'down') {
		var activedown = 'ui-btn-active';
	} else {
		var activestop = 'ui-btn-active';
	}
	$("#primary"+room).append(
	'<div data-role="fieldcontain">'+
		'<fieldset data-role="controlgroup" data-type="horizontal">'+
			'<legend><h5>'+alias+'</h5></legend>'+
			'<a href="#" data-protocol="'+protocol+'" data-web-type="shutter" data-actor="'+id+'" data-send-actor="'+sendActor+'" id="'+id+'down" data-role="button" data-icon="arrow-d" data-iconpos="notext" class="button '+id+' '+activedown+'">down</a>'+
			'<a href="#" data-protocol="'+protocol+'" data-web-type="shutter" data-actor="'+id+'" data-send-actor="'+sendActor+'" id="'+id+'stop" data-role="button" data-icon="delete" data-iconpos="notext" class="button '+id+' '+activestop+'">stop</a>'+
			'<a href="#" data-protocol="'+protocol+'" data-web-type="shutter" data-actor="'+id+'" data-send-actor="'+sendActor+'" id="'+id+'up" data-role="button" data-icon="arrow-u" data-iconpos="notext" class="button '+id+' '+activeup+'">up</a>'+
		'</fieldset>'+
	'</div>');
};
	
function addThermostate(id,protocol,name,alias,sendActor,room,setTemp,minTemp,maxTemp) {					// adding the controls for a thermostate to the interface
	$("#primary"+room).append(	
	'<div data-role="fieldcontain">'+
		'<label for="'+id+'val"><h5>'+alias+'</h5></label>'+
		'<input data-protocol="'+protocol+'" data-web-type="thermostate" data-actor="'+id+'" data-send-actor="'+sendActor+'" type="text" data-mintemp="'+minTemp+'" data-maxtemp="'+maxTemp+'" id="'+id+'val" value="'+setTemp+'" style="width: 50px;margin-right:10px;" />'+
		'<a href="#" data-protocol="'+protocol+'" data-web-type="thermostate" data-actor="'+id+'" data-send-actor="'+sendActor+'" data-role="button" data-icon="arrow-d" data-iconpos="notext" data-inline="true" name="'+id+'val" id="'+id+'valdown" class="button">down</a>'+
		'<a href="#" data-protocol="'+protocol+'" data-web-type="thermostate" data-actor="'+id+'" data-send-actor="'+sendActor+'" data-role="button" data-icon="arrow-u" data-iconpos="notext" data-inline="true" name="'+id+'val" id="'+id+'valup" class="button">up</a>'+
	'</div>	');	

}

function addSwitch(id,protocol,name,alias,sendActor,room,state) {
	var selecton = '';
	var selectoff = '';
	if(state == 'on') {
		var selecton = 'selected';
	} else {
		var selectoff = 'selected';
	}
	$("#primary"+room).append(
	'<div data-role="fieldcontain">'+
		'<label for="'+id+'flip"><h5>'+alias+'</h5></label>'+
		'<select data-protocol="'+protocol+'" data-web-type="switch" data-actor="'+id+'" data-send-actor="'+sendActor+'" name="'+id+'" id="'+id+'flip" class="switch" data-role="slider">'+
			'<option value="off" '+selectoff+'>Aus</option>'+
			'<option value="on" '+selecton+'>An</option>'+
		'</select>'+
	'</div>');
};

function ajaxCall(data,type,async) {											// handles all the ajax requests to FHEM
	if(localStorage.getItem('serverPassword') != '') {
		return $.ajax({
			type: 'GET',
			url: 'http://'+localStorage.getItem('serverAddress')+':'+localStorage.getItem('serverPort')+'/fhem',
			data: data,
			dataType: type,
			async: async,
			crossDomain: true,
			xhrFields: { withCredentials: true },
			headers: { 'Authorization': 'Basic '+$.base64.encode(localStorage.getItem('serverUsername')+':'+localStorage.getItem('serverPassword')+':x') },
			cache: false
		});
	} else {
		return $.ajax({
			type: 'GET',
			url: 'http://'+localStorage.getItem('serverAddress')+':'+localStorage.getItem('serverPort')+'/fhem',
			data: data,
			dataType: type,
			async: async,
			crossDomain: true,
			cache: false
		});
	}
};
	
function init() {																// initial sequence executed after the page is loaded calling other functions
	var rooms = new Array();
	
	$('#serverAddress').val(localStorage.getItem('serverAddress'));
	$('#serverPort').val(localStorage.getItem('serverPort'));
	$('#serverUsername').val(localStorage.getItem('serverUsername'));
	$('#serverPassword').val(localStorage.getItem('serverPassword'));
		
	ajaxCall({ cmd: 'jsonlist', XHR: 1 },'json',false).success(function(data) {
		$.each(data.Results, function(one, two) {
			$.each(two, function(three, four) {
				$.each(four, function(five, six) {
					if(six.ATTR && six.ATTR.webType) {
						if(jQuery.inArray(six.ATTR.room,rooms) == -1) { rooms.push(six.ATTR.room); }
							$.each(six.READINGS, function(seven, eight) {								// get the READINGS part of the device
								if(eight.dimmValue) { value = eight.dimmValue; }
								if(eight.desiredTemperature) { settemp = eight.desiredTemperature; }	// for max thermostates
								if(eight.valveposition) { valvepos = eight.valveposition; }
								if(eight.temperature) { temp = eight.temperature; }						// deactivated because not displayed at the moment
							});
							
							if(six.ATTR.sendActor) {													// check if a sendActor is defined 
								sendActor = six.ATTR.sendActor;											// if so choose it as sendActor
							} else {
								sendActor = six.NAME;													// if not choose the actor itself as sendActor
							}
							
							if(six.ATTR.alias) {
								alias = six.ATTR.alias;
							} else {
								alias = six.NAME;
							}

							if(six.ATTR.webType == "dimmer") {
								actors.push({"protocol": six.TYPE, "webType": six.ATTR.webType, "name": six.NAME, "alias": alias, "sendActor": sendActor, "room": six.ATTR.room, "state": six.STATE, "dimmValue": value});
							} else if(six.ATTR.webType == "shutter") {
								actors.push({"protocol": six.TYPE, "webType": six.ATTR.webType, "name": six.NAME, "alias": alias, "sendActor": sendActor, "room": six.ATTR.room, "state": six.STATE});
							} else if(six.ATTR.webType == "switch") {
								actors.push({"protocol": six.TYPE, "webType": six.ATTR.webType, "name": six.NAME, "alias": alias, "sendActor": sendActor, "room": six.ATTR.room, "state": six.STATE});
							} else if(six.ATTR.webType == "thermostate") {
								actors.push({"protocol": six.TYPE, "webType": six.ATTR.webType, "name": six.NAME, "alias": alias, "sendActor": sendActor, "room": six.ATTR.room, "temp": temp, "setTemp": settemp, "valvePos": valvepos, "minTemp": six.minimumTemperature, "maxTemp": six.maximumTemperature, "ecoTemp": six.ecoTemperature, "comfortTemp": six.comfortTemperature});
							}
					}
				});
			});
		});
	});
	console.log(actors);
	$.each(rooms, function(id, room) {
		$('body').append(
			'<div data-role="page" class="type-interior" id="page'+room+'">'+
				'<div data-role="header" data-theme="b">'+
					'<h1>'+room+'</h1>'+
					'<a href="#pageHome" data-icon="home" data-iconpos="notext" data-direction="reverse" data-transition="none">Startseite</a>'+
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
	
	$.each(actors, function(key, value) {												// could be delete if we let the longpolling go throug the created things
		if(value.webType == 'dimmer') {
			addDimmer(value.name,value.protocol,value.name,value.alias,value.sendActor,value.room,value.state,value.dimmValue);
		}else if(value.webType == 'shutter') {
			addShutter(value.name,value.protocol,value.name,value.alias,value.sendActor,value.room,value.state);
		}else if(value.webType == 'switch') {
			addSwitch(value.name,value.protocol,value.name,value.alias,value.sendActor,value.room,value.state);
		}else if(value.webType == 'thermostate') {
			addThermostate(value.name,value.protocol,value.name,value.alias,value.sendActor,value.room,value.setTemp,value.minTemp,value.maxTemp);
		}
	});
};

function xhrUpdate() {															// this is called on xhr.onreadystatechange
	response = xhrLong.responseText.split("\n");		
	
	//console.log(response.length);
	
	while ( count <= response.length ) {
		if(response[count-2]) {
			result = response[count-2].replace(/<br>$/,'').split(' ');
//			console.log(result[2]+' '+result[3]+' '+result[4]+' '+result[5]);
			$.each(window.actors, function(key, value) {										// make shure that we only react to displayed things
				if(value.name == result[3]) {													// checking the type of the actor by going through all items in the actors 	
//					console.log(result[2]+' '+value.webType+' '+result[3]+' '+result[4]+' '+result[5]);
					window[result[2] + '_get'](value.webType,result[3],result[4],result[5]);		// array wich is created by the init() function
				}
			});
		}
		count++;
	}
	
	//console.log(xhrLong.responseText);
	return;
};
	
function longPoll() {															// the longpolling request
	xhrLong = new XMLHttpRequest();
	xhrLong.open('GET', 'http://'+localStorage.getItem('serverAddress')+':'+localStorage.getItem('serverPort')+'/fhem?XHR=1&inform=console', true);
	xhrLong.onreadystatechange = xhrUpdate;
	if(localStorage.getItem('serverPassword') != '') {
		xhrLong.setRequestHeader( 'Authorization', 'Basic '+$.base64.encode(localStorage.getItem('serverUsername')+':'+localStorage.getItem('serverPassword')+':x') );
	}
	xhrLong.send(null);
	return;
};

$(".slider").live("slidestop" , function() {									// sending user input to FHEM 
	window[this.getAttribute("data-protocol") + '_send'](this);
});

$(".switch").live("change" , function() {										// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	window[this.getAttribute("data-protocol") + '_send'](this);
});

$('.button').live("click", function() {											// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	window[this.getAttribute("data-protocol") + '_send'](this);
});

$("#serverTest").live("click", function() {										// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	xhrTest = new XMLHttpRequest();
	xhrTest.open('GET', 'http://'+$('#serverAddress').val()+':'+$('#serverPort').val()+'/fhem?XHR=1&cmd=jsonlist', true);
	xhrTest.onreadystatechange = function () {
		if (xhrTest.status === 200) {
			$('#serverTestLog').html('<h3><span style="color: green">Erfolg</span></h3>');
		} else {
			$('#serverTestLog').html('<h3><span style="color: red">Fehler '+xhrTest.status+'</span></h3><p>'+xhrTest.statusText+'</p>');
		}
	}
	if($('#serverPassword').val() != '') {
		xhrTest.withCredentials = true;
		xhrTest.setRequestHeader( 'Authorization', 'Basic dGlnaTphc3VyYTp4');
//		xhrTest.setRequestHeader( 'Authorization', 'Basic '+$.base64.encode($('#serverUsername').val()+':'+$('#serverPassword').val()+':x') );
	}
	xhrTest.send(null);
});

$("#saveConfig").live("click", function() {										// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	localStorage.setItem('serverAddress', $('#serverAddress').val());
	localStorage.setItem('serverPort', $('#serverPort').val());
	localStorage.setItem('serverUsername', $('#serverUsername').val());
	localStorage.setItem('serverPassword', $('#serverPassword').val());
});