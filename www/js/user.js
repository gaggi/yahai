//yaHAi - yet another Home Automation interface
//Copyright (C) 2012  Gerrit Sturm
//
//This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.
//This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//You should have received a copy of the GNU General Public License along with this program; if not, see <http://www.gnu.org/licenses/>.

jQuery.support.cors = true;
	
var data1, data2, timeout, result, count = 0;
var actors = new Array();

function EnOcean_get(webType,name,data1,data2) { 									// Parsing the EnOcean messages recieved via longPoll request
	console.log('RECEIVING: EnOcean '+webType+' '+name+' '+data1+' '+data2);								
	if(webType == 'light') {														// Only ON/OFF lights like Eltako FSR61
		$('#'+name+'flip').val(data1).slider().slider("refresh");
	} else if(webType == 'dimmer') {												// Dimmers like Eltako FUD61
		if(data1 != 'on' && data1 != 'off') {
			$('#'+name+'val').val(data2).slider().slider("refresh");
		} else {
			$('#'+name+'flip').val(data1).slider().slider("refresh");
		}
	} else if(webType == 'shutter') {												// Eltako FSB61
		$('.'+name).removeClass('ui-btn-active');
		if(data1 == "up") {
			$('#'+name+'up').addClass('ui-btn-active');
		} else if(data1 == "down") {
			$('#'+name+'down').addClass('ui-btn-active');
		} else {
			$('#'+name+'stop').addClass('ui-btn-active');
		}	
	} 
};

function EnOcean_send(name) {														// placeholder for sending EnOcean status changes 
	if(name.getAttribute("data-web-type") == 'dimmer') {
		if(name.value == 'on') {
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' dimm 100 10', XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' dimm 100 10');		// some logging
		} else if(name.value == 'off') {
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' dimm 0 10', XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' dimm 0 10');			// some logging
		} else {
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' dimm '+name.value+' 10', XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' dimm '+name.value+' 10');								// some logging
		}
	} else if(name.getAttribute("data-web-type") == 'light') {
		ajaxCall({ cmd: 'trigger nForTimer '+name.getAttribute("data-send-actor")+' on 0.1 released', XHR: 1 },'',true);
		console.log('SENDING: trigger nForTimer '+name.getAttribute("data-send-actor")+' on 0.1 released');		// some logging
	} else if(name.getAttribute("data-web-type") == 'shutter') {
		if(name.id == name.getAttribute("data-actor")+'up') {
			ajaxCall({ cmd: 'trigger nForTimer '+name.getAttribute("data-send-actor")+' up 0.1 released', XHR: 1 },'',true);
			console.log('SENDING: trigger nForTimer '+name.getAttribute("data-send-actor")+' up 0.1 released');
		} else if(name.id == name.getAttribute("data-actor")+'stop') {
			console.log('SENDING: trigger nForTimer '+name.getAttribute("data-send-actor")+' stop 0.1 released');
		} else if(name.id == name.getAttribute("data-actor")+'down') {
			ajaxCall({ cmd: 'trigger nForTimer '+name.getAttribute("data-send-actor")+' down 0.1 released', XHR: 1 },'',true);
			console.log('SENDING: trigger nForTimer '+name.getAttribute("data-send-actor")+' down 0.1 released');
		} 
	} 
};

function MAX_get(type,name,data1,data2) {										// parsing the EQ.3 MAX! messages recieved via longPoll request
	console.log('RECEIVING: MAX! '+type+' '+name+' '+data1+' '+data2);
	if(type == 'thermostate') {													// Max Thermostat
		if(data1 == "desiredTemperature:") {
			$('#'+name+'val').val(data2);
		}			
	}
};

