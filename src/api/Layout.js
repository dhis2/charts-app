import isString from 'd2-utilizr/lib/isString';
import isNumber from 'd2-utilizr/lib/isNumber';
import isBoolean from 'd2-utilizr/lib/isBoolean';
import isObject from 'd2-utilizr/lib/isObject';
import isEmpty from 'd2-utilizr/lib/isEmpty';

import { Record, Layout as d2aLayout } from 'd2-analysis';

export var Layout = function(refs, c, applyConfig, forceApplyConfig) {
    var t = this;

    c = isObject(c) ? c : {};

    // inherit
    Object.assign(t, new d2aLayout(refs, c, applyConfig));

    //type
    t.type = refs.chartConfig.s2c[c.type] || refs.chartConfig.client[c.type] || refs.chartConfig.client['column'];

    // options
    t.showValues = isBoolean(c.showData) ? c.showData : (isBoolean(c.showValues) ? c.showValues : true);
    t.hideEmptyRows = isBoolean(c.hideEmptyRows) ? c.hideEmptyRows : (isBoolean(c.hideEmptyRows) ? c.hideEmptyRows : true);
    t.showTrendLine = isBoolean(c.regression) ? c.regression : (isBoolean(c.showTrendLine) ? c.showTrendLine : false);

    t.completedOnly = isBoolean(c.completedOnly) ? c.completedOnly : false;

    t.targetLineValue = isNumber(c.targetLineValue) ? c.targetLineValue : null;
    t.targetLineTitle = isString(c.targetLineLabel) && !isEmpty(c.targetLineLabel) ? c.targetLineLabel :
        (isString(c.targetLineTitle) && !isEmpty(c.targetLineTitle) ? c.targetLineTitle : null);
    t.baseLineValue = isNumber(c.baseLineValue) ? c.baseLineValue : null;
    t.baseLineTitle = isString(c.baseLineLabel) && !isEmpty(c.baseLineLabel) ? c.baseLineLabel :
        (isString(c.baseLineTitle) && !isEmpty(c.baseLineTitle) ? c.baseLineTitle : null);
    t.sortOrder = isNumber(c.sortOrder) ? c.sortOrder : 0;
    t.aggregationType = isString(c.aggregationType) ? c.aggregationType : 'DEFAULT';

    t.rangeAxisMaxValue = isNumber(c.rangeAxisMaxValue) ? c.rangeAxisMaxValue : null;
    t.rangeAxisMinValue = isNumber(c.rangeAxisMinValue) ? c.rangeAxisMinValue : null;
    t.rangeAxisSteps = isNumber(c.rangeAxisSteps) ? c.rangeAxisSteps : null;
    t.rangeAxisDecimals = isNumber(c.rangeAxisDecimals) ? c.rangeAxisDecimals : null;
    t.rangeAxisTitle = isString(c.rangeAxisLabel) && !isEmpty(c.rangeAxisLabel) ? c.rangeAxisLabel :
        (isString(c.rangeAxisTitle) && !isEmpty(c.rangeAxisTitle) ? c.rangeAxisTitle : null);
    t.domainAxisTitle = isString(c.domainAxisLabel) && !isEmpty(c.domainAxisLabel) ? c.domainAxisLabel :
        (isString(c.domainAxisTitle) && !isEmpty(c.domainAxisTitle) ? c.domainAxisTitle : null);

    t.hideLegend = isBoolean(c.hideLegend) ? c.hideLegend : false;
    t.hideTitle = isBoolean(c.hideTitle) ? c.hideTitle : false;
    t.title = isString(c.title) && !isEmpty(c.title) ? c.title : null;

    // graph map
    t.parentGraphMap = isObject(c.parentGraphMap) ? c.parentGraphMap : null;

    // style
    if (isObject(c.domainAxisStyle)) {
        t.domainAxisStyle = c.domainAxisStyle;
    }

    if (isObject(c.rangeAxisStyle)) {
        t.rangeAxisStyle = c.rangeAxisStyle;
    }

    if (isObject(c.legendStyle)) {
        t.legendStyle = c.legendStyle;
    }

    if (isObject(c.seriesStyle)) {
        t.seriesStyle = c.seriesStyle;
    }
    
    // force apply
    Object.assign(t, forceApplyConfig);

    t.getRefs = function() {
        return refs;
    };
};

Layout.prototype = d2aLayout.prototype;

Layout.prototype.clone = function() {
    var t = this,
        refs = this.getRefs();

    var layout = new refs.api.Layout(refs, JSON.parse(JSON.stringify(t)));

    layout.setResponse(t.getResponse());
    layout.setAccess(t.getAccess());
    layout.setDataDimensionItems(t.getDataDimensionItems());

    return layout;
};
