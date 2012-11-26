//yaHAi - yet another Home Automation interface
//Copyright (C) 2012  Gerrit Sturm
//
//This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.
//This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
//You should have received a copy of the GNU General Public License along with this program; if not, see <http://www.gnu.org/licenses/>.

jQuery.support.cors = true;
	
var data1, data2, timeout;
var actors = new Array();

function EnOcean_get(type,name,data1,data2) { 									// Parsing the EnOcean messages recieved via longPoll request
	console.log('RECEIVING: EnOcean '+type+' '+name+' '+data1+' '+data2);								
	if(type == 'light') {														// Only ON/OFF lights like Eltako FSR61
		$('#'+name+'flip').val(data1).slider().slider("refresh");
	} else if(type == 'dimmer') {												// Dimmers like Eltako FUD61
		if(data1 != 'on' && data1 != 'off') {
			$('#'+name+'val').val(data2).slider().slider("refresh");
		} else {
			$('#'+name+'flip').val(data1).slider().slider("refresh");
		}
	} else if(type == 'shutter') {												// Eltako FSB61
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

function EnOcean_send() {														// placeholder for sending EnOcean status changes 
};

function MAX_get(type,name,data1,data2) {										// parsing the EQ.3 MAX! messages recieved via longPoll request
	console.log('RECEIVING: MAX! '+type+' '+name+' '+data1+' '+data2);
	if(type == 'thermostate') {													// Max Thermostat
		if(data1 == "desiredTemperature:") {
			$('#'+name+'val').val(data2);
		}			
	}
};

function MAX_send() {															// placeholder for sending EnOcean status changes 
};
	
function addDimmer(id,name,sendActor,room,state,dimmValue) {									// adding the controls for a dimmer to the interface
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
			'<input type="range" data-actor="'+id+'" data-send-actor="'+sendActor+'" name="'+id+'" id="'+id+'val" value="'+dimmValue+'" min="0" max="100" data-highlight="true" class="dimmerval" style="margin-left:5px;" />'+
		'</div>'+
		'<div data-role="fieldcontain">'+
			'<label for="'+id+'flip"><h5>'+name+':</h5></label>'+
			'<select data-actor="'+id+'" data-send-actor="'+sendActor+'" name="'+id+'" id="'+id+'flip" class="dimmerflip" data-role="slider">'+
				'<option value="off" '+selectoff+'>Aus</option>'+
				'<option value="on" '+selecton+'>An</option>'+
			'</select>'+
			'<a href="#popup'+id+'" data-rel="popup" data-role="button" data-inline="true" style="margin-top: -10px">Dimmen</a>'+
		'</div>');
}
	
function addLight(id,name,sendActor,room,state) {											// adding the controls for a light to the interface
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
		'<select data-actor="'+id+'" data-send-actor="'+sendActor+'" name="'+id+'" id="'+id+'flip" class="lightflip" data-role="slider">'+
			'<option value="off" '+selectoff+'>Aus</option>'+
			'<option value="on" '+selecton+'>An</option>'+
		'</select>'+
	'</div>');
}
	
function addShutter(id,name,sendActor,room,state) {										// adding the controls for a shutter to the interface
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
			'<a href="#" data-actor="'+id+'" data-send-actor="'+sendActor+'" id="'+id+'down" data-role="button" data-icon="arrow-d" data-iconpos="notext" class="shutterval '+id+' '+activedown+'">down</a>'+
			'<a href="#" data-actor="'+id+'" data-send-actor="'+sendActor+'" id="'+id+'stop" data-role="button" data-icon="delete" data-iconpos="notext" class="shutterval '+id+' '+activestop+'">stop</a>'+
			'<a href="#" data-actor="'+id+'" data-send-actor="'+sendActor+'" id="'+id+'up" data-role="button" data-icon="arrow-u" data-iconpos="notext" class="shutterval '+id+' '+activeup+'">up</a>'+
		'</fieldset>'+
	'</div>');
}
	
