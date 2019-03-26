/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

/**
 * Module: TYPO3/CMS/DigitalAssetManagement/FolderTree/FolderTree
 */
define(['jquery', 'd3', 'TYPO3/CMS/Backend/Icons', 'TYPO3/CMS/Backend/SvgTree', 'TYPO3/CMS/Backend/Storage/Persistent'], function ($, d3, Icons, SvgTree, Persistent) {
    'use strict';

    /**
     * @constructor
     * @exports TYPO3/CMS/DigitalAssetManagement/FolderTree/FolderTree
     */
    var FolderTree = function() {
        SvgTree.call(this);
    };

    FolderTree.prototype = Object.create(SvgTree.prototype);
    var _super_ = SvgTree.prototype;

    /**
     * SelectTree initialization
     *
     * @param {String} selector
     * @param {Object} settings
     */
    FolderTree.prototype.initialize = function(selector, settings) {
        var _this = this;

        if (!_super_.initialize.call(_this, selector, settings)) {
            return false;
        }

        _this.dispatch.on('updateSvg.folderTree', _this.updateSvg);
        _this.dispatch.on('prepareLoadedNode.folderTree', _this.prepareLoadedNode);

        return this;
    }

    FolderTree.prototype.updateSvg = function(nodeEnter) {
        nodeEnter
            .select('use')
            .attr('data-table', 'pages')
            .attr('data-context', 'tree');
    };

    /**
     * Event listener called for each loaded node,
     * here used to mark node remembered in fsMode as selected
     *
     * @param node
     */
    FolderTree.prototype.prepareLoadedNode = function(node) {
        if (node.stateIdentifier === fsMod.navFrameHighlightedID.file) {
            node.checked = true;
        }
    };

    FolderTree.prototype.hideChildren = function(node) {
        _super_.hideChildren(node);
        Persistent.set('BackendComponents.States.FolderTree.stateHash.' + node.identifier, 0);
    };

    FolderTree.prototype.showChildren = function(node) {
        _super_.showChildren(node);
        Persistent.set('BackendComponents.States.FolderTree.stateHash.' + node.identifier, 1);
    };

    return FolderTree;
});