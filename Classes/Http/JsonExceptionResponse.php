<?php
declare(strict_types = 1);
namespace TYPO3\CMS\DigitalAssetManagement\Http;

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

use TYPO3\CMS\Core\Http\JsonResponse;

/**
 * A response 400 object returned if controller
 * caught some exception and returns details.
 */
class JsonExceptionResponse extends JsonResponse
{
    public function __construct(\Exception $e)
    {
        $data = [
            'type' => 'exception',
            'errorMessage' => $e->getMessage(),
            'errorCode' => $e->getCode(),
            'errorClass' => get_class($e),
        ];
        parent::__construct($data, 400);
    }
}
