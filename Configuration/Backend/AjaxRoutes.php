<?php


use TYPO3\CMS\DigitalAssetManagement\Controller\DigitalAssetManagementAjaxController;
return [
    //
    'dam_request' => [
        'path' => '/dam/request',
        'target' => DigitalAssetManagementAjaxController::class . '::handleAjaxRequestAction'
    ]
];
