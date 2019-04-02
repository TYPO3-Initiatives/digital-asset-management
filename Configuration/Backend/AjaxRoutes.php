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
];
