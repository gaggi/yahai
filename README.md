# yaHAi

> yet another Home Automation interface

## Setting up yaHAi

To get yaHAi to work, you have to enable CORS for the 
FHEMWEB item you wish to use by setting

	attr WEB CORS 1
	
I would highly recommend to enable basicAuth if you wish to
use yaHAi from the internet.

You also have to set the userattr "webType" in your fhem.cfg like

	attr global userattr webType
	
On every device you whish to control via yaHAi you also
have to specify the webType you want like

	attr your_device webType switch

Valid values for webType at the moment are thermostate,dimmer,
shutter and switch.

After that you have to set the address of your pgm2 and its
port inside of yaHAi. 

## Using external devices for controlling

If you have to use a virtual device to control your devices
(like you have to with EnOcean) you should name the virtual
trigger as follows

	define prefix_your_device EnOcean ENOCEANID
	
You can choose whatever prefix you want and define it in the
configuration page of yaHAi later or just leave it blank if 
you control the device directly.