<?php

/*
 * This file is part of the package typo3/cms-digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

$GLOBALS['TYPO3_CONF_VARS']['BE']['ContextMenu']['ItemProviders'][1554281786] = \TYPO3\CMS\DigitalAssetManagement\ContextMenu\ItemProviders\StoragesAndMountsProvider::class;
$GLOBALS['TYPO3_CONF_VARS']['BE']['ContextMenu']['ItemProviders'][1554288174] = \TYPO3\CMS\DigitalAssetManagement\ContextMenu\ItemProviders\ListFolderProvider::class;
$GLOBALS['TYPO3_CONF_VARS']['BE']['ContextMenu']['ItemProviders'][1554382327] = \TYPO3\CMS\DigitalAssetManagement\ContextMenu\ItemProviders\ListFileProvider::class;
$GLOBALS['TYPO3_CONF_VARS']['BE']['ContextMenu']['ItemProviders'][1554288521] = \TYPO3\CMS\DigitalAssetManagement\ContextMenu\ItemProviders\ListEmptyProvider::class;

/*
 * Register Icons
 */
$iconRegistry = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Core\Imaging\IconRegistry::class);
$iconElements = [
    'dam-actions-sort-amount',
    'dam-actions-viewmode-list',
    'dam-actions-viewmode-tiles',
];
foreach ($iconElements as $iconName) {
    $iconRegistry->registerIcon(
        $iconName,
        \TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider::class,
        ['source' => 'EXT:digital_asset_management/Resources/Public/Icons/' . $iconName . '.svg']
    );
}
