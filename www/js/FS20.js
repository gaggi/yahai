function FS20_get(webType,name,data1,data2) { 									// Parsing the FS20 messages recieved via longPoll request
	console.log('RECEIVING: FS20 '+webType+' '+name+' '+data1+' '+data2);								
	if(webType == 'switch') {													// Only ON/OFF 
		$('#'+name+'flip').val(data1).slider().slider("refresh");
	};
};

function FS20_send(name) {														// sending FS20 status changes 
	if(name.getAttribute("data-web-type") == 'switch') {
		if(name.value == 'on') {							
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' on', XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' on');											// some logging
		} else if(name.value == 'off') {
			ajaxCall({ cmd: 'set '+name.getAttribute("data-send-actor")+' off', XHR: 1 },'',true);
			console.log('SENDING: set '+name.getAttribute("data-send-actor")+' off');												// some logging
		};
	}; 
};

console.log("Module FS20.js successfully loaded");