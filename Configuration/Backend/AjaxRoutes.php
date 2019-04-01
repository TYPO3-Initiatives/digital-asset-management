<?php
return [
    'damGetFolderItems' => [
        'path' => '/dam/getFolderItems',
        'target' => TYPO3\CMS\DigitalAssetManagement\Controller\AjaxController::class . '::getFolderItemsAction',
    ],
    'damGetStoragesAndMounts' => [
        'path' => '/dam/getStoragesAndMounts',
        'target' => TYPO3\CMS\DigitalAssetManagement\Controller\AjaxController::class . '::getStoragesAndMountsAction',
    ],
    'damGetTreeFolders' => [
        'path' => '/dam/getTreeFolders',
        'target' => TYPO3\CMS\DigitalAssetManagement\Controller\AjaxController::class . '::getTreeFoldersAction',
    ],
    'damCopyResources' => [
        'path' => '/dam/copyResources',
        'target' => TYPO3\CMS\DigitalAssetManagement\Controller\AjaxController::class . '::copyResourcesAction',
    ],
];
