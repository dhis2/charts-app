import arrayContains from 'd2-utilizr/lib/arrayContains';
import arrayPluck from 'd2-utilizr/lib/arrayContains';
import clone from 'd2-utilizr/lib/clone';import isString from 'd2-utilizr/lib/isString';
import isArray from 'd2-utilizr/lib/isArray';

export var LayoutWindow;

LayoutWindow = function(c) {
    var t = this,

        uiManager = c.uiManager,
        instanceManager = c.instanceManager,
        i18n = c.i18nManager.get(),
        dimensionConfig = c.dimensionConfig,

        confData = dimensionConfig.get('data'),
        confPeriod = dimensionConfig.get('period'),
        confOrganisationUnit = dimensionConfig.get('organisationUnit'),
        confCategory = dimensionConfig.get('category'),

        dimensionStoreMap = {},
        margin = 1,
        defaultWidth = 200,
        defaultHeight = 220;

    // components

    var dxDim = {id: confData.dimensionName, name: confData.name};
    var peDim = {id: confPeriod.dimensionName, name: confPeriod.name};
    var ouDim = {id: confOrganisationUnit.dimensionName, name: confOrganisationUnit.name};
    var coDim = {id: confCategory.dimensionName, name: confCategory.name};

    var getStore = function(data, name) {
        var config = {};

        config.fields = ['id', 'name'];

        if (data) {
            config.data = data;
        }

        if (name) {
            config.name = name;
        }

        config.getDimensionNames = function() {
            var dimensionNames = [];

            this.each(function(r) {
                dimensionNames.push(r.data.id);
            });

            return clone(dimensionNames);
        };

        config.hasDimension = function(id) {
            return isString(id) && this.findExact('id', id) != -1 ? true : false;
        };

        config.removeDimension = function(id) {
            var index = this.findExact('id', id);

            if (index != -1) {
                this.remove(this.getAt(index));
            }
        };

        return Ext.create('Ext.data.Store', config);
    };

    var getStoreKeys = function(store) {
        var keys = [],
            items = store.data.items;

        if (items) {
            for (var i = 0; i < items.length; i++) {
                keys.push(items[i].data.id);
            }
        }

        return keys;
    };

    var dimensionStore = getStore();

    var colStore = getStore(null, 'colStore');

    var rowStore = getStore(null, 'rowStore');

    var filterStore = getStore(null, 'filterStore');

    var dimension = Ext.create('Ext.ux.form.MultiSelect', {
        cls: 'ns-toolbar-multiselect-leftright',
        width: defaultWidth - 50,
        height: (defaultHeight * 2) + margin,
        style: 'margin-right:' + margin + 'px; margin-bottom:0px',
        valueField: 'id',
        displayField: 'name',
        dragGroup: 'layoutDD',
        dropGroup: 'layoutDD',
        ddReorder: false,
        store: dimensionStore,
        tbar: {
            height: 25,
            items: {
                xtype: 'label',
                text: i18n.excluded_dimensions,
                cls: 'ns-toolbar-multiselect-leftright-label'
            }
        },
        listeners: {
            afterrender: function(ms) {
                ms.store.on('add', function() {
                    Ext.defer( function() {
                        ms.boundList.getSelectionModel().deselectAll();
                    }, 10);
                });
            }
        }
    });

    var col = Ext.create('Ext.ux.form.MultiSelect', {
        cls: 'ns-toolbar-multiselect-leftright',
        width: defaultWidth,
        height: defaultHeight,
        style: 'margin-bottom:' + margin + 'px',
        valueField: 'id',
        displayField: 'name',
        dragGroup: 'layoutDD',
        dropGroup: 'layoutDD',
        store: colStore,
        tbar: {
            height: 25,
            items: {
                xtype: 'label',
                text: i18n.series_dimensions,
                cls: 'ns-toolbar-multiselect-leftright-label'
            }
        },
        listeners: {
            afterrender: function(ms) {
                ms.boundList.on('itemdblclick', function(view, record) {
                    ms.store.remove(record);
                    dimensionStore.add(record);
                });

                ms.store.on('add', function(store, addedRecords) {
                    var range = store.getRange();

                    if (range.length > 1) {
                        var addedIds = addedRecords.map(function(obj) {
                            return obj.internalId;
                        });

                        store.removeAll();

                        for (var i = 0, rec; i < range.length; i++) {
                            rec = Ext.clone(range[i]);

                            if (arrayContains(addedIds, rec.internalId)) {
                                store.add(rec);
                            }
                            else {
                                filterStore.add(rec);
                            }
                        }
                    }

                    Ext.defer( function() {
                        ms.boundList.getSelectionModel().deselectAll();
                    }, 10);
                });
            }
        }
    });

    var row = Ext.create('Ext.ux.form.MultiSelect', {
        cls: 'ns-toolbar-multiselect-leftright',
        width: defaultWidth,
        height: defaultHeight,
        style: 'margin-bottom:0px',
        valueField: 'id',
        displayField: 'name',
        dragGroup: 'layoutDD',
        dropGroup: 'layoutDD',
        store: rowStore,
        tbar: {
            height: 25,
            items: {
                xtype: 'label',
                text: i18n.category_dimensions,
                cls: 'ns-toolbar-multiselect-leftright-label'
            }
        },
        listeners: {
            afterrender: function(ms) {
                ms.boundList.on('itemdblclick', function(view, record) {
                    ms.store.remove(record);
                    dimensionStore.add(record);
                });

                ms.store.on('add', function(store, addedRecords) {
                    var range = store.getRange();

                    if (range.length > 1) {
                        var addedIds = addedRecords.map(function(obj) {
                            return obj.internalId;
                        });

                        store.removeAll();

                        for (var i = 0; i < range.length; i++) {
                            if (arrayContains(addedIds, range[i].internalId)) {
                                store.add(range[i]);
                            }
                            else {
                                filterStore.add(range[i]);
                            }
                        }
                    }

                    Ext.defer( function() {
                        ms.boundList.getSelectionModel().deselectAll();
                    }, 10);
                });
            }
        }
    });

    var filter = Ext.create('Ext.ux.form.MultiSelect', {
        cls: 'ns-toolbar-multiselect-leftright',
        width: defaultWidth,
        height: defaultHeight,
        style: 'margin-right:' + margin + 'px; margin-bottom:' + margin + 'px',
        valueField: 'id',
        displayField: 'name',
        dragGroup: 'layoutDD',
        dropGroup: 'layoutDD',
        store: filterStore,
        tbar: {
            height: 25,
            items: {
                xtype: 'label',
                text: i18n.report_filter,
                cls: 'ns-toolbar-multiselect-leftright-label'
            }
        },
        listeners: {
            afterrender: function(ms) {
                ms.boundList.on('itemdblclick', function(view, record) {
                    ms.store.remove(record);
                    dimensionStore.add(record);
                });

                ms.store.on('add', function() {
                    Ext.defer( function() {
                        ms.boundList.getSelectionModel().deselectAll();
                    }, 10);
                });
            }
        }
    });

    var selectPanel = Ext.create('Ext.panel.Panel', {
        bodyStyle: 'border:0 none',
        items: [
            {
                layout: 'column',
                bodyStyle: 'border:0 none',
                items: [
                    filter,
                    col
                ]
            },
            {
                layout: 'column',
                bodyStyle: 'border:0 none',
                items: [
                    row
                ]
            }
        ]
    });

    var addDimension = function(record, store) {
        var store = dimensionStoreMap[record.id] || store || colStore;

        if (!hasDimension(record.id)) {
            store.add(record);
        }
    };

    var removeDimension = function(dataElementId) {
        var stores = [colStore, rowStore, filterStore, dimensionStore];

        for (var i = 0, store, index; i < stores.length; i++) {
            store = stores[i];

            if (store.hasDimension(dataElementId)) {
                store.removeDimension(dataElementId);
                dimensionStoreMap[dataElementId] = store;
            }
        }
    };

    var hasDimension = function(id) {
        var stores = [colStore, rowStore, filterStore, dimensionStore];

        for (var i = 0, store, index; i < stores.length; i++) {
            if (stores[i].hasDimension(id)) {
                return true;
            }
        }

        return false;
    };

    var saveState = function(map) {
        map = map || dimensionStoreMap;

        colStore.each(function(record) {
            map[record.data.id] = colStore;
        });

        rowStore.each(function(record) {
            map[record.data.id] = rowStore;
        });

        filterStore.each(function(record) {
            map[record.data.id] = filterStore;
        });

        return map;
    };

    var resetData = function() {
        var map = saveState({}),
            keys = [dxDim.id, peDim.id, ouDim.id, 'dates'];

        for (var key in map) {
            if (map.hasOwnProperty(key) && !arrayContains(keys, key)) {
                removeDimension(key);
            }
        }
    };

    var reset = function(isAll) {
        colStore.removeAll();
        rowStore.removeAll();
        filterStore.removeAll();
        dimensionStore.removeAll();

        if (!isAll) {
            colStore.add(dxDim);
            rowStore.add(peDim);
            filterStore.add(ouDim);
            dimensionStore.add(coDim);
        }
    };

    var setDimensions = function(layout) {

        // empty cache
        dimensionStoreMap = {};

        // columns
        if (isArray(layout.columns)) {
            layout.columns.forEach(function(dimension) {
                addDimension({
                    id: dimension.dimension,
                    name: dimensionConfig.get(dimension.dimension).name
                }, colStore);
            });
        }

        // rows
        if (isArray(layout.rows)) {
            layout.rows.forEach(function(dimension) {
                addDimension({
                    id: dimension.dimension,
                    name: dimensionConfig.get(dimension.dimension).name
                }, rowStore);
            });
        }

        // filters
        if (isArray(layout.filters)) {
            layout.filters.forEach(function(dimension) {
                addDimension({
                    id: dimension.dimension,
                    name: dimensionConfig.get(dimension.dimension).name
                }, filterStore);
            });
        }

        // add required dimensions if missing
        if (!hasDimension(dxDim.id)) {
            dimensionStore.add(dxDim);
        }

        if (!hasDimension(peDim.id)) {
            dimensionStore.add(peDim);
        }

        if (!hasDimension(ouDim.id)) {
            dimensionStore.add(ouDim);
        }
    };

    var window = Ext.create('Ext.window.Window', {
        title: i18n.chart_layout,
        bodyStyle: 'background-color:#fff; padding:' + margin + 'px',
        closeAction: 'hide',
        autoShow: true,
        modal: true,
        resizable: false,
        dimensionStore,
        rowStore,
        colStore,
        filterStore,
        addDimension,
        removeDimension,
        hasDimension,
        saveState,
        resetData,
        reset,
        setDimensions,
        hideOnBlur: true,
        items: {
            layout: 'column',
            bodyStyle: 'border:0 none',
            items: [
                dimension,
                selectPanel
            ]
        },
        bbar: [
            '->',
            {
                text: i18n.hide,
                listeners: {
                    added: function(b) {
                        b.on('click', function() {
                            window.hide();
                        });
                    }
                }
            },
            {
                text: '<b>' + i18n.update + '</b>',
                listeners: {
                    added: function(b) {
                        b.on('click', function() {
                            instanceManager.getReport();

                            window.hide();
                        });
                    }
                }
            }
        ],
        listeners: {
            show: function(w) {
                var layoutButton = uiManager.get('layoutButton') || {};

                if (layoutButton.rendered) {
                    c.uiManager.setAnchorPosition(w, layoutButton);

                    if (!w.hasHideOnBlurHandler) {
                        c.uiManager.addHideOnBlurHandler(w);
                    }
                }
            },
            render: function() {
                reset();
            }
        }
    });

    return window;
};
