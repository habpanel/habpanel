HABPanel
========

HABPanel is a lightweight dashboard interface for openHAB.
It is mainly targeted at openHAB 2 even though limited openHAB 1.8 support is still available.

It notably features a quasi-WYSIWYG in-app editor allowing the user to design the dashboard directly on the target device.

## Installation

### openHAB 2

HABPanel is packaged as for openHAB 2 as a bundle.

For end users:
- (not yet available) Enable it in Paper UI, _Extensions > User interfaces_.

For developers:
- Build the project using Eclipse or Maven, copy the .jar bundle in the ```target/``` directory into your openHAB 2 installation's ```addons/``` directory, and it should add itself automatically

Look for a new HABPanel tile in the openHAB 2 main dashboard.

### openHAB 1.8

HABPanel is compatible with openHAB 1 but no longer supported.
Copy (or clone this Git repository) into your openHAB static directory (e.g. ```/usr/share/openhab/webapps/static``` for openHAB .deb packages).
It will be available at ```http://<your-openhab-instance:8080/static/habpanel/web/```.

## Configuration

HABPanel stores its configuration (including sets of dashboards, called panel configurations) as openHAB 2 service configuration variables if available.
This allows sharing of panel configurations between devices.

It will also fallback to the browser's local browser storage if the server-side components are not available. In that case, the configuration will be available to the current browser and device, and will be erased if the browser's private data cleanup features are used.
However, it is possible to export the current configuration object as a JSON object, and import it back to another browser or device. 

## Getting started

- When accessing HABPanel for the first time on a new browser or device, you should be presented with a rather empty screen with a clock, a settings icon (gears) to the left. Click on the icon.
- You're now in edit mode, a link ("Add new dashboard") appeared, as well as an "Advanced settings" link.
- If you previously used HABPanel, are using openHAB 2 and stored some panel configurations on the server, go to "Advanced settings" and click on your previous configuration. Otherwise, create your first dashboard: click on the "Add new dashboard" link and give it a name.
- Click on the dashboard tile to enter the dashboard editor
- Add your first widget: click on "Add Widget" and select the type in the menu (let's say Dummy)
- Move the widget by drag-and-drop and resize it with the white chevron - it appears when you click on the widget
- Click on the gears icon to bring up the widget's settings
- Rename the widget, bind it to a supported openHAB item, adjust some settings and click OK
- Save your configuration by clicking the Save button
- Click Run to see your dashboard in action - use your browser's back button or the arrow to go back to the drawing board
- When you're happy with your set of dashboards, go back to "Advanced settings" and either "Show the local configuration object" (the only available if using openHAB 1) and copy the JSON object somewhere to back it up, or click on "Save the current configuration to a new panel configuration"; this will store it on the openHAB 2 server and make it available for reuse.

## Contributing

HABPanel follows the standard openHAB 2's [contibution guidelines](CONTIBUTING.md) which should be followed by all contributors.

To start developing on HABPanel (it is assumed you have ```npm```, ```bower``` and ```gulp``` available; if not, check their respective docs):

- Clone the repository - protip: clone into your static files directory (```conf/html``` on openHAB2) to allow the client-side application files to be served without reinstalling the bundle.
- Make a new Git branch for your changes
- Run ```npm install```
- Run ```bower install```
- Run ```gulp```

Files in the ```vendor/``` directory should be rebuilt with the above operations.
(note: if adding a new dependency, never add it directly to the project, add it as a bower and/or npm dependency and rebuild the project using the instructions above! You would have to modify the targets in ```gulpfile.js``` as well)

- Package a new version of the bundle using Maven (```mvn clean package``` or use m2e)
- Copy the resulting ```target/org.openhab.ui.habpanel.{VERSION}.jar``` into your server's ```addons``` subfolder to test it.

If everything went well, push your changes to GitHub and request a merge approval of your pull request.

## Acknowledgments

- [angular-atmosphere](https://github.com/spyboost/angular-atmosphere)
- [angular-fullscreen](https://github.com/fabiobiondi/angular-fullscreen)
- [angular-gridster](https://github.com/ManifestWebDesign/angular-gridster)
- [angular-local-storage](https://github.com/grevory/angular-local-storage)
- [angular-prompt](https://github.com/cgross/angular-prompt)
- [angular-slider](https://github.com/angular-slider/angularjs-slider)
- [angular-ui-bootstrap](https://github.com/angular-ui/bootstrap)
- [atmosphere.js](https://github.com/Atmosphere/atmosphere-javascript)
- [D3](https://github.com/d3/d3)
- [ng-knob](https://github.com/RadMie/ng-knob)
- [n3-line-chart](https://github.com/n3-charts/line-chart)
- [sprintf.js](https://github.com/alexei/sprintf.js)
- [iNoBounce](https://github.com/lazd/iNoBounce)



