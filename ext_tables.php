<?php
defined('TYPO3_MODE') or die();
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addModule(
    'file',
    'DigitalAssetManagement',
    'top',
    '',
    [
        'routeTarget' => \TYPO3\CMS\DigitalAssetManagement\Controller\DigitalAssetManagementController::class . '::index',
        'access' => 'user,group',
        'name' => 'file_DigitalAssetManagement',
        'icon' => 'EXT:digital_asset_management/Resources/Public/Icons/module-dam.svg',
        'labels' => 'LLL:EXT:digital_asset_management/Resources/Private/Language/locallang_module_dam.xlf'
    ]
);



//
//
//// Register "Styleguide" backend module
//\TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerModule(
//    'TYPO3.CMS.digital_asset_management',
//    'file',
//    'list',
//    'top',
//    [
//        'DigitalAssetManagement' => 'index'
//    ],
//    [
//        'access' => 'user,group',
//        'icon' => 'EXT:digital_asset_management/Resources/Public/Icons/module-dam.svg',
//        'labels' => 'LLL:EXT:digital_asset_management/Resources/Private/Language/locallang_module_dam.xlf'
//    ]
//);
