# Additional documentation for openHAB 1.x users

HABPanel development is now focused on openHAB 2.
However, there is still limited compatibility for openHAB 1.8.

If you're using OH1, copy (or clone this Git repository) into your openHAB
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