function addThermostate(id,name,sendActor,room,setTemp,minTemp,maxTemp) {					// adding the controls for a thermostate to the interface
	$("#primary"+room).append(	
	'<div data-role="fieldcontain">'+
		'<label for="'+id+'val"><h5>Thermostat:</h5></label>'+
		'<input data-actor="'+id+'" data-send-actor="'+sendActor+'" type="text" data-mintemp="'+minTemp+'" data-maxtemp="'+maxTemp+'" id="'+id+'val" value="'+setTemp+'" style="width: 50px;margin-right:10px;" />'+
		'<a href="#" data-actor="'+id+'" data-send-actor="'+sendActor+'" data-role="button" data-icon="arrow-d" data-iconpos="notext" data-inline="true" name="'+id+'val" id="'+id+'valdown" class="thermostateval">down</a>'+
		'<a href="#" data-actor="'+id+'" data-send-actor="'+sendActor+'" data-role="button" data-icon="arrow-u" data-iconpos="notext" data-inline="true" name="'+id+'val" id="'+id+'valup" class="thermostateval">up</a>'+
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
								actors.push({"type": six.ATTR.webType, "name": six.NAME, "sendActor": sendActor, "room": six.ATTR.room, "state": state});
							} else if(six.ATTR.webType == "dimmer") {
								actors.push({"type": six.ATTR.webType, "name": six.NAME, "sendActor": sendActor, "room": six.ATTR.room, "state": state, "dimmValue": value});
							} else if(six.ATTR.webType == "shutter") {
								actors.push({"type": six.ATTR.webType, "name": six.NAME, "sendActor": sendActor, "room": six.ATTR.room, "state": state});
							} else if(six.ATTR.webType == "switch") {
								actors.push({"type": six.ATTR.webType, "name": six.NAME, "sendActor": sendActor, "room": six.ATTR.room, "state": state});
							} else if(six.ATTR.webType == "thermostate") {
								actors.push({"type": six.ATTR.webType, "name": six.NAME, "sendActor": sendActor, "room": six.ATTR.room, "temp": temp, "setTemp": settemp, "valvePos": valvepos, "minTemp": six.minimumTemperature, "maxTemp": six.maximumTemperature, "ecoTemp": six.ecoTemperature, "comfortTemp": six.comfortTemperature});
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
		if(value.type == 'dimmer') {
			addDimmer(value.name,'Licht',value.sendActor,value.room,value.state,value.dimmValue);
		}else if(value.type == 'light') {
			addLight(value.name,'Licht',value.sendActor,value.room,value.state);
		}else if(value.type == 'shutter') {
			addShutter(value.name,'Rolladen',value.sendActor,value.room,value.state);
		}else if(value.type == 'switch') {
			addSwitch(value.name,'Schalter',value.sendActor,value.room,value.state);
		}else if(value.type == 'thermostate') {
			addThermostate(value.name,'Thermostat',value.sendActor,value.room,value.setTemp,value.minTemp,value.maxTemp);
		}
	});
}

function longPoll() {															// the longpoll request
	var room = new Array();
	var actors = new Array();
	ajaxCall({ XHR: 1, inform: 'console' },'',true).success(function(data) {	// the request itself
		var response = data.split("\n");										// we dont want the newline at the end
		$.each(response, function(key, value) {
			if(value != '' && value.search(/schalter/i) == -1) {				// we dont want the changes of buttons have to make an cookie for that later
				result = value.replace(/<br>$/,'').split(' ');					// delete the break at the end and split the string into an array
				
				$.each(window.actors, function(key, value) {
					if(value.name == result[3]) {													// checking the type of the actor by going through all items in the actors 			
						window[result[2] + '_get'](value.type,result[3],result[4],result[5]);		// array wich is created by the init() function
					}
				});
				
			}
		});
		longPoll();																// this ajax request has ended so we should start a new one
	});
}

