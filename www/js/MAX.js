function MAX_get(webType,name,data1,data2) {										// parsing the EQ.3 MAX! messages recieved via longPoll request
	console.log('RECEIVING: MAX! '+type+' '+name+' '+data1+' '+data2);
	if(type == 'thermostate') {													// Max Thermostat
		if(data1 == "desiredTemperature:") {
			$('#'+name+'val').val(data2);
		}			
	}
};

function MAX_send(name) {															// sending MAX status changes
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

console.log("Module MAX.js successfully loaded");