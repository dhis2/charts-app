import './css/style.css';

import arrayTo from 'd2-utilizr/lib/arrayTo';
import isArray from 'd2-utilizr/lib/isArray';
import objectApplyIf from 'd2-utilizr/lib/objectApplyIf';

import { createChart } from 'd2-charts-api';

import { api, manager, config, init, util } from 'd2-analysis';

import { Layout } from './api/Layout';

import { init as d2init, getInstance } from 'd2';

// extend
api.Layout = Layout;

// references
var refs = {
    api,
    init,
};

// inits
var inits = [init.legendSetsInit, init.dimensionsInit];

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
appManager.apiVersion = 29;
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

// generic period names without year for xAxis labels
function computeGenericPeriodNames(responses) {
    const xAxisRes = responses.reduce((out, res) => {
        if (out.metaData) {
            if (res.metaData.dimensions.pe.length > out.metaData.dimensions.pe.length) {
                out = res;
            }
        } else {
            out = res;
        }

        return out;
    }, {});

    const metadata = xAxisRes.metaData;

    return metadata.dimensions.pe.reduce((genericPeriodNames, periodId) => {
        const name = metadata.items[periodId].name;

        // until the day the backend will support this in the API:
        // trim off the trailing year in the period name
        // english names should all have the year at the end of the string
        genericPeriodNames.push(name.replace(/\s+\d{4}$/, ''));

        return genericPeriodNames;
    }, []);
}

// Year over year special handling
function apiFetchAnalyticsForYearOverYear(current, options) {
    d2init({ baseUrl: appManager.getApiPath() });

    var d2;
    var yearlySeriesLabels = [];

    return getInstance()
        .then(d2Instance => {
            d2 = d2Instance;
        })
        .then(() => {
            let yearlySeriesReq = new d2.analytics.request()
                .addPeriodDimension(current.yearlySeries)
                .withSkipData(true)
                .withSkipMeta(false)
                .withIncludeMetadataDetails(true);

            if (options.relativePeriodDate) {
                yearlySeriesReq = yearlySeriesReq.withRelativePeriodDate(
                    options.relativePeriodDate
                );
            }

            return d2.analytics.aggregate.fetch(yearlySeriesReq);
        })
        .then(yearlySeriesRes => {
            const requests = [];

            const now = new Date();
            const currentDay = ('' + now.getDate()).padStart(2, 0);
            const currentMonth = ('' + (now.getMonth() + 1)).padStart(2, 0);

            yearlySeriesRes.metaData.dimensions['pe'].forEach(period => {
                yearlySeriesLabels.push(yearlySeriesRes.metaData.items[period].name);

                const startDate = `${period}-${currentMonth}-${currentDay}`;

                const req = new d2.analytics.request()
                    .fromModel(current)
                    .withParameters(options)
                    .withRelativePeriodDate(startDate);

                requests.push(d2.analytics.aggregate.get(req));
            });

            return Promise.all(requests);
        })
        .then(responses => {
            return Promise.resolve({
                responses: responses.map(res => new d2.analytics.response(res)),
                yearlySeriesLabels,
            });
        })
        .catch(e => console.log(e));
}

// plugin
function render(plugin, layout) {
    if (!util.dom.validateTargetDiv(layout.el)) {
        return;
    }

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

    // options passed to createChart
    var extraOptions = {};

    instanceManager.setFn(function(_layout) {
        if (!util.dom.validateTargetDiv(_layout.el)) {
            return;
        }

        var fn = function(legendSetId) {
            var el = _layout.el;
            var element = document.getElementById(el);
            var response = _layout.getResponse();

            extraOptions.legendSet = appManager.getLegendSetById(legendSetId);
            extraOptions.dashboard = instanceManager.dashboard;

            var { chart } = createChart(response, _layout, el, extraOptions);

            // reg
            uiManager.reg(chart, 'chart');

            // dashboard item resize
            element.setViewportWidth = function(width) {
                chart.setSize(width, undefined, { duration: 50 });
            };

            element.setViewportHeight = function(height) {
                chart.setSize(undefined, height, { duration: 50 });
            };

            element.setViewportSize = function(width, height) {
                chart.setSize(width, height, { duration: 50 });
            };

            // mask
            uiManager.unmask();
        };

        // legend set
        if (_layout.doLegendSet()) {
            appManager.getLegendSetIdByDxId(_layout.getFirstDxId(), function(legendSetId) {
                fn(legendSetId);
            });
        } else {
            fn();
        }
    });

    if (plugin.loadingIndicator) {
        uiManager.renderLoadingIndicator(layout.el);
    }

    if (layout.id) {
        instanceManager.getById(layout.id, function(_layout) {
            _layout = new api.Layout(instanceRefs, objectApplyIf(layout, _layout));

            if (!util.dom.validateTargetDiv(_layout.el)) {
                return;
            }

            // special handling for YEAR_OVER_YEAR chart types
            if (_layout.type.match(/^YEAR_OVER_YEAR/i)) {
                const options = {};

                if (_layout.aggregationType && _layout.aggregationType !== 'DEFAULT') {
                    options.aggregationType = _layout.aggregationType;
                }

                if (_layout.completedOnly) {
                    options.completedOnly = _layout.completedOnly;
                }

                apiFetchAnalyticsForYearOverYear(_layout, options).then(
                    ({ responses, yearlySeriesLabels }) => {
                        // set responses in layout object so getReport does not perform analytics requests
                        _layout.setResponse(responses);

                        // extra options to pass to createChart() special for YOY chart types
                        extraOptions.yearlySeries = yearlySeriesLabels;
                        extraOptions.xAxisLabels = computeGenericPeriodNames(responses);

                        instanceManager.getReport(_layout);
                    }
                );
            } else {
                instanceManager.getReport(_layout);
            }
        });
    } else {
        instanceManager.getReport(new api.Layout(instanceRefs, layout), false, false, false, null, {
            noError: true,
            errorMessage: 'No data to display',
        });
    }
}

global.chartPlugin = new util.Plugin({ refs, inits, renderFn: render, type: 'CHART' });
