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
use TYPO3\CMS\DigitalAssetManagement\Entity\FolderItemFile;
use TYPO3\CMS\DigitalAssetManagement\Entity\FolderItemFolder;
use TYPO3\CMS\DigitalAssetManagement\Entity\FolderItemImage;

/**
 * A 200 response object returned by controller
 * action getFolderItemsAction(). Contains
 * an array of FolderItemFolder, FolderItemFile, FolderItemImage
 *
 * @see FolderItemFolder
 * @see FolderItemFile
 * @see FolderItemImage
 */
class FolderItemsResponse extends JsonResponse
{
    /**
     * @param $folders FolderItemFolder[]
     * @param $files FolderItemFile[]
     * @param $images FolderItemImage[]
     */
    public function __construct(array $folders, array $files, array $images)
    {
        $data = [
            'folders' => $folders,
            'files' => $files,
            'images' => $images
        ];
        parent::__construct($data);
    }
}
