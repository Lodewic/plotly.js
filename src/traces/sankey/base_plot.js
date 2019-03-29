/**
* Copyright 2012-2019, Plotly, Inc.
* All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

'use strict';

var overrideAll = require('../../plot_api/edit_types').overrideAll;
var getModuleCalcData = require('../../plots/get_data').getModuleCalcData;
var plot = require('./plot');
var fxAttrs = require('../../components/fx/layout_attributes');

var setCursor = require('../../lib/setcursor');
var dragElement = require('../../components/dragelement');
var prepSelect = require('../../plots/cartesian/select').prepSelect;
var Lib = require('../../lib');

var SANKEY = 'sankey';

exports.name = SANKEY;

exports.baseLayoutAttrOverrides = overrideAll({
    hoverlabel: fxAttrs.hoverlabel
}, 'plot', 'nested');

exports.plot = function(gd) {
    var calcData = getModuleCalcData(gd.calcdata, SANKEY)[0];
    plot(gd, calcData);
};

exports.clean = function(newFullData, newFullLayout, oldFullData, oldFullLayout) {
    var hadPlot = (oldFullLayout._has && oldFullLayout._has(SANKEY));
    var hasPlot = (newFullLayout._has && newFullLayout._has(SANKEY));

    if(hadPlot && !hasPlot) {
        oldFullLayout._paperdiv.selectAll('.sankey').remove();
    }
};

exports.updateFx = function(gd) {
    for(var i = 0; i < gd._fullData.length; i++) {
        subplotUpdateFx(gd, gd._fullData[i]);
    }
};

var oldDragOptions = [];
var dragOptions = [];
function subplotUpdateFx(gd, fullData) {
    var i = fullData.index;
    var fullLayout = gd._fullLayout;
    var dragMode = fullLayout.dragmode;
    var cursor = fullLayout.dragmode === 'pan' ? 'move' : 'crosshair';
    var bgRect = gd._fullData[i]._bgRect;

    setCursor(bgRect, cursor);

    var xaxis = {
        _id: 'x',
        c2p: function(v) { return v; },
        _offset: fullData._sankey.translateX,
        _length: fullData._sankey.width
    };
    var yaxis = {
        _id: 'y',
        c2p: function(v) { return v; },
        _offset: fullData._sankey.translateY,
        _length: fullData._sankey.height
    };

    // Note: dragOptions is needed to be declared for all dragmodes because
    // it's the object that holds persistent selection state.
    oldDragOptions[i] = dragOptions[i] || {};
    dragOptions[i] = Lib.extendDeep(oldDragOptions[i], {
        gd: gd,
        element: bgRect.node(),
        plotinfo: {
            id: i,
            xaxis: xaxis,
            yaxis: yaxis,
            fillRangeItems: Lib.noop
        },
        subplot: i,
        // create mock x/y axes for hover routine
        xaxes: [xaxis],
        yaxes: [yaxis]
    });

    dragOptions[i].prepFn = function(e, startX, startY) {
        prepSelect(e, startX, startY, dragOptions[i], dragMode);
    };

    dragElement.init(dragOptions[i]);
}
