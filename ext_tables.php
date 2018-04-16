<?php
defined('TYPO3_MODE') or die();
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addModule(
    'file',
    'list',
    'top',
    '',
    [
        'routeTarget' => \TYPO3\CMS\DigitalAssetManagement\Controller\DigitalAssetManagementController::class . '::handleRequest',
        'access' => 'user,group',
        'name' => 'files',
        'icon' => 'EXT:digital_asset_management/Resources/Public/Icons/module-files.svg',
        'labels' => 'LLL:EXT:digital_asset_management/Resources/Private/Language/locallang_module_files.xlf'
    ]
);
