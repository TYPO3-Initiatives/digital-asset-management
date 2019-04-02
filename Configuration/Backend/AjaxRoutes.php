<?php
return [
    'damCreateFolder' => [
        'path' => '/dam/createFolder',
        'target' => TYPO3\CMS\DigitalAssetManagement\Controller\AjaxController::class . '::createFolderAction',
    ],
    'damFileExists' => [
        'path' => '/dam/fileExists',
        'target' => TYPO3\CMS\DigitalAssetManagement\Controller\AjaxController::class . '::fileExistsAction',
    ],
    'damFileUpload' => [
        'path' => '/dam/fileUpload',
        'target' => TYPO3\CMS\DigitalAssetManagement\Controller\AjaxController::class . '::fileUploadAction',
    ],
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
    'damMoveResources' => [
        'path' => '/dam/moveResources',
        'target' => TYPO3\CMS\DigitalAssetManagement\Controller\AjaxController::class . '::moveResourcesAction',
    ],
    'damRenameResources' => [
        'path' => '/dam/renameResources',
        'target' => TYPO3\CMS\DigitalAssetManagement\Controller\AjaxController::class . '::renameResourcesAction',
    ],
    'damDeleteResources' => [
        'path' => '/dam/deleteResources',
        'target' => TYPO3\CMS\DigitalAssetManagement\Controller\AjaxController::class . '::deleteResourcesAction',
    ],
];
