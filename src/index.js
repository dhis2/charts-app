import '../extjs/resources/css/ext-all-gray.css';
import './css/style.css';
import './css/meringue.css';
import 'd2-analysis/css/ui/GridHeaders.css';

import arrayTo from 'd2-utilizr/lib/arrayTo';

import { createChart } from 'd2-charts-api';

import { api, manager, config, ui, init, override } from 'd2-analysis';

import { Layout } from './api/Layout';

import { LayoutWindow } from './ui/LayoutWindow.js';
import { OptionsWindow } from './ui/OptionsWindow.js';

// override
override.extOverrides();

// extend
api.Layout = Layout;

// references
var refs = {
    api
};

    // dimension config
var dimensionConfig = new config.DimensionConfig();
refs.dimensionConfig = dimensionConfig;

    // option config
var optionConfig = new config.OptionConfig();
refs.optionConfig = optionConfig;

    // period config
var periodConfig = new config.PeriodConfig();
refs.periodConfig = periodConfig;

    // chart config
var chartConfig = new config.ChartConfig();
refs.chartConfig = chartConfig;

    // ui config
var uiConfig = new config.UiConfig();
refs.uiConfig = uiConfig;

    // app manager
var appManager = new manager.AppManager(refs);
appManager.sessionName = 'chart';
appManager.apiVersion = 26;
refs.appManager = appManager;

    // calendar manager
var calendarManager = new manager.CalendarManager(refs);
refs.calendarManager = calendarManager;

    // request manager
var requestManager = new manager.RequestManager(refs);
refs.requestManager = requestManager;

    // i18n manager
var i18nManager = new manager.I18nManager(refs);
refs.i18nManager = i18nManager;

    // sessionstorage manager
var sessionStorageManager = new manager.SessionStorageManager(refs);
refs.sessionStorageManager = sessionStorageManager;

    // ui manager
var uiManager = new manager.UiManager(refs);
refs.uiManager = uiManager;

    // instance manager
var instanceManager = new manager.InstanceManager(refs);
instanceManager.apiResource = 'chart';
instanceManager.apiEndpoint = 'charts';
instanceManager.apiModule = 'dhis-web-visualizer';
instanceManager.dataStatisticsEventType = 'CHART_VIEW';
refs.instanceManager = instanceManager;

// dependencies
uiManager.setInstanceManager(instanceManager);
dimensionConfig.setI18nManager(i18nManager);
optionConfig.setI18nManager(i18nManager);
periodConfig.setI18nManager(i18nManager);
uiManager.setI18nManager(i18nManager);

appManager.applyTo([].concat(arrayTo(api)));
instanceManager.applyTo(arrayTo(api));
uiManager.applyTo(arrayTo(api));
optionConfig.applyTo([].concat(arrayTo(api)));

// common initial requests for setting up the app
appManager.init(() => {
    requestManager.add(new api.Request(refs, init.i18nInit(refs)));
    requestManager.add(new api.Request(refs, init.authViewUnapprovedDataInit(refs)));
    requestManager.add(new api.Request(refs, init.rootNodesInit(refs)));
    requestManager.add(new api.Request(refs, init.organisationUnitLevelsInit(refs)));
    requestManager.add(new api.Request(refs, init.legendSetsInit(refs)));
    requestManager.add(new api.Request(refs, init.dimensionsInit(refs)));
    requestManager.add(new api.Request(refs, init.dataApprovalLevelsInit(refs)));
    requestManager.add(new api.Request(refs, init.userFavoritesInit(refs)));

    requestManager.set(initialize);
    requestManager.run();
});

