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
use TYPO3\CMS\Core\Resource\DuplicationBehavior;
use TYPO3\CMS\Core\Resource\Exception as ResourceException;
use TYPO3\CMS\Core\Resource\Exception\InvalidTargetFolderException;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\DigitalAssetManagement\Entity\FileMount;
use TYPO3\CMS\DigitalAssetManagement\Entity\FolderItemFile;
use TYPO3\CMS\DigitalAssetManagement\Entity\FolderItemFolder;
use TYPO3\CMS\DigitalAssetManagement\Entity\FolderItemImage;
use TYPO3\CMS\DigitalAssetManagement\Entity\Storage;
use TYPO3\CMS\DigitalAssetManagement\Entity\TreeItemFolder;
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
            foreach ($subFolders as $subFolder) {
                $folders[] = new FolderItemFolder($subFolder);
            }
            $allFiles = $folderObject->getFiles();
            $files = [];
            $images = [];
            foreach ($allFiles as $file) {
                // If file is an image or media, create image object, else file object
                $fileExtension = strtolower($file->getExtension());
                if (GeneralUtility::inList($GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext'], $fileExtension)
                    || GeneralUtility::inList($GLOBALS['TYPO3_CONF_VARS']['GFX']['mediafile_ext'], $fileExtension)
                ) {
                    $images[] = new FolderItemImage($file);
                } else {
                    $files[] = new FolderItemFile($file);
                }
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
     * Returns list of folders only. No files, no images
     * Result is sorted by name
     *
     * Return structure is an array of TreeItemFolder objects.
     *
     * @param ServerRequestInterface $request
     *
     * @return JsonResponse
     */
    public function getTreeFoldersAction(ServerRequestInterface $request): JsonResponse
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
            foreach ($subFolders as $subFolder) {
                $folders[] = new TreeItemFolder($subFolder);
            }
            return new JsonResponse($folders);
        } catch (ResourceException $e) {
            return new JsonExceptionResponse($e);
        } catch (ControllerException $e) {
            return new JsonExceptionResponse($e);
        }
    }

    /**
     * Copy files or folders
     * Query parameters
     *  'identifiers' array of identifier to copy
     *  'targetFolderIdentifier' string the target identifier. Must be a folder.
     *  'conflictMode' string one of: "replace", "cancel", "rename", as defined in \TYPO3\CMS\Core\Resource\DuplicationBehavior
     *
     * @param ServerRequestInterface $request
     *
     * @return JsonResponse
     */
    public function copyResourcesAction(ServerRequestInterface $request): JsonResponse
    {
        try {
            $identifiers = $request->getQueryParams()['identifiers'];
            $conflictMode = $request->getQueryParams()['conflictMode'] ?? '';
            $targetFolderIdentifier
                = $request->getQueryParams()['targetFolderIdentifier'];
            if (empty($identifiers)) {
                throw new ControllerException('Identifiers needed', 1553699828);
            }
            if (empty($conflictMode) || !in_array($conflictMode, ['replace', 'cancel', 'rename'], true)) {
                throw new ControllerException('conflictMode must be one of "replace", "cancel", "rename"');
            }
            if (empty($targetFolderIdentifier)) {
                throw new ControllerException('Target folder identifier needed',
                    1554122023);
            }
            $resourceFactory
                = GeneralUtility::makeInstance(ResourceFactory::class);
            $targetFolderObject
                = $resourceFactory->getObjectFromCombinedIdentifier($targetFolderIdentifier);
            if (!$targetFolderObject instanceof Folder) {
                throw new ControllerException('Target identifier is not a folder',
                    1553701684);
            }
        } catch (ResourceException $e) {
            return new JsonExceptionResponse($e);
        } catch (ControllerException $e) {
            return new JsonExceptionResponse($e);
        }
        $resources = [];
        foreach ($identifiers as $identifier) {
            try {
                $sourceObject = $resourceFactory->getObjectFromCombinedIdentifier($identifier);
                $message = '';
                if ($resultFolder
                    = $sourceObject->copyTo($targetFolderObject, null,
                    $conflictMode)
                ) {
                    $resources[$identifier] = [
                        'status' => 'COPIED',
                        'resultIdentifier' => $resultFolder->getCombinedIdentifier()
                    ];
                }
            } catch (InvalidTargetFolderException $e) {
                $message = $e->getMessage();
            } catch (ResourceException $e) {
                $message = $e->getMessage();
            }
            if ($message !== '') {
                $resources[$identifier] = [
                    'status' => 'FAILED',
                    'message' => $message
                ];
            }
        }
        return new JsonResponse(['resources' => $resources]);
    }

    /**
     * Move files or folders
     * Query parameters
     *  'identifiers' array of identifier to move
     *  'targetFolderIdentifier' string the target identifier. Must be a folder.
     *  'conflictMode' string one of: "replace", "cancel", "rename", as defined in \TYPO3\CMS\Core\Resource\DuplicationBehavior
     *
     * @param ServerRequestInterface $request
     *
     * @return JsonResponse
     */
    public function moveResourcesAction(ServerRequestInterface $request): JsonResponse
    {
        try {
            $identifiers = $request->getQueryParams()['identifiers'];
            $conflictMode = $request->getQueryParams()['conflictMode'] ?? '';
            $targetFolderIdentifier
                = $request->getQueryParams()['targetFolderIdentifier'];
            if (empty($identifiers)) {
                throw new ControllerException('Identifier needed', 1553699828);
            }
            if (empty($conflictMode) || !in_array($conflictMode, ['replace', 'cancel', 'rename'], true)) {
                throw new ControllerException('conflictMode must be one of "replace", "cancel", "rename"');
            }
            if (empty($targetFolderIdentifier)) {
                throw new ControllerException('Target folder identifier needed',
                    1554122023);
            }
            $resourceFactory
                = GeneralUtility::makeInstance(ResourceFactory::class);
            $targetFolderObject
                = $resourceFactory->getObjectFromCombinedIdentifier($targetFolderIdentifier);
            if (!$targetFolderObject instanceof Folder) {
                throw new ControllerException('Target identifier is not a folder',
                    1553701684);
            }
        } catch (ResourceException $e) {
            return new JsonExceptionResponse($e);
        } catch (ControllerException $e) {
            return new JsonExceptionResponse($e);
        }
        $resources = [];
        foreach ($identifiers as $identifier) {
            try {
                $sourceObject = $resourceFactory->getObjectFromCombinedIdentifier($identifier);
                $message = '';
                if ($resultFolder
                    = $sourceObject->moveTo($targetFolderObject, null,
                    $conflictMode)
                ) {
                    $resources[$identifier] = [
                        'status' => 'MOVED',
                        'resultIdentifier' => $resultFolder->getCombinedIdentifier()
                    ];
                }
            } catch (InvalidTargetFolderException $e) {
                $message = $e->getMessage();
            } catch (ResourceException $e) {
                $message = $e->getMessage();
            }
            if ($message !== '') {
                $resources[$identifier] = [
                    'status' => 'FAILED',
                    'message' => $message
                ];
            }
        }
        return new JsonResponse(['resources' => $resources]);
    }

    /**
     * rename file or folder
     * Query parameters
     *  'identifier' string identifier to rename
     *  'targetName' string The new name of file or folder.
     *  'conflictMode' string one of: "replace", "cancel", "rename"
     *
     * @param ServerRequestInterface $request
     *
     * @return JsonResponse
     */
    public function renameResourcesAction(ServerRequestInterface $request): JsonResponse
    {
        try {
            $identifier = $request->getQueryParams()['identifier'];
            $targetName = $request->getQueryParams()['targetName'];
            $conflictMode = $request->getQueryParams()['conflictMode'] ?? '';
            if (empty($identifier)) {
                throw new ControllerException('Identifier needed', 1553699828);
            }
            if (empty($conflictMode) || !in_array($conflictMode, ['replace', 'cancel', 'rename'], true)) {
                throw new ControllerException('conflictMode must be one of "replace", "cancel", "rename"');
            }
            if (empty($targetName)) {
                throw new ControllerException('Target name needed',
                    1554193259);
            }
        } catch (ControllerException $e) {
            return new JsonExceptionResponse($e);
        }
        try {
            $resourceFactory
                = GeneralUtility::makeInstance(ResourceFactory::class);
            $fileOrFolder
                = $resourceFactory->retrieveFileOrFolderObject($identifier);
        } catch (ResourceException\ResourceDoesNotExistException $e) {
            $resources = [
                $identifier => [
                    'status' => 'FAILED',
                    'message' => 'Identifier is not a valid file or folder identifier'
                ]
            ];
            return new JsonResponse($resources);
        }
        try {
            if ($fileOrFolder !== null) {
                $resultFileOrFolder = $fileOrFolder->rename($targetName,
                    $conflictMode);
                $resources = [
                    $identifier => [
                        'status' => 'RENAMED',
                        'message' => 'File/folder was successfully renamed',
                        'resultIdentifier' => $resultFileOrFolder->getCombinedIdentifier()
                    ]
                ];
                return new JsonResponse($resources);
            }
            throw new ResourceException('Invalid file or folder identifier',
                1554210572);
        } catch (ResourceException $e) {
            return new JsonExceptionResponse($e);
        }
    }

    /**
     * delete file or folder
     * Query parameters
     *  'identifier' string identifier of file or folder to delete
     *
     * @param ServerRequestInterface $request
     *
     * @return JsonResponse
     */
    public function deleteResourcesAction(ServerRequestInterface $request): JsonResponse
    {
        try {
            $identifier = $request->getQueryParams()['identifier'];
            if (empty($identifier)) {
                throw new ControllerException('Identifier needed', 1553699828);
            }
        } catch (ControllerException $e) {
            return new JsonExceptionResponse($e);
        }
        try {
            $resourceFactory
                = GeneralUtility::makeInstance(ResourceFactory::class);
            $fileOrFolder = $resourceFactory->retrieveFileOrFolderObject($identifier);
            if ($fileOrFolder === null) {
                $resources = [$identifier => [
                    'status' => 'FAILED',
                    'message' => 'Identifier is not a valid file or folder identifier'
                ]] ;
                return new JsonResponse($resources);
            }
            if (!$fileOrFolder->delete(true)) {
                $resources = [$identifier => [
                    'status' => 'FAILED',
                    'message' => 'Could not delete resource'
                ]];
                return new JsonResponse($resources);
            }
        } catch (ResourceException $e) {
            return new JsonExceptionResponse($e);
        }
        $resources = [$identifier => [
            'status' => 'DELETED',
            'message' => 'File/folder was successfully removed'
        ]] ;
        return new JsonResponse($resources);
    }

    /**
     * @return BackendUserAuthentication
     */
    protected function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }
}
