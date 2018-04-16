<?php


use TYPO3\CMS\DigitalAssetManagement\Controller\DigitalAssetManagementAjaxController;
return [
    //
    'dam_inline_show_folder' => [
        'path' => '/dam/inline/showfolder',
        'target' => DigitalAssetManagementAjaxController::class . '::showFolder'
    ]
];
