import isString from 'd2-utilizr/lib/isString';
import isNumber from 'd2-utilizr/lib/isNumber';
import isBoolean from 'd2-utilizr/lib/isBoolean';
import isObject from 'd2-utilizr/lib/isObject';

export var OptionsWindow;

OptionsWindow = function(c) {
    var t = this,

        appManager = c.appManager,
        uiManager = c.uiManager,
        instanceManager = c.instanceManager,
        i18n = c.i18nManager.get(),
        optionConfig = c.optionConfig,

        showValues,
        percentStackedValues,
        useCumulativeValues,
        hideEmptyRows,
        regressionType,
        targetLineValue,
        targetLineTitle,
        baseLineValue,
        baseLineTitle,
        sortOrder,
        aggregationType,

        rangeAxisMinValue,
        rangeAxisMaxValue,
        rangeAxisSteps,
        rangeAxisDecimals,
        rangeAxisTitle,
        domainAxisTitle,

        hideLegend,
        hideTitle,
        title,
        hideSubtitle,
        subtitle,

        completedOnly,

        data,
        axes,
        general,
        events,
        window,

        comboBottomMargin = 1,
        checkboxBottomMargin = 2,
        separatorTopMargin = 6,
        cmpWidth = 360,
        labelWidth = 125,
        numberWidth = 80;

    showValues = Ext.create('Ext.form.field.Checkbox', {
        boxLabel: i18n.show_values,
        style: 'margin-bottom:' + checkboxBottomMargin + 'px',
        checked: true
    });

    percentStackedValues = Ext.create('Ext.form.field.Checkbox', {
        boxLabel: i18n.use_percent_stacked_values,
        style: 'margin-bottom:' + checkboxBottomMargin + 'px'
    });

    useCumulativeValues = Ext.create('Ext.form.field.Checkbox', {
        boxLabel: i18n.use_cumulative_values,
        style: 'margin-bottom:' + checkboxBottomMargin + 'px'
    });

    hideEmptyRows = Ext.create('Ext.form.field.Checkbox', {
        boxLabel: i18n.hide_empty_categories,
        style: 'margin-bottom:' + separatorTopMargin + 'px'
    });

    regressionType = Ext.create('Ext.form.field.ComboBox', {
        cls: 'ns-combo',
        style: 'margin-bottom:' + comboBottomMargin + 'px',
        width: cmpWidth,
        labelWidth: 125,
        fieldLabel: i18n.trend_line,
        labelStyle: 'color:#333',
        queryMode: 'local',
        valueField: 'id',
        editable: false,
        value: 'NONE',
        store: Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data: [
                {id: 'NONE', text: i18n.none},
                {id: 'LINEAR', text: i18n.linear}
            ]
        })
    });

    targetLineValue = Ext.create('Ext.form.field.Number', {
        width: numberWidth,
        height: 18,
        listeners: {
            change: function(nf) {
                targetLineTitle.xable();
            }
        }
    });

    targetLineTitle = Ext.create('Ext.form.field.Text', {
        style: 'margin-left:1px; margin-bottom:1px',
        fieldStyle: 'padding-left:3px',
        width: cmpWidth - labelWidth - 5 - numberWidth - 1,
        maxLength: 100,
        enforceMaxLength: true,
        disabled: true,
        xable: function() {
            this.setDisabled(!targetLineValue.getValue() && !isNumber(targetLineValue.getValue()));
        }
    });

    baseLineValue = Ext.create('Ext.form.field.Number', {
        //cls: 'gis-numberfield',
        width: numberWidth,
        height: 18,
        listeners: {
            change: function(nf) {
                baseLineTitle.xable();
            }
        }
    });

    baseLineTitle = Ext.create('Ext.form.field.Text', {
        style: 'margin-left:1px; margin-bottom:1px',
        fieldStyle: 'padding-left:3px',
        width: cmpWidth - labelWidth - 5 - numberWidth - 1,
        maxLength: 100,
        enforceMaxLength: true,
        disabled: true,
        xable: function() {
            this.setDisabled(!baseLineValue.getValue() && !isNumber(baseLineValue.getValue()));
        }
    });

    sortOrder = Ext.create('Ext.form.field.ComboBox', {
        cls: 'ns-combo',
        style: 'margin-bottom:' + comboBottomMargin + 'px',
        width: cmpWidth,
        labelWidth: 125,
        fieldLabel: i18n.sort_order,
        labelStyle: 'color:#333',
        queryMode: 'local',
        valueField: 'id',
        editable: false,
        value: 0,
        store: Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data: [
                {id: 0, text: i18n.none},
                {id: -1, text: i18n.low_to_high},
                {id: 1, text: i18n.high_to_low}
            ]
        })
    });

    aggregationType = Ext.create('Ext.form.field.ComboBox', {
        cls: 'ns-combo',
        style: 'margin-bottom:' + comboBottomMargin + 'px',
        width: cmpWidth,
        labelWidth: 125,
        fieldLabel: i18n.aggregation_type,
        labelStyle: 'color:#333',
        queryMode: 'local',
        valueField: 'id',
        displayField: 'name',
        editable: false,
        value: optionConfig.getAggregationType('def').id,
        store: Ext.create('Ext.data.Store', {
            fields: ['id', 'name', 'index'],
            data: optionConfig.getAggregationTypeRecords()
        })
    });

    // axes
    rangeAxisMinValue = Ext.create('Ext.form.field.Number', {
        width: numberWidth,
        height: 18,
        labelWidth: 125
    });

    rangeAxisMaxValue = Ext.create('Ext.form.field.Number', {
        width: numberWidth,
        height: 18,
        labelWidth: 125,
        style: 'margin-left:1px'
    });

    rangeAxisSteps = Ext.create('Ext.form.field.Number', {
        width: labelWidth + 5 + numberWidth,
        height: 18,
        fieldLabel: 'Range axis tick steps',
        labelStyle: 'color:#333',
        labelWidth: 125,
        minValue: 1
    });

    rangeAxisDecimals = Ext.create('Ext.form.field.Number', {
        width: labelWidth + 5 + numberWidth,
        height: 18,
        fieldLabel: 'Range axis decimals',
        labelStyle: 'color:#333',
        labelWidth: 125,
        minValue: 0,
        maxValue: 20
    });

    rangeAxisTitle = Ext.create('Ext.form.field.Text', {
        width: cmpWidth,
        fieldLabel: i18n.range_axis_label,
        labelStyle: 'color:#333',
        labelWidth: 125,
        maxLength: 100,
        enforceMaxLength: true,
        style: 'margin-bottom:1px'
    });

    domainAxisTitle = Ext.create('Ext.form.field.Text', {
        width: cmpWidth,
        fieldLabel: i18n.domain_axis_label,
        labelStyle: 'color:#333',
        labelWidth: 125,
        maxLength: 100,
        enforceMaxLength: true,
        style: 'margin-bottom:1px'
    });

    // general
    hideLegend = Ext.create('Ext.form.field.Checkbox', {
        boxLabel: i18n.hide_legend,
        style: 'margin-bottom:' + checkboxBottomMargin + 'px'
    });

    hideTitle = Ext.create('Ext.form.field.Checkbox', {
        boxLabel: i18n.hide_chart_title,
        style: `margin-bottom:${ checkboxBottomMargin }px; margin-right: 5px`,
        width: 125,
        listeners: {
            change: function() {
                title.xable();
            }
        }
    });

    title = Ext.create('Ext.form.field.Text', {
        width: cmpWidth - labelWidth,
        emptyText: i18n.chart_title,
        maxLength: 100,
        enforceMaxLength: true,
        style: 'margin-bottom:0',
        xable: function() {
            this.setDisabled(hideTitle.getValue());
        }
    });

    hideSubtitle = Ext.create('Ext.form.field.Checkbox', {
        boxLabel: i18n.hide_chart_subtitle,
        style: `margin-bottom:${ checkboxBottomMargin }px; margin-right:5px`,
        width: 125,
        listeners: {
            change: function() {
                subtitle.xable();
            }
        }
    });

    subtitle = Ext.create('Ext.form.field.Text', {
        width: cmpWidth - labelWidth,
        emptyText: i18n.chart_subtitle,
        maxLength: 100,
        enforceMaxLength: true,
        style: 'margin-bottom:0',
        xable: function() {
            this.setDisabled(hideSubtitle.getValue());
        }
    });

    // events
    completedOnly = Ext.create('Ext.form.field.Checkbox', {
        boxLabel: i18n.include_only_completed_events_only,
        style: 'margin-bottom:' + checkboxBottomMargin + 'px',
    });

    data = {
        xtype: 'container',
        bodyStyle: 'border:0 none',
        style: 'margin-left:14px',
        items: [
            showValues,
            percentStackedValues,
            useCumulativeValues,
            hideEmptyRows,
            regressionType,
            {
                xtype: 'container',
                layout: 'column',
                bodyStyle: 'border:0 none',
                items: [
                    {
                        bodyStyle: 'border:0 none; padding-top:3px; margin-right:5px; color:#333',
                        width: 130,
                        html: 'Target value / title:'
                    },
                    targetLineValue,
                    targetLineTitle
                ]
            },
            {
                xtype: 'container',
                layout: 'column',
                bodyStyle: 'border:0 none',
                items: [
                    {
                        bodyStyle: 'border:0 none; padding-top:3px; margin-right:5px; color:#333',
                        width: 130,
                        html: 'Base value / title:'
                    },
                    baseLineValue,
                    baseLineTitle
                ]
            },
            sortOrder,
            aggregationType
        ]
    };

    axes = {
        bodyStyle: 'border:0 none',
        style: 'margin-left:14px',
        items: [
            {
                layout: 'column',
                bodyStyle: 'border:0 none',
                items: [
                    {
                        bodyStyle: 'border:0 none; padding-top:3px; margin-right:5px; color:#333',
                        width: 130,
                        html: 'Range axis min/max:'
                    },
                    rangeAxisMinValue,
                    rangeAxisMaxValue
                ]
            },
            rangeAxisSteps,
            rangeAxisDecimals,
            rangeAxisTitle,
            domainAxisTitle
        ]
    };

    general = {
        bodyStyle: 'border:0 none',
        style: 'margin-left:14px',
        items: [
            hideLegend,
            {
                layout: 'column',
                bodyStyle: 'border:0 none; padding-bottom:1px',
                items: [
                    hideTitle,
                    title
                ]
            },
            {
                layout: 'column',
                bodyStyle: 'border:0 none; padding-bottom:1px',
                items: [
                    hideSubtitle,
                    subtitle
                ]
            },
        ]
    };

    events = {
        bodyStyle: 'border:0 none',
        style: 'margin-left:14px',
        items: [
            completedOnly
        ]
    };

    window = Ext.create('Ext.window.Window', {
        title: i18n.chart_options,
        bodyStyle: 'background-color:#fff; padding:3px',
        closeAction: 'hide',
        autoShow: true,
        modal: true,
        resizable: false,
        hideOnBlur: true,
        reset: function() {
            this.setOptions();
        },
        getOptions: function() {
            return {
                showValues: showValues.getValue(),
                percentStackedValues: percentStackedValues.getValue(),
                useCumulativeValues: useCumulativeValues.getValue(),
                hideEmptyRows: hideEmptyRows.getValue(),
                regressionType: regressionType.getValue(),
                completedOnly: completedOnly.getValue(),
                targetLineValue: targetLineValue.getValue(),
                targetLineTitle: targetLineTitle.getValue(),
                baseLineValue: baseLineValue.getValue(),
                baseLineTitle: baseLineTitle.getValue(),
                sortOrder: sortOrder.getValue(),
                aggregationType: aggregationType.getValue(),
                rangeAxisMaxValue: rangeAxisMaxValue.getValue(),
                rangeAxisMinValue: rangeAxisMinValue.getValue(),
                rangeAxisSteps: rangeAxisSteps.getValue(),
                rangeAxisDecimals: rangeAxisDecimals.getValue(),
                rangeAxisTitle: rangeAxisTitle.getValue(),
                domainAxisTitle: domainAxisTitle.getValue(),
                hideLegend: hideLegend.getValue(),
                hideTitle: hideTitle.getValue(),
                title: title.getValue(),
                hideSubtitle: hideSubtitle.getValue(),
                subtitle: subtitle.getValue()
            };
        },
        setOptions: function(layout) {
            layout = layout || {};

            showValues.setValue(isBoolean(layout.showValues) ? layout.showValues : true);
            percentStackedValues.setValue(isBoolean(layout.percentStackedValues) ? layout.percentStackedValues : true);
            useCumulativeValues.setValue(isBoolean(layout.useCumulativeValues) ? layout.useCumulativeValues : true);
            hideEmptyRows.setValue(isBoolean(layout.hideEmptyRows) ? layout.hideEmptyRows : false);
            regressionType.setValue(isString(layout.regressionType) ? layout.regressionType : 'NONE');

            completedOnly.setValue(isBoolean(layout.completedOnly) ? layout.completedOnly : false);

            // target line
            if (isNumber(layout.targetLineValue)) {
                targetLineValue.setValue(layout.targetLineValue);
            }
            else {
                targetLineValue.reset();
            }

            if (isString(layout.targetLineTitle)) {
                targetLineTitle.setValue(layout.targetLineTitle);
            }
            else {
                targetLineTitle.reset();
            }

            // base line
            if (isNumber(layout.baseLineValue)) {
                baseLineValue.setValue(layout.baseLineValue);
            }
            else {
                baseLineValue.reset();
            }

            if (isString(layout.baseLineTitle)) {
                baseLineTitle.setValue(layout.baseLineTitle);
            }
            else {
                baseLineTitle.reset();
            }

            sortOrder.setValue(isNumber(layout.sortOrder) ? layout.sortOrder : 0);
            aggregationType.setValue(isString(layout.aggregationType) ? layout.aggregationType : optionConfig.getAggregationType('def').id);

            // rangeAxisMaxValue
            if (isNumber(layout.rangeAxisMaxValue)) {
                rangeAxisMaxValue.setValue(layout.rangeAxisMaxValue);
            }
            else {
                rangeAxisMaxValue.reset();
            }

            // rangeAxisMinValue
            if (isNumber(layout.rangeAxisMinValue)) {
                rangeAxisMinValue.setValue(layout.rangeAxisMinValue);
            }
            else {
                rangeAxisMinValue.reset();
            }

            // rangeAxisSteps
            if (isNumber(layout.rangeAxisSteps)) {
                rangeAxisSteps.setValue(layout.rangeAxisSteps);
            }
            else {
                rangeAxisSteps.reset();
            }

            // rangeAxisDecimals
            if (isNumber(layout.rangeAxisDecimals)) {
                rangeAxisDecimals.setValue(layout.rangeAxisDecimals);
            }
            else {
                rangeAxisDecimals.reset();
            }

            // range axis title
            if (isString(layout.rangeAxisTitle)) {
                rangeAxisTitle.setValue(layout.rangeAxisTitle);
            }
            else {
                rangeAxisTitle.reset();
            }

            // domain axis title
            if (isString(layout.domainAxisTitle)) {
                domainAxisTitle.setValue(layout.domainAxisTitle);
            }
            else {
                domainAxisTitle.reset();
            }

            hideLegend.setValue(isBoolean(layout.hideLegend) ? layout.hideLegend : false);

            // title
            hideTitle.setValue(isBoolean(layout.hideTitle) ? layout.hideTitle : false);
            if (isString(layout.title)) {
                title.setValue(layout.title);
            }
            else {
                title.reset();
            }

            // subtitle
            hideSubtitle.setValue(isBoolean(layout.hideSubtitle) ? layout.hideSubtitle : false);
            if (isString(layout.subtitle)) {
                subtitle.setValue(layout.subtitle);
            }
            else {
                subtitle.reset();
            }

        },
        items: [
            {
                bodyStyle: 'border:0 none; color:#222; font-size:12px; font-weight:bold',
                style: 'margin-bottom:6px; margin-left:2px',
                html: i18n.data
            },
            data,
            {
                bodyStyle: 'border:0 none; padding:5px'
            },
            {
                bodyStyle: 'border:0 none; color:#222; font-size:12px; font-weight:bold',
                style: 'margin-bottom:6px; margin-left:2px',
                html: i18n.events
            },
            events,
            {
                bodyStyle: 'border:0 none; padding:5px'
            },
            {
                bodyStyle: 'border:0 none; color:#222; font-size:12px; font-weight:bold',
                style: 'margin-bottom:6px; margin-left:2px',
                html: i18n.axes
            },
            axes,
            {
                bodyStyle: 'border:0 none; padding:5px'
            },
            {
                bodyStyle: 'border:0 none; color:#222; font-size:12px; font-weight:bold',
                style: 'margin-bottom:6px; margin-left:2px',
                html: i18n.general
            },
            general
        ],
        bbar: [
            '->',
            {
                text: i18n.hide,
                handler: function() {
                    window.hide();
                }
            },
            {
                text: '<b>' + i18n.update + '</b>',
                handler: function() {
                        instanceManager.getReport();

                    window.hide();
                }
            }
        ],
        listeners: {
            show: function(w) {
                var optionsButton = uiManager.get('optionsButton') || {};

                if (optionsButton.rendered) {
                    uiManager.setAnchorPosition(w, optionsButton);

                    if (!w.hasHideOnBlurHandler) {
                        uiManager.addHideOnBlurHandler(w);
                    }
                }

                // cmp
                w.showValues = showValues;
                w.percentStackedValues = percentStackedValues;
                w.useCumulativeValues = useCumulativeValues;
                w.hideEmptyRows = hideEmptyRows;
                w.regressionType = regressionType;
                w.completedOnly = completedOnly;
                w.targetLineValue = targetLineValue;
                w.targetLineTitle = targetLineTitle;
                w.baseLineValue = baseLineValue;
                w.baseLineTitle = baseLineTitle;
                w.sortOrder = sortOrder;
                w.aggregationType = aggregationType;
                w.rangeAxisMaxValue = rangeAxisMaxValue;
                w.rangeAxisMinValue = rangeAxisMinValue;
                w.rangeAxisSteps = rangeAxisSteps;
                w.rangeAxisDecimals = rangeAxisDecimals;
                w.rangeAxisTitle = rangeAxisTitle;
                w.domainAxisTitle = domainAxisTitle;
                w.hideLegend = hideLegend;
                w.hideTitle = hideTitle;
                w.title = title;
                w.hideSubtitle = hideSubtitle;
                w.subtitle = subtitle;
            }
        }
    });

    return window;
};
