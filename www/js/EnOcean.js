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

console.log("Module EnOcean.js successfully loaded");