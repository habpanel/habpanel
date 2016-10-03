(function() {
'use strict';

    angular
        .module('app.services')
        .service('SitemapTranslationService', SitemapTranslationService);

    SitemapTranslationService.$inject = ['OHService'];
    function SitemapTranslationService(OHService) {
        this.buildWidgetsFromSitemapPage = buildWidgets;
        this.savePageLayoutToDashboard = savePageLayoutToDashboard; 

        ////////////////

        function buildWidgets(widgets, srcwidgets, pagelayout, cols, row, col) {
            if (!cols) cols = 12;
            if (!row) row = 0;
            if (!col) col = 0;

            angular.forEach(srcwidgets, function (widget) {
                var w;
                switch (widget.type) {
                    case "Frame":
                        w = {
                            id: widget.widgetId,
                            sizeX: 12,
                            sizeY: 1,
                            type: 'label',
                            name: widget.label,
                            background: 'black'
                        };
                        break;
                    case "Colorpicker":
                        w = {
                            id: widget.widgetId,
                            sizeX: 4,
                            sizeY: 4,
                            type: 'colorpicker',
                            name: widget.label,
                            item: (widget.item) ? widget.item.name : null
                        };
                        break;
                    case "Slider":
                        w = {
                            id: widget.widgetId,
                            sizeX: 4,
                            sizeY: 4,
                            type: 'slider',
                            name: widget.label,
                            item: (widget.item) ? widget.item.name : null
                        };
                        break;
                    case "Setpoint":
                        w = {
                            id: widget.widgetId,
                            sizeX: 4,
                            sizeY: 4,
                            type: 'knob',
                            name: widget.label,
                            item: (widget.item) ? widget.item.name : null
                        };
                        break;
                    case "Switch":
                        w = {
                            id: widget.widgetId,
                            sizeX: 4,
                            sizeY: 4,
                            type: 'switch',
                            name: widget.label,
                            item: (widget.item) ? widget.item.name : null,
                            iconset: (widget.icon) ? 'eclipse-smarthome-classic' : undefined,
                            icon: (widget.icon) ? widget.icon : undefined,
                        };
                        break;
                    case "Image":
                        w = {
                            id: widget.widgetId,
                            sizeX: 4,
                            sizeY: 4,
                            type: 'image',
                            name: widget.label,
                            url: widget.url
                        };
                        break;
                    case "Webview":
                        w = {
                            id: widget.widgetId,
                            sizeX: 4,
                            sizeY: 4,
                            type: 'frame',
                            name: widget.label,
                            frameUrl: widget.url
                        };
                        break;
                    case "Chart":
                        w = {
                            id: widget.widgetId,
                            sizeX: 4,
                            sizeY: 4,
                            type: 'chart',
                            name: widget.label,
                            item: (widget.item) ? widget.item.name : null,
                            charttype: 'default'
                        };
                        break;
                    default:
                        w = {
                            id: widget.widgetId,
                            sizeX: 4,
                            sizeY: 4,
                            type: 'dummy',
                            name: widget.label,
                            iconset: (widget.icon) ? 'eclipse-smarthome-classic' : undefined,
                            icon: (widget.icon) ? widget.icon : undefined,
                            item: (widget.item) ? widget.item.name : '',
                            background: 'transparent'
                        };
                        break;
                }

                if (col + w.sizeX > cols) {
                    col = 0;
                    row += widgets[widgets.length-1].sizeY;
                }
                w.row = row;
                w.col = col;
                col += w.sizeX;
                if (col >= cols) {
                    col = 0;
                    row += w.sizeY;
                }
                console.log('positioning ' + w.name + ' at row=' + w.row + ", col=" + w.col);

                if (widget.linkedPage) {
                    w.ispagelink = true;
                    w.pageid = widget.linkedPage.id;
                    w.type = 'button';
                    w.background = '#258'; //FIXME: use a variable
                }

                var layout = {};
                if (widget.widgetId && pagelayout && pagelayout[widget.widgetId])
                    layout = pagelayout[widget.widgetId];

                angular.extend(w, layout);

                widgets.push(w);

                if (widget.widgets) {
                    var pos = buildWidgets(widgets, widget.widgets, pagelayout, cols, row, col);
                    row = pos.row;
                    col = pos.col;
                }

            }); 

            return { row: row, col: col};
        }

        function savePageLayoutToDashboard(widgets, page, dashboard) {
            if (!dashboard.pagelayouts[page.id])
                dashboard.pagelayouts[page.id] = {};

            angular.forEach(widgets, function (widget) {
                var layout = angular.copy(widget);
                // strip settings coming from the sitemap
                if (layout.name) delete layout.name;
                if (layout.item) delete layout.item;
                if (layout.icon) delete layout.icon;
                if (layout.iconset) delete layout.iconset;
                if (layout.floor) delete layout.floor;
                if (layout.ceil) delete layout.ceil;
                if (layout.step) delete layout.step;
                if (layout.ispagelink) delete layout.ispagelink;
                if (layout.pageid) delete layout.pageid;
                if (layout.url) delete layout.url;

                dashboard.pagelayouts[page.id][layout.id] = layout;
            })
        }
    }
})();