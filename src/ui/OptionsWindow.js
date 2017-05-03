import isString from 'd2-utilizr/lib/isString';
import isNumber from 'd2-utilizr/lib/isNumber';
import isBoolean from 'd2-utilizr/lib/isBoolean';
import isObject from 'd2-utilizr/lib/isObject';

// Options window components
import { CumulativeValuesCheckbox } from 'd2-analysis/lib/ui/Options/CumulativeValues';
import { PercentStackedValuesCheckbox } from 'd2-analysis/lib/ui/Options/PercentStackedValues';
import { ShowValuesCheckbox } from 'd2-analysis/lib/ui/Options/ShowValues';
import { HideLegendCheckbox } from 'd2-analysis/lib/ui/Options/HideLegend';
import { RegressionTypeSelect } from 'd2-analysis/lib/ui/Options/RegressionType';
import { SortOrderSelect } from 'd2-analysis/lib/ui/Options/SortOrder';
import { HideEmptyRowItemsSelect } from 'd2-analysis/lib/ui/Options/HideEmptyRowItems';
import { CompletedOnlyCheckbox } from 'd2-analysis/lib/ui/Options/CompletedOnly';
import { AxisContainer } from 'd2-analysis/lib/ui/Options/Axis';
import { TitleContainer } from 'd2-analysis/lib/ui/Options/Title';
import { SubtitleContainer } from 'd2-analysis/lib/ui/Options/Subtitle';
import { AggregationTypeSelect } from 'd2-analysis/lib/ui/Options/AggregationType';
import { TargetLineContainer } from 'd2-analysis/lib/ui/Options/TargetLine';
import { BaseLineContainer } from 'd2-analysis/lib/ui/Options/BaseLine';

export var OptionsWindow;

