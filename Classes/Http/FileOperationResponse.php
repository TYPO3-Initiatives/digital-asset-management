<?php
declare(strict_types = 1);

/*
 * This file is part of the package typo3/cms-digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

namespace TYPO3\CMS\DigitalAssetManagement\Http;

use TYPO3\CMS\Core\Http\JsonResponse;

/**
 * A response 400 object returned if controller
 * caught some exception and returns details.
 */
class FileOperationResponse extends JsonResponse
{
    public function __construct(array $resultObjects)
    {
        $data = [
            'resources' => $resultObjects
        ];
        parent::__construct($data);
    }
}
