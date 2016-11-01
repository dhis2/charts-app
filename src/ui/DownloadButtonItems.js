export var DownloadButtonItems;

DownloadButtonItems = function(refs, layout) {
    var uiManager = refs.uiManager,
        i18n = refs.i18nManager.get();

    //return [
        //{
            //xtype: 'label',
            //text: i18n.graphics,
            //style: 'padding:7px 5px 5px 7px; font-weight:bold'
        //},
        //{
            //text: i18n.image_png + ' (.png)',
            //iconCls: 'ns-menu-item-image',
            //handler: function() {
                //uiManager.submitSvgForm('png');
            //}
        //},
        //{
            //text: 'PDF (.pdf)',
            //iconCls: 'ns-menu-item-image',
            //handler: function() {
                //uiManager.submitSvgForm('pdf');
            //}
        //}
    //];

    return [];
};
