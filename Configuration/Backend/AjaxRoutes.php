<?php
return [
    'damGetStoragesAndMounts' => [
        'path' => '/dam/getStoragesAndMounts',
        'target' => TYPO3\CMS\DigitalAssetManagement\Controller\AjaxController::class . '::getStoragesAndMountsAction',
    ],
];
