function IT_get(webType,name,data1,data2) { 									// Parsing the InterTechno messages recieved via longPoll request
	console.log('RECEIVING: IT '+webType+' '+name+' '+data1+' '+data2);								
	if(webType == 'switch') {													// Only ON/OFF 
		$('#'+name+'flip').val(data1).slider().slider("refresh");
	};
};

function IT_send(name) {														// sending Intertechno status changes 
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

console.log("Module IT.js successfully loaded");