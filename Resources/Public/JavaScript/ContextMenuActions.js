/**
 * Module: TYPO3/CMS/ExtensionKey/ContextMenuActions
 *
 * JavaScript to handle the click action of the "Hello World" context menu item
 * @exports TYPO3/CMS/ExtensionKey/ContextMenuActions
 */
define(function () {
  'use strict';

  /**
   * @exports TYPO3/CMS/DigitalAssetManagement/ContextMenuActions
   */
  let ContextMenuActions = {};

  /**
   *
   * @param {string} menuType
   * @param {string} identifier of the page
   */
  ContextMenuActions.actionNewFile = function (menuType, identifier) {
    let event = new CustomEvent('resolveEvent', {
      detail: {
        'event': 'actionNewFile',
        'menuType': menuType,
        'identifier': identifier
      }
    });
    document.dispatchEvent(event);
  };

  /**
   *
   * @param {string} menuType
   * @param {string} identifier of the page
   */
  ContextMenuActions.actionNewFolder = function (menuType, identifier) {
    let event = new CustomEvent('resolveEvent', {
      detail: {
        'event': 'actionNewFolder',
        'menuType': menuType,
        'identifier': identifier
      }
    });
    document.dispatchEvent(event);
  };

  /**
   *
   * @param {string} menuType
   * @param {string} identifier of the page
   */
  ContextMenuActions.actionUpload = function (menuType, identifier) {
    let event = new CustomEvent('resolveEvent', {
      detail: {
        'event': 'actionUpload',
        'menuType': menuType,
        'identifier': identifier
      }
    });
    document.dispatchEvent(event);
  };

  /**
   *
   * @param {string} menuType
   * @param {string} identifier of the page
   */
  ContextMenuActions.actionDownload = function (menuType, identifier) {
    let event = new CustomEvent('resolveEvent', {
      detail: {
        'event': 'actionDownload',
        'menuType': menuType,
        'identifier': identifier
      }
    });
    document.dispatchEvent(event);
  };

  /**
   *
   * @param {string} menuType
   * @param {string} identifier of the page
   */
  ContextMenuActions.actionMoveTo = function (menuType, identifier) {
    let event = new CustomEvent('resolveEvent', {
      detail: {
        'event': 'actionMoveTo',
        'menuType': menuType,
        'identifier': identifier
      }
    });
    document.dispatchEvent(event);
  };

  /**
   *
   * @param {string} menuType
   * @param {string} identifier of the page
   */
  ContextMenuActions.actionCopyTo = function (menuType, identifier) {
    let event = new CustomEvent('resolveEvent', {
      detail: {
        'event': 'actionCopyTo',
        'menuType': menuType,
        'identifier': identifier
      }
    });
    document.dispatchEvent(event);
  };

  /**
   *
   * @param {string} menuType
   * @param {string} identifier of the page
   */
  ContextMenuActions.actionDelete = function (menuType, identifier) {
    let event = new CustomEvent('resolveEvent', {
      detail: {
        'event': 'actionDelete',
        'menuType': menuType,
        'identifier': identifier
      }
    });
    document.dispatchEvent(event);
  };

  /**
   *
   * @param {string} menuType
   * @param {string} identifier of the page
   */
  ContextMenuActions.actionRename = function (menuType, identifier) {
    let event = new CustomEvent('resolveEvent', {
      detail: {
        'event': 'actionRename',
        'menuType': menuType,
        'identifier': identifier
      }
    });
    document.dispatchEvent(event);
  };

  /**
   *
   * @param {string} menuType
   * @param {string} identifier of the page
   */
  ContextMenuActions.actionInfo = function (menuType, identifier) {
    let event = new CustomEvent('resolveEvent', {
      detail: {
        'event': 'actionInfo',
        'menuType': menuType,
        'identifier': identifier
      }
    });
    document.dispatchEvent(event);
  };

  /**
   *
   * @param {string} menuType
   * @param {string} identifier of the page
   */
  ContextMenuActions.actionPreview = function (menuType, identifier) {
    let event = new CustomEvent('resolveEvent', {
      detail: {
        'event': 'actionPreview',
        'menuType': menuType,
        'identifier': identifier
      }
    });
    document.dispatchEvent(event);
  };

  /**
   *
   * @param {string} menuType
   * @param {string} identifier of the page
   */
  ContextMenuActions.actionReplace = function (menuType, identifier) {
    let event = new CustomEvent('resolveEvent', {
      detail: {
        'event': 'actionReplace',
        'menuType': menuType,
        'identifier': identifier
      }
    });
    document.dispatchEvent(event);
  };

  /**
   *
   * @param {string} menuType
   * @param {string} identifier of the page
   */
  ContextMenuActions.actionEditStorage = function (menuType, identifier) {
    let event = new CustomEvent('resolveEvent', {
      detail: {
        'event': 'actionEditStorage',
        'menuType': menuType,
        'identifier': identifier
      }
    });
    document.dispatchEvent(event);
  };

  return ContextMenuActions;
});