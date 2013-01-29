function EnOcean_get(webType,name,data1,data2) { 									// Parsing the EnOcean messages recieved via longPoll request
	console.log('RECEIVING: EnOcean '+webType+' '+name+' '+data1+' '+data2);								
	if(webType == 'switch') {												// Only ON/OFF
		$('#'+name+'flip').val(data1).slider().slider("refresh");
	} else if(webType == 'dimmer') {												// Dimmers like Eltako FUD61
		if(data1 != 'on' && data1 != 'off') {
			$('#'+name+'val').val(data2).slider().slider("refresh");
		} else {
			$('#'+name+'flip').val(data1).slider().slider("refresh");
		};
	} else if(webType == 'shutter') {												// Eltako FSB61
		$('.'+name).removeClass('ui-btn-active');
		if(data1 == "up") {
			$('#'+name+'up').addClass('ui-btn-active');
		} else if(data1 == "down") {
			$('#'+name+'down').addClass('ui-btn-active');
		} else {
			$('#'+name+'stop').addClass('ui-btn-active');
		};
	};
};

function EnOcean_send(name,action) {												// sending EnOcean status changes 
	if(name.getAttribute("data-web-type") == 'dimmer') {
		if(name.value == 'on') {							
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' on', XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' on');											// some logging
		} else if(name.value == 'off') {
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' off', XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' off');												// some logging
		} else {
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' dim '+name.value, XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' dim '+name.value);								// some logging
		};
	} else if(name.getAttribute("data-web-type") == 'switch') {
		ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' on-for-timer 1', XHR: 1 },'',true);
		console.log('SENDING: set '+name.getAttribute("data-send-actor")+' on-for-timer 1');	
	} else if(name.getAttribute("data-web-type") == 'shutter') {
		if(name.id == name.getAttribute("data-actor")+'up') {
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' up', XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' up');							// some logging
		} else if(name.id == name.getAttribute("data-actor")+'stop') {
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' stop', XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' stop');						// some logging
		} else if(name.id == name.getAttribute("data-actor")+'down') {
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' down', XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' down');						// some logging
		} 
	} else if(name.getAttribute("data-web-type") == 'pushbutton') {
		if(action == 'down') {
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' on', XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' on');		
		} else {
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' released', XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' released');
		}
	}; 
};

console.log("Module EnOcean.js successfully loaded");