function MAX_send(name) {															// placeholder for sending EnOcean status changes 
	if(name.getAttribute("data-web-type") == 'thermostate') {
		if(timeout) {																// restart timeout loop if we have one allready running
			clearTimeout(timeout);
			timeout = null;
		}
		timeout = setTimeout(function(){
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' desiredTemperature '+$('#'+name.getAttribute("data-send-actor")+'val').val(), XHR: 1 },'',true),
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' desiredTemperature '+$('#'+name.getAttribute("data-send-actor")+'val').val());		// some logging
		}, 2000);																	// wait 2000 ms for another action

		if(name.id == name.name+'up') {
			$('#'+name.name).val(Number($('#'+name.name).val())+0.5);				// the steps should maybe be an option in settings or better in fhem.cfg
		} else {
			$('#'+name.name).val(Number($('#'+name.name).val())-0.5);
		}
	}
};
	
function addDimmer(id,protocol,name,sendActor,room,state,dimmValue) {									// adding the controls for a dimmer to the interface
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
			'<input type="range" data-protocol="'+protocol+'" data-web-type="dimmer" data-actor="'+id+'" data-send-actor="'+sendActor+'" name="'+id+'" id="'+id+'val" value="'+dimmValue+'" min="0" max="100" data-highlight="true" class="dimmerval" style="margin-left:5px;" />'+
		'</div>'+
		'<div data-role="fieldcontain">'+
			'<label for="'+id+'flip"><h5>'+name+':</h5></label>'+
			'<select data-protocol="'+protocol+'" data-web-type="dimmer" data-actor="'+id+'" data-send-actor="'+sendActor+'" name="'+id+'" id="'+id+'flip" class="dimmerflip" data-role="slider">'+
				'<option value="off" '+selectoff+'>Aus</option>'+
				'<option value="on" '+selecton+'>An</option>'+
			'</select>'+
			'<a href="#popup'+id+'" data-rel="popup" data-role="button" data-inline="true" style="margin-top: -10px">Dimmen</a>'+
		'</div>');
}
	
function addLight(id,protocol,name,sendActor,room,state) {											// adding the controls for a light to the interface
	var selecton = '';
	var selectoff = '';
	if(state == 'on') {
		var selecton = 'selected';
	} else {
		var selectoff = 'selected';
	}
	$("#primary"+room).append(
	'<div data-role="fieldcontain">'+
		'<label for="'+id+'flip"><h5>'+name+':</h5></label>'+
		'<select data-protocol="'+protocol+'" data-web-type="light" data-actor="'+id+'" data-send-actor="'+sendActor+'" name="'+id+'" id="'+id+'flip" class="lightflip" data-role="slider">'+
			'<option value="off" '+selectoff+'>Aus</option>'+
			'<option value="on" '+selecton+'>An</option>'+
		'</select>'+
	'</div>');
}
	
function addShutter(id,protocol,name,sendActor,room,state) {										// adding the controls for a shutter to the interface
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
			'<legend><h5>Rolladen:</h5></legend>'+
			'<a href="#" data-protocol="'+protocol+'" data-web-type="shutter" data-actor="'+id+'" data-send-actor="'+sendActor+'" id="'+id+'down" data-role="button" data-icon="arrow-d" data-iconpos="notext" class="shutterval '+id+' '+activedown+'">down</a>'+
			'<a href="#" data-protocol="'+protocol+'" data-web-type="shutter" data-actor="'+id+'" data-send-actor="'+sendActor+'" id="'+id+'stop" data-role="button" data-icon="delete" data-iconpos="notext" class="shutterval '+id+' '+activestop+'">stop</a>'+
			'<a href="#" data-protocol="'+protocol+'" data-web-type="shutter" data-actor="'+id+'" data-send-actor="'+sendActor+'" id="'+id+'up" data-role="button" data-icon="arrow-u" data-iconpos="notext" class="shutterval '+id+' '+activeup+'">up</a>'+
		'</fieldset>'+
	'</div>');
}
	