OptionsWindow = function(refs) {
    var t = this,

        appManager = refs.appManager,
        uiManager = refs.uiManager,
        instanceManager = refs.instanceManager,
        i18n = refs.i18nManager.get(),
        optionConfig = refs.optionConfig,

        showValues = ShowValuesCheckbox(refs),
        percentStackedValues = PercentStackedValuesCheckbox(refs),
        cumulativeValues = CumulativeValuesCheckbox(refs),
        hideEmptyRowItems = HideEmptyRowItemsSelect(refs),
        regressionType = RegressionTypeSelect(refs),
        targetLineContainer = TargetLineContainer(refs),
        baseLineContainer = BaseLineContainer(refs),
        sortOrder = SortOrderSelect(refs),
        aggregationType = AggregationTypeSelect(refs),

        hideLegend = HideLegendCheckbox(refs),
        titleContainer = TitleContainer(refs),
        subtitleContainer = SubtitleContainer(refs),

        completedOnly = CompletedOnlyCheckbox(refs),

        data,
        axisContainer = AxisContainer(refs),
        general,
        events,
        window;

    // data
    data = {
        xtype: 'container',
        bodyStyle: 'border:0 none',
        style: 'margin-left:14px',
        items: [
            showValues,
            percentStackedValues,
            cumulativeValues,
            hideEmptyRowItems,
            regressionType,
            targetLineContainer,
            baseLineContainer,
            sortOrder,
            aggregationType
        ]
    };

    // general
    general = {
        bodyStyle: 'border:0 none',
        style: 'margin-left:14px',
        items: [
            hideLegend,
            titleContainer,
            subtitleContainer,
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
                cumulativeValues: cumulativeValues.getValue(),
                hideEmptyRowItems: hideEmptyRowItems.getValue(),
                regressionType: regressionType.getValue(),
                completedOnly: completedOnly.getValue(),
                targetLineValue: targetLineContainer.targetLineValueInput.getValue(),
                targetLineTitle: targetLineContainer.targetLineTitleInput.getValue(),
                baseLineValue: baseLineContainer.baseLineValueInput.getValue(),
                baseLineTitle: baseLineContainer.baseLineTitleInput.getValue(),
                sortOrder: sortOrder.getValue(),
                aggregationType: aggregationType.getValue(),
                rangeAxisMaxValue: axisContainer.rangeAxisMaxValueInput.getValue(),
                rangeAxisMinValue: axisContainer.rangeAxisMinValueInput.getValue(),
                rangeAxisSteps: axisContainer.rangeAxisStepsInput.getValue(),
                rangeAxisDecimals: axisContainer.rangeAxisDecimalsInput.getValue(),
                rangeAxisTitle: axisContainer.rangeAxisTitleInput.getValue(),
                domainAxisTitle: axisContainer.domainAxisTitleInput.getValue(),
                hideLegend: hideLegend.getValue(),
                hideTitle: titleContainer.hideTitleCheckbox.getValue(),
                title: titleContainer.titleInput.getValue(),
                hideSubtitle: subtitleContainer.hideSubtitleCheckbox.getValue(),
                subtitle: subtitleContainer.subtitleInput.getValue()
            };
        },
        setOptions: function(layout) {
            layout = layout || {};

            showValues.setValue(isBoolean(layout.showValues) ? layout.showValues : true);
            percentStackedValues.setValue(isBoolean(layout.percentStackedValues) ? layout.percentStackedValues : true);
            cumulativeValues.setValue(isBoolean(layout.cumulativeValues) ? layout.cumulativeValues : true);
            hideEmptyRowItems.setValue(isString(layout.hideEmptyRowItems) ? layout.hideEmptyRowItems : 'NONE');
            regressionType.setValue(isString(layout.regressionType) ? layout.regressionType : 'NONE');

            completedOnly.setValue(isBoolean(layout.completedOnly) ? layout.completedOnly : false);

            // target line
            if (isNumber(layout.targetLineValue)) {
                targetLineContainer.targetLineValueInput.setValue(layout.targetLineValue);
            }
            else {
                targetLineContainer.targetLineValueInput.reset();
            }

            if (isString(layout.targetLineTitle)) {
                targetLineContainer.targetLineTitleInput.setValue(layout.targetLineTitle);
            }
            else {
                targetLineContainer.targetLineTitleInput.reset();
            }

            // base line
            if (isNumber(layout.baseLineValue)) {
                baseLineContainer.baseLineValueInput.setValue(layout.baseLineValue);
            }
            else {
                baseLineContainer.baseLineValueInput.reset();
            }

            if (isString(layout.baseLineTitle)) {
                baseLineContainer.baseLineTitleInput.setValue(layout.baseLineTitle);
            }
            else {
                baseLineContainer.baseLineTitleInput.reset();
            }

            sortOrder.setValue(isNumber(layout.sortOrder) ? layout.sortOrder : 0);
            aggregationType.setValue(isString(layout.aggregationType) ? layout.aggregationType : optionConfig.getAggregationType('def').id);

            // rangeAxisMaxValue
            if (isNumber(layout.rangeAxisMaxValue)) {
                axisContainer.rangeAxisMaxValueInput.setValue(layout.rangeAxisMaxValue);
            }
            else {
                axisContainer.rangeAxisMaxValueInput.reset();
            }

            // rangeAxisMinValue
            if (isNumber(layout.rangeAxisMinValue)) {
                axisContainer.rangeAxisMinValueInput.setValue(layout.rangeAxisMinValue);
            }
            else {
                axisContainer.rangeAxisMinValueInput.reset();
            }

            // rangeAxisSteps
            if (isNumber(layout.rangeAxisSteps)) {
                axisContainer.rangeAxisStepsInput.setValue(layout.rangeAxisSteps);
            }
            else {
                axisContainer.rangeAxisStepsInput.reset();
            }

            // rangeAxisDecimals
            if (isNumber(layout.rangeAxisDecimals)) {
                axisContainer.rangeAxisDecimalsInput.setValue(layout.rangeAxisDecimals);
            }
            else {
                axisContainer.rangeAxisDecimalsInput.reset();
            }

            // range axis title
            if (isString(layout.rangeAxisTitle)) {
                axisContainer.rangeAxisTitleInput.setValue(layout.rangeAxisTitle);
            }
            else {
                axisContainer.rangeAxisTitleInput.reset();
            }

            // domain axis title
            if (isString(layout.domainAxisTitle)) {
                axisContainer.domainAxisTitleInput.setValue(layout.domainAxisTitle);
            }
            else {
                axisContainer.domainAxisTitleInput.reset();
            }

            hideLegend.setValue(isBoolean(layout.hideLegend) ? layout.hideLegend : false);

            // title
            titleContainer.hideTitleCheckbox.setValue(isBoolean(layout.hideTitle) ? layout.hideTitle : false);
            if (isString(layout.title)) {
                titleContainer.titleInput.setValue(layout.title);
            }
            else {
                titleContainer.titleInput.reset();
            }

            // subtitle
            subtitleContainer.hideSubtitleCheckbox.setValue(isBoolean(layout.hideSubtitle) ? layout.hideSubtitle : false);
            if (isString(layout.subtitle)) {
                subtitleContainer.subtitleInput.setValue(layout.subtitle);
            }
            else {
                subtitleContainer.subtitleInput.reset();
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
            axisContainer,
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
                w.cumulativeValues = cumulativeValues;
                w.hideEmptyRowItems = hideEmptyRowItems;
                w.regressionType = regressionType;
                w.completedOnly = completedOnly;
                w.targetLineValue = targetLineContainer.targetLineValueInput;
                w.targetLineTitle = targetLineContainer.targetLineTitleInput;
                w.baseLineValue = baseLineContainer.baseLineValueInput;
                w.baseLineTitle = baseLineContainer.baseLineTitleInput;
                w.sortOrder = sortOrder;
                w.aggregationType = aggregationType;
                w.rangeAxisMaxValue = axisContainer.rangeAxisMaxValueInput;
                w.rangeAxisMinValue = axisContainer.rangeAxisMinValueInput;
                w.rangeAxisSteps = axisContainer.rangeAxisStepsInput;
                w.rangeAxisDecimals = axisContainer.rangeAxisDecimalsInput;
                w.rangeAxisTitle = axisContainer.rangeAxisTitleInput;
                w.domainAxisTitle = axisContainer.domainAxisTitleInput;
                w.hideLegend = hideLegend;
                w.hideTitle = titleContainer.hideTitleCheckbox;
                w.title = titleContainer.titleInput;
                w.hideSubtitle = subtitleContainer.hideSubtitleCheckbox;
                w.subtitle = subtitleContainer.subtitleInput;
            }
        }
    });

    return window;
};
