import './css/style.css';

import isArray from 'd2-utilizr/lib/isArray';
import objectApplyIf from 'd2-utilizr/lib/objectApplyIf';
import arrayTo from 'd2-utilizr/lib/arrayTo';

import { api, chart, manager, config, init, override } from 'd2-analysis';

import { Layout } from './api/Layout';

// override
override.extChartOverrides();

// extend
api.Layout = Layout;

// references
var refs = {
    api,
    chart
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

// app manager
var appManager = new manager.AppManager();
refs.appManager = appManager;

// calendar manager
var calendarManager = new manager.CalendarManager();
refs.calendarManager = calendarManager;

// request manager
var requestManager = new manager.RequestManager();
refs.requestManager = requestManager;

// i18n manager
var i18nManager = new manager.I18nManager();
refs.i18nManager = i18nManager;

// sessionstorage manager
var sessionStorageManager = new manager.SessionStorageManager();
refs.sessionStorageManager = sessionStorageManager;

dimensionConfig.setI18nManager(i18nManager);
optionConfig.setI18nManager(i18nManager);
periodConfig.setI18nManager(i18nManager);

appManager.applyTo(arrayTo(api));
optionConfig.applyTo(arrayTo(api));

// plugin
var Plugin = function() {
    var t = this;

    var _isLoaded = false;

    t.url = null;
    t.username = null;
    t.password = null;
    t.spinner = false;

    t.load = function(...layouts) {
        if (!layouts.length) {
            return;
        }

        layouts = isArray(layouts[0]) ? layouts[0] : layouts;

        _initialize(layouts);
    };

    var _initialize = function(layouts) {
        if (!layouts.length) {
            return;
        }

        if (_isLoaded) {
            _load(layouts);
            return;
        }

        appManager.path = t.url;
        appManager.setAuth(t.username && t.password ? t.username + ':' + t.password : null);

        // user account
        $.getJSON(appManager.path + '/api/me/user-account.json').done(function(userAccount) {
            appManager.userAccount = userAccount;

            requestManager.add(new api.Request(init.legendSetsInit(refs)));
            requestManager.add(new api.Request(init.dimensionsInit(refs)));

            _isLoaded = true;

            requestManager.set(_load, layouts);
            requestManager.run();
        });
    };

    var _load = function(layouts) {
        layouts.forEach(function(layout) {
            if (t.spinner) {
                $('#' + layout.el).append('<div class="spinner"></div>');
            }

            var instanceRefs = {
                dimensionConfig,
                optionConfig,
                periodConfig,
                chartConfig,
                api,
                chart,
                appManager,
                calendarManager,
                requestManager,
                sessionStorageManager,
            };

            var uiManager = new manager.UiManager();
            instanceRefs.uiManager = uiManager;
            uiManager.applyTo(arrayTo(api));

            var instanceManager = new manager.InstanceManager(instanceRefs);
            instanceRefs.instanceManager = instanceManager;
            instanceManager.apiResource = 'charts';
            instanceManager.isPlugin = true;
            instanceManager.applyTo(arrayTo(api));

                // instance manager
            uiManager.setInstanceManager(instanceManager);

            instanceManager.setFn(function(layout) {

                var legendSetId;

                var fn = function() {

                    var chartObject = chart.Chart({
                        instanceRefs,
                        layout,
                        legendSetId
                    });

                    // render
                    uiManager.update(chartObject);

                    // reg
                    uiManager.reg(chartObject, 'chart');

                    // mask
                    uiManager.unmask();
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

            if (layout.id) {
                instanceManager.getById(layout.id, function(_layout) {
                    _layout = new api.Layout(instanceRefs, objectApplyIf(layout, _layout));
                    instanceManager.getReport(_layout);
                });
            }
            else {
                instanceManager.getReport(layout);
            }
        });
    };
};

global.chartPlugin = new Plugin();
