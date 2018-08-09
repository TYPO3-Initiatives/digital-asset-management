<?php

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

use TYPO3\CMS\DigitalAssetManagement\Controller\DigitalAssetManagementAjaxController;

return [
    //
    'dam_request' => [
        'path' => '/dam/request',
        'target' => DigitalAssetManagementAjaxController::class . '::handleAjaxRequestAction'
    ]
];
