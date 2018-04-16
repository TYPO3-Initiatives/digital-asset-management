<?php


use TYPO3\CMS\DigitalAssetManagement\Controller\DigitalAssetManagementAjaxController;
return [
    //
    'files_inline_show_folder' => [
        'path' => '/siteconfiguration/inline/create',
        'target' => DigitalAssetManagementAjaxController::class . '::showFolder'
    ]
];
