# Additional notice for openHAB 1.x users

HABPanel is an official openHAB 2 UI and therefore is only supported on openHAB 2.
However, the 'oh1' branch still contains a legacy version with limited compatibility with openHAB 1.8.

If you're using OH1, download (or clone) the contents of the 'oh1' branch into your installation's
static directory (e.g. ```/usr/share/openhab/webapps/static``` for openHAB .deb packages).
It will be available at ```http://<your-openhab-instance:8080/static/habpanel/web/```.


Note that it will also fallback to the browser's local browser storage as the
server-side components are not available. This means the configuration will be available
to the current browser and device, and will be erased if the browser's private data cleanup
features are used. However, it is possible to export the current configuration object as a
JSON object, and import it back to another browser or device. 

# Opening issues

If you're using openHAB 1 and encounter issues with HABPanel, please state so in the issue's
title (prefix it with *[OH1]*).
The same applies when creating threads in
[the discussion group](https://community.openhab.org/c/apps-services/habpanel).
Please understand they're not likely to be addressed as quickly as regular issues though.
