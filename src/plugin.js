import './css/style.css';

import arrayTo from 'd2-utilizr/lib/arrayTo';
import isArray from 'd2-utilizr/lib/isArray';
import objectApplyIf from 'd2-utilizr/lib/objectApplyIf';

import { createChart } from 'd2-charts-api';

import { api, manager, config, init, util } from 'd2-analysis';

import { Layout } from './api/Layout';

// extend
api.Layout = Layout;

// references
var refs = {
    api,
    init
};

// inits
var inits = [
    init.legendSetsInit,
    init.dimensionsInit
];

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

// app manager
var appManager = new manager.AppManager(refs);
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

// session storage manager
var sessionStorageManager = new manager.SessionStorageManager(refs);
refs.sessionStorageManager = sessionStorageManager;

// dependencies
dimensionConfig.setI18nManager(i18nManager);
dimensionConfig.init();
optionConfig.setI18nManager(i18nManager);
optionConfig.init();
periodConfig.setI18nManager(i18nManager);
periodConfig.init();

appManager.applyTo(arrayTo(api));
optionConfig.applyTo(arrayTo(api));

// plugin
function render(plugin, layout) {
    var instanceRefs = Object.assign({}, refs);

    var uiManager = new manager.UiManager(instanceRefs);
    instanceRefs.uiManager = uiManager;
    uiManager.applyTo(arrayTo(api));
    uiManager.preventMask = true;

    var instanceManager = new manager.InstanceManager(instanceRefs);
    instanceRefs.instanceManager = instanceManager;
    instanceManager.apiResource = 'chart';
    instanceManager.apiEndpoint = 'charts';
    instanceManager.apiModule = 'dhis-web-visualizer';
    instanceManager.plugin = true;
    instanceManager.dashboard = chartPlugin.dashboard;
    instanceManager.applyTo(arrayTo(api));

    // instance manager
    uiManager.setInstanceManager(instanceManager);

    instanceManager.setFn(function (_layout) {
        var fn = function (legendSetId) {
            var el = _layout.el;
            var element = document.getElementById(el);
            var response = _layout.getResponse();
            var extraOptions = {
                legendSet: appManager.getLegendSetById(legendSetId),
                dashboard: instanceManager.dashboard
            };

            var { chart } = createChart(response, _layout, el, extraOptions);

            // reg
            uiManager.reg(chart, 'chart');

            // dashboard item resize
            element.setViewportWidth = function (width) {
                chart.setSize(width, undefined, {duration: 50});
            };

            element.setViewportHeight = function (height) {
                chart.setSize(undefined, height, {duration: 50});
            };

            element.setViewportSize = function (width, height) {
                chart.setSize(width, height, {duration: 50});
            };

            // mask
            uiManager.unmask();
        };

        // legend set
        if (_layout.doLegendSet()) {
            appManager.getLegendSetIdByDxId(_layout.getFirstDxId(), function (legendSetId) {
                fn(legendSetId);
            });
        }
        else {
            fn();
        }
    });

    if (plugin.loadingIndicator) {
        uiManager.renderLoadingIndicator(layout.el);
    }

    if (layout.id) {
        instanceManager.getById(layout.id, function (_layout) {
            _layout = new api.Layout(instanceRefs, objectApplyIf(layout, _layout));

            instanceManager.getReport(_layout);
        });
    }
    else {
        instanceManager.getReport(new api.Layout(instanceRefs, layout));
    }
}

global.chartPlugin = new util.Plugin({ refs, inits, renderFn: render, type: 'CHART' });
