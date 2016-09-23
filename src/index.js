import '../extjs/resources/css/ext-all-gray.css';
import './css/style.css';
import './css/meringue.css';
import 'd2-analysis/css/ui/GridHeaders.css';

import arrayTo from 'd2-utilizr/lib/arrayTo';
import isArray from 'd2-utilizr/lib/isArray';
import isObject from 'd2-utilizr/lib/isObject';

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
var appManager = new manager.AppManager();
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
refs.instanceManager = instanceManager;

    // table manager
var tableManager = new manager.TableManager(refs);
refs.tableManager = tableManager;

// dependencies

    // instance manager
uiManager.setInstanceManager(instanceManager);

    // i18n manager
dimensionConfig.setI18nManager(i18nManager);
optionConfig.setI18nManager(i18nManager);
periodConfig.setI18nManager(i18nManager);
uiManager.setI18nManager(i18nManager);

    // static
appManager.applyTo([].concat(arrayTo(api)));
instanceManager.applyTo(arrayTo(api));
uiManager.applyTo(arrayTo(api));
//dimensionConfig.applyTo(arrayTo(chart));
optionConfig.applyTo([].concat(arrayTo(api)));

// requests
var manifestReq = $.ajax({
    url: 'manifest.webapp',
    dataType: 'text',
    headers: {
        'Accept': 'text/plain; charset=utf-8'
    }
});

var systemInfoUrl = '/api/system/info.json';
var systemSettingsUrl = '/api/systemSettings.json?key=keyCalendar&key=keyDateFormat&key=keyAnalysisRelativePeriod&key=keyHideUnapprovedDataInAnalytics&key=keyAnalysisDigitGroupSeparator';
var userAccountUrl = '/api/me/user-account.json';

var systemInfoReq;
var systemSettingsReq;
var userAccountReq;

manifestReq.done(function(text) {
    appManager.manifest = JSON.parse(text);
    appManager.env = process.env.NODE_ENV;
    appManager.setAuth();
    systemInfoReq = $.getJSON(appManager.getPath() + systemInfoUrl);

systemInfoReq.done(function(systemInfo) {
    appManager.systemInfo = systemInfo;
    appManager.path = systemInfo.contextPath;
    systemSettingsReq = $.getJSON(appManager.getPath() + systemSettingsUrl);

systemSettingsReq.done(function(systemSettings) {
    appManager.systemSettings = systemSettings;
    userAccountReq = $.getJSON(appManager.getPath() + userAccountUrl);

userAccountReq.done(function(userAccount) {
    appManager.userAccount = userAccount;
    calendarManager.setBaseUrl(appManager.getPath());
    calendarManager.setDateFormat(appManager.getDateFormat());
    calendarManager.init(appManager.systemSettings.keyCalendar);

requestManager.add(new api.Request(init.i18nInit(refs)));
requestManager.add(new api.Request(init.authViewUnapprovedDataInit(refs)));
requestManager.add(new api.Request(init.rootNodesInit(refs)));
requestManager.add(new api.Request(init.organisationUnitLevelsInit(refs)));
requestManager.add(new api.Request(init.legendSetsInit(refs)));
requestManager.add(new api.Request(init.dimensionsInit(refs)));
requestManager.add(new api.Request(init.dataApprovalLevelsInit(refs)));

requestManager.set(initialize);
requestManager.run();

});});});});

function initialize() {

    var i18n = i18nManager.get();

    // app manager
    appManager.appName = 'Data Visualizer';
    appManager.sessionName = 'chart';

    // instance manager
    instanceManager.apiResource = 'charts';
    instanceManager.dataStatisticsEventType = 'CHART_VIEW';

    instanceManager.setFn(function(layout) {

        var legendSetId;

        var fn = function() {

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
        if (layout.type === 'gauge' && layout.hasDimension('dx')) {
            var ids = layout.getDimension('dx').getRecordIds();

            if (ids.length) {
                new api.Request({
                    type: 'json',
                    baseUrl: appManager.getPath() + '/api/indicators.json',
                    params: [
                        'filter=id:eq:' + ids[0],
                        'fields=legendSet[id]',
                        'paging=false'
                    ],
                    success: function(json) {
                        if (isArray(json.indicators) && json.indicators.length) {
                            if (isObject(json.indicators[0].legendSet)) {
                                var legendSet = json.indicators[0].legendSet;

                                if (isObject(legendSet)) {
                                    legendSetId = legendSet.id;
                                }
                            }
                        }
                    },
                    complete: function() {
                        fn();
                    }
                }).run();
            }
        }
        else {
            fn();
        }
    });

    // ui manager
    uiManager.disableRightClick();

    uiManager.enableConfirmUnload();

    uiManager.setIntroHtml(function() {
        return '<div class="ns-viewport-text" style="padding:20px">' +
            '<h3>' + i18n.example1 + '</h3>' +
            '<div>- ' + i18n.example2 + '</div>' +
            '<div>- ' + i18n.example3 + '</div>' +
            '<div>- ' + i18n.example4 + '</div>' +
            '<h3 style="padding-top:20px">' + i18n.example5 + '</h3>' +
            '<div>- ' + i18n.example6 + '</div>' +
            '<div>- ' + i18n.example7 + '</div>' +
            '<div>- ' + i18n.example8 + '</div>' +
            '</div>';
    }());

    uiManager.setUpdateFn(function(content) {
        var t = uiManager;

        t.getUpdateComponent().update(content || t.getIntroHtml());
    });

    // windows
    uiManager.reg(LayoutWindow(refs), 'layoutWindow').hide();

    uiManager.reg(OptionsWindow(refs), 'optionsWindow').hide();

    uiManager.reg(ui.FavoriteWindow(refs), 'favoriteWindow').hide();

    // north
    var northRegion = uiManager.reg(ui.NorthRegion(refs), 'northRegion');

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
        chartTypeToolbar: ui.ChartTypeToolbar(refs),
        integrationButtons: [
            tableIntegrationButton,
            defaultIntegrationButton,
            mapIntegrationButton
        ]
    }), 'viewport');

    uiManager.getUpdateComponent().on('resize', function(cmp, width) {
        if (width < 700 && cmp.fullSize) {
            cmp.toggleCmp();
            cmp.fullSize = false;
        }
        else if (width >= 700 && !this.fullSize) {
            cmp.toggleCmp(true);
            cmp.fullSize = true;
        }
    });
}

global.refs = refs;
