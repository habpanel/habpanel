HABpanel
========

Another take on the dashboard-like web user interface concept for openHAB, with the following features:

- 100% client-side application, put it among your OpenHAB static files, no resources used on the server, nothing to start - if OpenHAB is up, it's up;
- Dashboards are stored in the browser local storage, meaning they can be customized per device (a better way to backup and reuse configurations is definitely needed though);
- Touch-friendly in-app drag-and-drop designer - OpenHAB's sitemaps are not used, it reads the items directly;
- Uses the REST API and receives item updates via Websockets or long polling (unfortunately, this is not working reliably yet);
- Goes fullscreen using the HTML5 Fullscreen API of the browser;
- <a href="https://github.com/angular-slider/angularjs-slider">Sliders!</a> I like sliders.

## Installation

1. Copy (or clone this Git repository) into your openHAB static directory (e.g. ```/usr/share/openhab/webapps/static``` for openHAB .deb packages, or ```/opt/openhab/conf/html``` for openHAB 2, depends on your installation). 
2. That's it.

## Configuration

Nothing for now, it will simply try to connect to the local openHAB instance. This might change in the future.

## First steps

- Navigate to ```http://<your-openhab-instance>:8080/static/habpanel/```
- You should be presented with a screen with a clock, a settings icon (gears) to the left. Click on the icon.
- You're now in edit mode, a link ("Add new dashboard") appeared, click on it and give your first dashboard a name
- Click on the pencil icon to enter the dashboard editor (if you missed it and don't see a "Add Widget" button, go back and enter Edit mode again)
- Add your first widget: click on "Add Widget" and select the type in the menu (let's say Dummy)
- Move the widget by drag-and-drop and resize it with the white chevron
- Click on the gears icon to bring up the widget's settings
- Rename the widget, bind it to a supported openHAB item and click OK
- Save your configuration by clicking the Save button
- Click Run to see your dashboard in action - use your browser's back button or the arrow to go back to the drawing board

## Examples

Here are some working dashboards for my own installation:

![](http://i.imgur.com/hrkL5l7.png)

![](http://i.imgur.com/eURUPuD.png)

![](http://i.imgur.com/7kiG0kf.png)

![](http://i.imgur.com/WuKkXmz.png)

![](http://i.imgur.com/Uo8NJ62.png)

![](http://i.imgur.com/v50fNnA.png)

![](http://i.imgur.com/iUCsjRp.png)

![](http://i.imgur.com/ZmlMlkv.png)

## Disclaimer

This is alpha software, at best. There are a lot of things missing. The code is not clean, there's no testing, no dependency management, few best practices are followed, it's a mess. I know.

## Acknowledgments

- [angular-atmosphere](https://github.com/spyboost/angular-atmosphere)
- [angular-fullscreen](https://github.com/fabiobiondi/angular-fullscreen)
- [angular-gridster](https://github.com/ManifestWebDesign/angular-gridster)
- [angular-local-storage](https://github.com/grevory/angular-local-storage)
- [angular-prompt](https://github.com/cgross/angular-prompt)
- [angular-slider](https://github.com/angular-slider/angularjs-slider)
- [atmosphere.js](https://github.com/Atmosphere/atmosphere-javascript)
