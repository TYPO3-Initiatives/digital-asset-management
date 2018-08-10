<?php

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

defined('TYPO3_MODE') || die();

(function() {
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addModule(
        'file',
        'DigitalAssetManagement',
        'top',
        '',
        [
            'routeTarget' => \TYPO3\CMS\DigitalAssetManagement\Controller\DigitalAssetManagementController::class . '::handleRequest',
            'access' => 'user,group',
            'name' => 'file_DigitalAssetManagement',
            'icon' => 'EXT:digital_asset_management/Resources/Public/Icons/module-dam.svg',
            'labels' => 'LLL:EXT:digital_asset_management/Resources/Private/Language/locallang_mod.xlf',
            'workspaces' => 'online,custom',
            'navigationComponentId' => '',
            'inheritNavigationComponentFromMainModule' => false
        ]
    );
})();