function addThermostate(id,protocol,name,sendActor,room,setTemp,minTemp,maxTemp) {					// adding the controls for a thermostate to the interface
	$("#primary"+room).append(	
	'<div data-role="fieldcontain">'+
		'<label for="'+id+'val"><h5>Thermostat:</h5></label>'+
		'<input data-protocol="'+protocol+'" data-web-type="thermostate" data-actor="'+id+'" data-send-actor="'+sendActor+'" type="text" data-mintemp="'+minTemp+'" data-maxtemp="'+maxTemp+'" id="'+id+'val" value="'+setTemp+'" style="width: 50px;margin-right:10px;" />'+
		'<a href="#" data-protocol="'+protocol+'" data-web-type="thermostate" data-actor="'+id+'" data-send-actor="'+sendActor+'" data-role="button" data-icon="arrow-d" data-iconpos="notext" data-inline="true" name="'+id+'val" id="'+id+'valdown" class="thermostateval">down</a>'+
		'<a href="#" data-protocol="'+protocol+'" data-web-type="thermostate" data-actor="'+id+'" data-send-actor="'+sendActor+'" data-role="button" data-icon="arrow-u" data-iconpos="notext" data-inline="true" name="'+id+'val" id="'+id+'valup" class="thermostateval">up</a>'+
	'</div>	');	

}

function addSwitch() {

}

