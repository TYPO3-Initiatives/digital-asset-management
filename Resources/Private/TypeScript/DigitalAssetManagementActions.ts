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

// import {SeverityEnum} from './Enum/Severity';
import * as $ from 'jquery';
// import InfoWindow = require('./InfoWindow');
// import Modal = require('./Modal');
// import ModuleMenu = require('./ModuleMenu');
// import Viewport = require('./Viewport');

/**
 * exports TYPO3/CMS/Backend/ContextMenuActions
 * @exports TYPO3/CMS/DigitalAssetManagement/DigitalAssetManagementActions
 */
class DigitalAssetManagementActions {
  /**
   * @returns {string}
   */
  public static getReturnUrl(): string {
	  return top.rawurlencode(top.list_frame.document.location.pathname + top.list_frame.document.location.search);
  }
}

export = DigitalAssetManagementActions;
