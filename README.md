# yaHAi

> yet another Home Automation interface

## Setting up yaHAi

To get yaHAi working you have to add the userattr "webType" 
in your fhem.cfg like

	attr global userattr webType
	
On every device you whish to control via yaHAi you also
have to specify the webType you want like

	attr your_device webType light

Valid values for webType at the moment are light,dimmer,
shutter and switch.

After that you have to set the address of your pgm2 and its
port inside of yaHAi. BasicAuth have to be turned off at the
moment because of problems in the Cross Site connection via
JavaScript, but im looking for a workaround for it atm.

## Using external devices for controlling

If you have to use a virtual device to control your devices
(like you have to with EnOcean) you should name the virtual
trigger as follows

	define prefix_your_device EnOcean ENOCEANID
	
You can choose whatever prefix you want and define it in the
configuration page of yaHAi later or just leave it blank if 
you control the device directly.