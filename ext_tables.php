<?php
defined('TYPO3_MODE') or die();
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