function ajaxCall(data,type,async) {											// handles all the ajax requests to FHEM
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
	
function init() {																// initial sequence executed after the page is loaded calling other functions
	var rooms = new Array();
	
	$('#serverAddress').val($.cookie('serverAddress'));
	$('#serverPort').val($.cookie('serverPort'));
	$('#serverUsername').val($.cookie('serverUsername'));
	$('#serverPassword').val($.cookie('serverPassword'));
	$('#serverPrefix').val($.cookie('serverPrefix'));
		
	ajaxCall({ cmd: 'jsonlist', XHR: 1 },'json',false).success(function(data) {
		$.each(data.Results, function(one, two) {
			$.each(two, function(three, four) {
				$.each(four, function(five, six) {
					if(six.ATTR && six.ATTR.webType) {
						if(jQuery.inArray(six.ATTR.room,rooms) == -1) { rooms.push(six.ATTR.room); }
							$.each(six.READINGS, function(seven, eight) {								// get the READINGS part of the device
								if(eight.state) { state = eight.state; }								// for enocean dimmers
								if(eight.dimmValue) { value = eight.dimmValue; }
								if(eight.desiredTemperature) { settemp = eight.desiredTemperature; }		// for max thermostates
								if(eight.valveposition) { valvepos = eight.valveposition; }
								if(eight.temperature) { temp = eight.temperature; }						// deactivated because not displayed at the moment
							});
							
							if(six.ATTR.sendActor) {													// check if a sendActor is defined 
								sendActor = six.ATTR.sendActor;											// if so choose it as sendActor
							} else {
								sendActor = six.NAME;													// if not choose the actor itself as sendActor
							}
							
							if(six.ATTR.webType == "light") {
								actors.push({"protocol": six.TYPE, "webType": six.ATTR.webType, "name": six.NAME, "sendActor": sendActor, "room": six.ATTR.room, "state": state});
							} else if(six.ATTR.webType == "dimmer") {
								actors.push({"protocol": six.TYPE, "webType": six.ATTR.webType, "name": six.NAME, "sendActor": sendActor, "room": six.ATTR.room, "state": state, "dimmValue": value});
							} else if(six.ATTR.webType == "shutter") {
								actors.push({"protocol": six.TYPE, "webType": six.ATTR.webType, "name": six.NAME, "sendActor": sendActor, "room": six.ATTR.room, "state": state});
							} else if(six.ATTR.webType == "switch") {
								actors.push({"protocol": six.TYPE, "webType": six.ATTR.webType, "name": six.NAME, "sendActor": sendActor, "room": six.ATTR.room, "state": state});
							} else if(six.ATTR.webType == "thermostate") {
								actors.push({"protocol": six.TYPE, "webType": six.ATTR.webType, "name": six.NAME, "sendActor": sendActor, "room": six.ATTR.room, "temp": temp, "setTemp": settemp, "valvePos": valvepos, "minTemp": six.minimumTemperature, "maxTemp": six.maximumTemperature, "ecoTemp": six.ecoTemperature, "comfortTemp": six.comfortTemperature});
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
			addDimmer(value.name,value.protocol,'Licht',value.sendActor,value.room,value.state,value.dimmValue);
		}else if(value.webType == 'light') {
			addLight(value.name,value.protocol,'Licht',value.sendActor,value.room,value.state);
		}else if(value.webType == 'shutter') {
			addShutter(value.name,value.protocol,'Rolladen',value.sendActor,value.room,value.state);
		}else if(value.webType == 'switch') {
			addSwitch(value.name,value.protocol,'Schalter',value.sendActor,value.room,value.state);
		}else if(value.webType == 'thermostate') {
			addThermostate(value.name,value.protocol,'Thermostat',value.sendActor,value.room,value.setTemp,value.minTemp,value.maxTemp);
		}
	});
}

function xhrUpdate() {															// this is called on xhr.onreadystatechange
	response = xhrLong.responseText.split("\n");		
	
	//console.log(response.length);
	
	while ( count <= response.length ) {
		if(response[count-2]) {
			result = response[count-2].replace(/<br>$/,'').split(' ');
//			console.log(result[2]+' '+result[3]+' '+result[4]+' '+result[5]);
			$.each(window.actors, function(key, value) {										// make shure that we only react to displayed things
				if(value.name == result[3]) {													// checking the type of the actor by going through all items in the actors 			
					window[result[2] + '_get'](value.webType,result[3],result[4],result[5]);		// array wich is created by the init() function
				}
			});
		}
		count++;
	}
	
	//console.log(xhrLong.responseText);
	return;
}
	
function longPoll() {															// the longpolling request
	xhrLong = new XMLHttpRequest();
	xhrLong.open('GET', 'http://'+$.cookie('serverAddress')+':'+$.cookie('serverPort')+'/fhem?XHR=1&inform=console', true);
	xhrLong.onreadystatechange = xhrUpdate;
	if($.cookie('serverUsername') != '') {
		xhrLong.setRequestHeader( 'Authorization', 'Basic '+$.base64.encode('tigi:asura:x') );
	}
	xhrLong.send(null);
	return;
}	

$(".dimmerval").live("slidestop" , function() {									// sending user input to FHEM 
	window[this.getAttribute("data-protocol") + '_send'](this);
});

$(".dimmerflip").live("change" , function() {									// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	window[this.getAttribute("data-protocol") + '_send'](this);
});

$(".lightflip").live("change" , function() {									// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	window[this.getAttribute("data-protocol") + '_send'](this);
});

$('.thermostateval').live("click", function() {									// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	window[this.getAttribute("data-protocol") + '_send'](this);
});

$('.shutterval').live("click", function() {										// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	window[this.getAttribute("data-protocol") + '_send'](this);
});

$("#serverTest").live("click", function() {										// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	$.ajax({
		type: 'GET',
		url: 'http://'+$('#serverAddress').val()+':'+$('#serverPort').val()+'/fhem',
		data: { cmd: 'jsonlist', XHR: 1 },
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

$("#saveConfig").live("click", function() {										// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	$.cookie('serverAddress', $('#serverAddress').val(), { expires: 9999 });
	$.cookie('serverPort', $('#serverPort').val(), { expires: 9999 });
	$.cookie('serverUsername', $('#serverUsername').val(), { expires: 9999 });
	$.cookie('serverPassword', $('#serverPassword').val(), { expires: 9999 });
	$.cookie('serverPrefix', $('#serverPrefix').val(), { expires: 9999 });
});
