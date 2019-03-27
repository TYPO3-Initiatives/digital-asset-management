<?php
declare(strict_types = 1);
namespace TYPO3\CMS\DigitalAssetManagement\Controller;

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

use TYPO3\CMS\Core\Http\JsonResponse;

/**
 * Main API endpoint. These are ajax actions called by JS side.
 *
 * Look up the end points in Configuration/Backend/Routes.php: A typical
 * path is something like /ajax/dam/getStoragesAndMounts which maps to a method
 * with the same name plus word "Action": getStoragesAndMountsAction().
 *
 * Methods that need Request arguments MUST send them via POST.
 *
 * All actions return a JsonResponse, if all is good, the return code is
 * 200 with 'success' => true, and the payload of the according action in
 * 'data'. On error, 'success' is false and an exception detail is
 * added (@todo: define error data structure).
 *
 * Example for a "good" response:
 *
 * [
 *      'success' => true,
 *      'data' => ...
 * ]
 */
class AjaxController
{
    /**
     * Returns list of storages (admins), or file mounts (non-admin). Admins
     * do NOT receive a list of file mounts.
     *
     * Storages are returned in no particular order, file mounts are ordered
     * by 'sorting' DB field.
     *
     * Example data part of return structure:
     *
     * [
     *      [
     *          // Either 'storage' or 'mount'
     *          'type' => 'mount',
     *
     *          // Only storage uid for storages, storageUid:path for file mounts
     *          'identifier' => '42:file/mount/path'
     *
     *          // Storage name for storages, file mount name file mounts
     *          'name' => 'A user file mount',
     *
     *          // Always the storage name, identical with 'name' if 'type' is 'storage'
     *          'storageName' => 'Some storage'
     *
     *          // Storage driver. Often 'local', but can be 'AWS' or similar
     *          'storageType' => 'local'
     *
     *          // True if storage is offline
     *          'storageOffline' => false
     *      ],
     *      ...
     * ]
     */
    public function getStoragesAndMountsAction()
    {
        return new JsonResponse(
            [
                'success' => true,
                'data' => 'foo',
            ],
            200
        );
    }
}
