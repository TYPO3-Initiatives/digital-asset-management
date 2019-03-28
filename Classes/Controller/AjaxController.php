<?php
declare(strict_types = 1);
namespace TYPO3\CMS\DigitalAssetManagement\Controller;

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Resource\Exception as ResourceException;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\DigitalAssetManagement\Entity\FileMount;
use TYPO3\CMS\DigitalAssetManagement\Entity\FolderItemFolder;
use TYPO3\CMS\DigitalAssetManagement\Entity\Storage;
use TYPO3\CMS\DigitalAssetManagement\Exception\ControllerException;
use TYPO3\CMS\DigitalAssetManagement\Http\FolderItemsResponse;
use TYPO3\CMS\DigitalAssetManagement\Http\JsonExceptionResponse;
use TYPO3\CMS\DigitalAssetManagement\Http\StoragesAndMountsResponse;

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
     * Return item list (folders, files, images) of a storage:path
     * FAL folder identifier. GET request with identifier argument.
     *
     * @param ServerRequestInterface $request
     * @return JsonResponse
     */
    public function getFolderItemsAction(ServerRequestInterface $request): JsonResponse
    {
        try {
            $identifier = $request->getQueryParams()['identifier'];
            if (empty($identifier)) {
                throw new ControllerException('Identifier needed', 1553699828);
            }
            $resourceFactory = GeneralUtility::makeInstance(ResourceFactory::class);
            $folderObject = $resourceFactory->getObjectFromCombinedIdentifier($identifier);
            if (!$folderObject instanceof Folder) {
                throw new ControllerException('Identifier is not a folder', 1553701684);
            }
            $subFolders = $folderObject->getSubfolders();
            $folders = [];
            $files = [];
            $images = [];
            foreach ($subFolders as $subFolder) {
                $request->getAttribute('normalizedParams');
                $folders[] = new FolderItemFolder($subFolder);
            }
            return new FolderItemsResponse($folders, $files, $images);
        } catch (ResourceException $e) {
            return new JsonExceptionResponse($e);
        } catch (ControllerException $e) {
            return new JsonExceptionResponse($e);
        }
    }

    /**
     * Returns list of storages (admins), or file mounts (non-admin). Admins
     * do NOT receive a list of file mounts, just the storages.
     *
     * Storages are returned in no particular order, file mounts are ordered
     * by 'sorting' DB field.
     *
     * Return structure is an array of Storage or FileMount objects.
     */
    public function getStoragesAndMountsAction(): JsonResponse
    {
        $backendUser = $this->getBackendUser();
        $storages = $backendUser->getFileStorages();
        $entities = [];
        if ($backendUser->isAdmin()) {
            foreach ($storages as $storage) {
                $entities[] = new Storage($storage);
            }
        } else {
            foreach ($storages as $storage) {
                $fileMounts = $storage->getFileMounts();
                foreach ($fileMounts as $fileMount) {
                    $entities[] = new FileMount($storage, $fileMount);
                }
            }
        }
        return new StoragesAndMountsResponse($entities);
    }

    /**
     * @return BackendUserAuthentication
     */
    protected function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }
}
