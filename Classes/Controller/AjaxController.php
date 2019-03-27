<?php
declare(strict_types = 1);
namespace TYPO3\CMS\DigitalAssetManagement\Controller;

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Http\JsonResponse;

/**
 * Main API endpoint. These are ajax actions called by JS side.
 *
 * Look up the end points in Configuration/Backend/Routes.php: A typical
 * path is something like /ajax/dam/getStoragesAndMounts which maps to a method
 * with the same name plus word "Action": getStoragesAndMountsAction().
 *
 * All actions return a JsonResponse, if all is good, the return code is
 * 200. A different code, usually in 4xx range will be returned if the
 * client sent a bogus request, often with some exception details.
 */
class AjaxController
{
    /**
     * Returns list of storages (admins), or file mounts (non-admin). Admins
     * do NOT receive a list of file mounts, just the storages.
     *
     * Storages are returned in no particular order, file mounts are ordered
     * by 'sorting' DB field.
     *
     * Return structure:
     *
     * [
     *     // Either 'storage' or 'mount'
     *     'type' => 'mount',
     *
     *     // Only storage uid for storages, storageUid:path for file mounts
     *     'identifier' => '42:file/mount/path'
     *
     *     // Storage name for storages, file mount name file mounts
     *    'name' => 'A user file mount',
     *
     *     // Always the storage name, identical with 'name' if 'type' is 'storage'
     *     'storageName' => 'Some storage'
     *
     *     // Storage driver. Often 'local', but can be 'AWS' or similar
     *     'storageType' => 'Local'
     *
     *     // False if storage is offline
     *     'storageOnline' => true
     * ],
     * ...
     */
    public function getStoragesAndMountsAction(): JsonResponse
    {
        $backendUser = $this->getBackendUser();
        $storages = $backendUser->getFileStorages();
        $data = [];
        if ($backendUser->isAdmin()) {
            foreach ($storages as $storage) {
                $data[] = [
                    'type' => 'storage',
                    'identifier' => $storage->getUid(),
                    'name' => $storage->getName(),
                    'storageName' => $storage->getName(),
                    'storageType' => $storage->getDriverType(),
                    'storageOnline' => $storage->isOnline(),
                ];
            }
        } else {
            foreach ($storages as $storage) {
                $fileMounts = $storage->getFileMounts();
                foreach ($fileMounts as $fileMount) {
                    $data[] = [
                        'type' => 'mount',
                        'identifier' => $storage->getUid() . ':' . $fileMount['path'],
                        'name' => $fileMount['title'],
                        'storageName' => $storage->getName(),
                        'storageType' => $storage->getDriverType(),
                        'storageOnline' => $storage->isOnline(),
                    ];
                }
            }
        }
        return new JsonResponse($data, 200);
    }

    /**
     * @return BackendUserAuthentication
     */
    protected function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }
}