function longPollOld() {														// old version of the longpolling leading in way to many requests and mess up everything
	var rooms = new Array();													// will be deleted after i finished the shiney new longPoll() function completely
	actors = new Array();
	ajaxCall({ room: 'all', inform: 1, XHR: 1 },'',true).success(function(data) {
		// catches any changes of FHEM devices
		var response = data.split("\n");
		$.each(response, function(key, value) {
			// dont do anything if actor state isnt changed
			if(value != '' && value.search(/schalter/i) == -1) {
				ajaxCall({ cmd: 'jsonlist', XHR: 1 },'json',false).success(function(data) {
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
	
$(".dimmerval").live("slidestop" , function() {									// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	ajaxCall({ cmd: 'set '+this.getAttribute("data-send-actor")+' dimm '+this.value+' 10', XHR: 1 },'',true);
	console.log('SENDING: set '+this.getAttribute("data-send-actor")+' dimm '+this.value+' 10');		// some logging
});

$(".dimmerflip").live("change" , function() {									// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	if($(this).val() == 'on') {
		ajaxCall({ cmd: 'set '+this.getAttribute("data-send-actor")+' dimm 100 10', XHR: 1 },'',true);
		console.log('SENDING: set '+this.getAttribute("data-send-actor")+' dimm 100 10');		// some logging
	} else {
		ajaxCall({ cmd: 'set '+this.getAttribute("data-send-actor")+' dimm 0 10', XHR: 1 },'',true);
		console.log('SENDING: set '+this.getAttribute("data-send-actor")+' dimm 0 10');			// some logging
	}
});

$(".lightflip").live("change" , function() {									// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	ajaxCall({ cmd: 'trigger nForTimer '+this.getAttribute("data-send-actor")+' on 0.1 released', XHR: 1 },'',true);
	console.log('SENDING: trigger nForTimer '+this.getAttribute("data-send-actor")+' on 0.1 released');		// some logging
});

$('.thermostateval').live("click", function() {									// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	if(timeout) {																// restart timeout loop if we have one allready running
        clearTimeout(timeout);
        timeout = null;
    }
	var actor = this.getAttribute("data-send-actor");
	timeout = setTimeout(function(){
		ajaxCall({ cmd: 'set '+actor+' desiredTemperature '+$('#'+actor+'val').val(), XHR: 1 },'',true);
		console.log('SENDING: set '+actor+' desiredTemperature '+$('#'+actor+'val').val());		// some logging
	}, 2000);																	// wait 2000 ms for another action
	if(this.id == this.name+'up') {
		$('#'+this.name).val(Number($('#'+this.name).val())+0.5);				// the steps should maybe be an option in settings or better in fhem.cfg
	} else {
		$('#'+this.name).val(Number($('#'+this.name).val())-0.5);
	}
});

$('.shutterval').live("click", function() {									// sending user input to FHEM should somehow be called from PROTOCOL_send() functions
	if(this.id == this.getAttribute("data-actor")+'up') {
		ajaxCall({ cmd: 'trigger nForTimer '+this.getAttribute("data-send-actor")+' up 0.1 released', XHR: 1 },'',true);
		console.log('SENDING: trigger nForTimer '+this.getAttribute("data-send-actor")+' up 0.1 released');
	} else if(this.id == this.getAttribute("data-actor")+'stop') {
		console.log('SENDING: trigger nForTimer '+this.getAttribute("data-send-actor")+' stop 0.1 released');
	} else if(this.id == this.getAttribute("data-actor")+'down') {
		ajaxCall({ cmd: 'trigger nForTimer '+this.getAttribute("data-send-actor")+' down 0.1 released', XHR: 1 },'',true);
		console.log('SENDING: trigger nForTimer '+this.getAttribute("data-send-actor")+' down 0.1 released');
	} 
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