function initialize() {
    // i18n init
    var i18n = i18nManager.get();

    optionConfig.init();
    dimensionConfig.init();
    periodConfig.init();

    // ui config
    uiConfig.checkout('aggregate');

    // app manager
    appManager.appName = i18n.data_visualizer || 'Data Visualizer';

    instanceManager.setFn(function(layout) {

        var fn = function(legendSetId) {

            var el = uiManager.getUpdateComponent().body.id;
            var response = layout.getResponse();
            var extraOptions = legendSetId ? {
                legendSet: appManager.getLegendSetById(legendSetId)
            } : undefined;

            var { chart } = createChart(response, layout, el, extraOptions);

            // reg
            uiManager.reg(chart, 'chart');

            // mask
            uiManager.unmask();

            // statistics
            instanceManager.postDataStatistics();
        };

        // legend set
        if (layout.doLegendSet()) {
            appManager.getLegendSetIdByDxId(layout.getFirstDxId(), function(legendSetId) {
                fn(legendSetId);
            });
        }
        else {
            fn();
        }
    });

    // ui manager
    uiManager.disableRightClick();

    uiManager.enableConfirmUnload();
    
    uiManager.introHtmlIsAsync = true;

    var introHtml = function() {
        var html = '<div class="ns-viewport-text" style="padding:20px">' +
            '<h3>' + i18n.example1 + '</h3>' +
            '<div>- ' + i18n.example2 + '</div>' +
            '<div>- ' + i18n.example3 + '</div>' +
            '<div>- ' + i18n.example4 + '</div>' +
            '<h3 style="padding-top:20px">' + i18n.example5 + '</h3>' +
            '<div>- ' + i18n.example6 + '</div>' +
            '<div>- ' + i18n.example7 + '</div>' +
            '<div>- ' + i18n.example8 + '</div>';

        if (appManager.userFavorites.length > 0) {
            html += '<div id="top-favorites" style="margin-top: 20px; padding: 0">';
            html += `<h3>${ i18nManager.get('your_most_viewed_favorites') }</h3>`;

            appManager.userFavorites.forEach(function(favorite) {
                html += '<div>- <a href="javascript:void(0)" class="favorite favorite-li" id="favorite-' + favorite.id + '">' + favorite.name + '</a></div>';
            });

            html += '</div>';
        }

        return html;
    }

    uiManager.setIntroHtml(introHtml());

    uiManager.setUpdateIntroHtmlFn(function() {
        return new api.Request(refs, init.userFavoritesInit(refs)).run()
            .then(() => uiManager.setIntroHtml(introHtml()));
    });

    // windows
    uiManager.reg(LayoutWindow(refs), 'layoutWindow').hide();

    uiManager.reg(OptionsWindow(refs), 'optionsWindow').hide();

    uiManager.reg(ui.FavoriteWindow(refs), 'favoriteWindow').hide();

    // north
    var northRegion = uiManager.reg(ui.NorthRegion(refs), 'northRegion');

    var eastRegion = uiManager.reg(ui.EastRegion(refs), 'eastRegion');

    var westRegionItems = uiManager.reg(ui.WestRegionAggregateItems(refs), 'accordion');

    var chartTypeToolbar = uiManager.reg(ui.ChartTypeToolbar(refs), 'chartTypeToolbar');

    var defaultIntegrationButton = uiManager.reg(ui.IntegrationButton(refs, {
        isDefaultButton: true,
        btnText: i18n.chart,
        btnIconCls: 'ns-button-icon-chart'
    }), 'defaultIntegrationButton');

    var tableIntegrationButton = ui.IntegrationButton(refs, {
        objectName: 'table',
        moduleName: 'dhis-web-pivot',
        btnIconCls: 'ns-button-icon-table',
        btnText: i18n.table,
        menuItem1Text: i18n.go_to_pivot_tables,
        menuItem2Text: i18n.open_this_chart_as_table,
        menuItem3Text: i18n.open_last_pivot_table
    });

    var mapIntegrationButton = ui.IntegrationButton(refs, {
        objectName: 'map',
        moduleName: 'dhis-web-mapping',
        btnIconCls: 'ns-button-icon-map',
        btnText: i18n.map,
        menuItem1Text: i18n.go_to_maps,
        menuItem2Text: i18n.open_this_chart_as_map,
        menuItem3Text: i18n.open_last_map
    });

    // viewport
    uiManager.reg(ui.Viewport(refs, {
        northRegion: northRegion,
        eastRegion: eastRegion,
        westRegionItems: westRegionItems,
        chartTypeToolbar: chartTypeToolbar,
        integrationButtons: [
            tableIntegrationButton,
            defaultIntegrationButton,
            mapIntegrationButton
        ],
        DownloadButtonItems: ui.ChartDownloadButtonItems
    }, {
        getLayoutWindow: function() {
            return uiManager.get('layoutWindow');
        },
        getOptionsWindow: function() {
            return uiManager.get('optionsWindow');
        },
    }), 'viewport');

    uiManager.onResize(function(cmp, width) {
        if (instanceManager.isStateCurrent()) {
            if (uiManager.get('chart')) {
                var body = uiManager.getUpdateComponent().body,
                    buffer = 12;

                var width = body.getWidth() - buffer,
                    height = body.getHeight() - buffer;

                uiManager.get('chart').setSize(width, height, {duration: 50});
            }
        }
    });

    // subscribe functions to viewport regions to update ui on renew
    uiManager.subscribe('centerRegion', () => {
        if (appManager.userFavorites.length) {
            appManager.userFavorites.forEach(function(favorite) {
                Ext.get('favorite-' + favorite.id).addListener('click', function() {
                    instanceManager.getById(favorite.id, null, true);
                });
            });
        }
    });

    uiManager.update();
}

global.refs = refs;
