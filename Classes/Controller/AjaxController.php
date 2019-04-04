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
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Authentication\BackendUserAuthentication;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Resource\DuplicationBehavior;
use TYPO3\CMS\Core\Resource\Exception as ResourceException;
use TYPO3\CMS\Core\Resource\Exception\InvalidTargetFolderException;
use TYPO3\CMS\Core\Resource\Exception\ResourceDoesNotExistException;
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
use TYPO3\CMS\DigitalAssetManagement\Http\FileExistsResponse;
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
     * @return JsonResponse
     */
    public function getNewStorageUrlAction(): JsonResponse
    {
        $backendUser = $this->getBackendUser();
        if (!$backendUser->isAdmin()) {
            return new JsonExceptionResponse(new ControllerException('User is not admin', 1554380677));
        }
        $uriBuilder = GeneralUtility::makeInstance(UriBuilder::class);
        $urlParameters = [
            'edit' => [
                'sys_file_storage' => [
                    0 => 'new',
                ],
            ],
            'returnUrl' => (string)$uriBuilder->buildUriFromRoute('file_DigitalAssetManagement'),
        ];
        return new JsonResponse([ (string)$uriBuilder->buildUriFromRoute('record_edit', $urlParameters) ]);
    }

    /**
     * Set module state of BE user. Send a json array as ['data'] POST
     *
     * @param ServerRequestInterface $request
     * @return JsonResponse
     */
    public function setStateAction(ServerRequestInterface $request): JsonResponse
    {
        $backendUser = $this->getBackendUser();
        $backendUser->uc['digital_asset_management'] = $request->getParsedBody()['data'] ?? [];
        $backendUser->writeUC();
        return new JsonResponse();
    }

    /**
     * @return JsonResponse
     */
    public function getStateAction(): JsonResponse
    {
        return new JsonResponse([ 'data' => $this->getBackendUser()->uc['digital_asset_management'] ?? []]);
    }

    /**
     * @param ServerRequestInterface $request
     * @return JsonResponse
     */
    public function createFolderAction(ServerRequestInterface $request): JsonResponse
    {
        $identifier = $request->getQueryParams()['identifier'] ?? '';
        if (empty($identifier)) {
            return new JsonExceptionResponse(new ControllerException('Identifier needed', 1554204780));
        }
        try {
            $folder = $this->createFolderRecursive($identifier);
            return new JsonResponse([ new FolderItemFolder($folder) ]);
        } catch (ResourceException $e) {
            return new JsonExceptionResponse($e);
        }
    }

    /**
     * @param ServerRequestInterface $request
     * @return JsonResponse
     */
    public function fileUploadAction(ServerRequestInterface $request): JsonResponse
    {
        $identifier = $request->getQueryParams()['identifier'] ?? '';
        $conflictMode = $request->getQueryParams()['conflictMode'] ?? '';
        $tempFilename = '';
        try {
            if (empty($identifier)) {
                throw new ControllerException('Identifier needed', 1554132801);
            }
            if (empty($conflictMode) || !in_array($conflictMode, ['replace', 'cancel', 'rename'], true)) {
                throw new ControllerException('conflictMode must be one of "replace", "cancel", "rename"');
            }
            $folderIdentifier = dirname($identifier) . '/';
            $fileIdentifier = basename($identifier);
            $resourceFactory = GeneralUtility::makeInstance(ResourceFactory::class);
            try {
                $folder = $resourceFactory->retrieveFileOrFolderObject($folderIdentifier);
            } catch (ResourceDoesNotExistException $e) {
                $folder = $this->createFolderRecursive($folderIdentifier);
            }
            $tempFilename = tempnam(sys_get_temp_dir(), 'upload_');
            file_put_contents($tempFilename, $request->getBody());
            $file = $folder->addFile($tempFilename, $fileIdentifier, (string)DuplicationBehavior::cast($conflictMode));
            $fileExtension = strtolower($file->getExtension());
            if (GeneralUtility::inList($GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext'], $fileExtension)
                || GeneralUtility::inList($GLOBALS['TYPO3_CONF_VARS']['GFX']['mediafile_ext'], $fileExtension)
            ) {
                return new JsonResponse([ new FolderItemImage($file) ]);
            }
            return new JsonResponse([ new FolderItemFile($file) ]);
        } catch (ResourceException $e) {
            if (!empty($tempFilename) && file_exists($tempFilename)) {
                unlink($tempFilename);
            }
            return new JsonExceptionResponse($e);
        } catch (ControllerException $e) {
            return new JsonExceptionResponse($e);
        }
    }

    /**
     * @param string $folderIdentifier
     * @return Folder
     */
    protected function createFolderRecursive(string $folderIdentifier): Folder
    {
        $resourceFactory = GeneralUtility::makeInstance(ResourceFactory::class);
        $stack = [];
        while (true) {
            $parentName = dirname($folderIdentifier);
            $folderName = basename($folderIdentifier);
            $stack[] = $folderName;
            try {
                $parentObject = $resourceFactory->retrieveFileOrFolderObject($parentName);
                break;
            } catch (ResourceDoesNotExistException $e) {
                $folderIdentifier = $parentName;
            }
        }
        while ($folderName = array_pop($stack)) {
            $parentObject = $parentObject->createFolder($folderName);
        }
        return $parentObject;
    }

    /**
     * @param ServerRequestInterface $request
     * @return JsonResponse
     */
    public function fileExistsAction(ServerRequestInterface $request): JsonResponse
    {
        $identifier = $request->getQueryParams()['identifier'];
        if (empty($identifier)) {
            return new JsonExceptionResponse(new ControllerException('Identifier needed', 1554125449));
        }
        $resourceFactory = GeneralUtility::makeInstance(ResourceFactory::class);
        $folderIdentifier = dirname($identifier) . '/';
        $fileIdentifier = basename($identifier);
        try {
            $folder = $resourceFactory->retrieveFileOrFolderObject($folderIdentifier);
        } catch (ResourceDoesNotExistException $e) {
            return new FileExistsResponse(FileExistsResponse::PARENT_FOLDER_DOES_NOT_EXIST);
        }
        $fileName = $folder->getStorage()->sanitizeFileName($fileIdentifier, $folder);
        if ($folder->hasFile($fileName)) {
            $file = $resourceFactory->getFileObjectFromCombinedIdentifier($folderIdentifier . $fileName);
            // If file is an image or media, create image object, else file object
            $fileExtension = strtolower($file->getExtension());
            if (GeneralUtility::inList($GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext'], $fileExtension)
                || GeneralUtility::inList($GLOBALS['TYPO3_CONF_VARS']['GFX']['mediafile_ext'], $fileExtension)
            ) {
                return new JsonResponse([ new FolderItemImage($file) ]);
            }
            return new JsonResponse([ new FolderItemFile($file) ]);
        } else {
            return new FileExistsResponse(FileExistsResponse::FILE_DOES_NOT_EXIST);
        }
    }

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
            $identifier = $request->getQueryParams()['identifier'] ?? '';
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
        return new StoragesAndMountsResponse([]);
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
            $identifier = $request->getQueryParams()['identifier'] ?? '';
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
            if ($message !== ''&& $resources[$identifier] === null) {
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
        $resources = [];
        $message = '';
        try {
            $resourceFactory
                = GeneralUtility::makeInstance(ResourceFactory::class);
            $fileOrFolder
                = $resourceFactory->retrieveFileOrFolderObject($identifier);
        } catch (ResourceException $e) {
            $message = $e->getMessage();
        }
        try {
            if ($fileOrFolder === null) {
                throw new ResourceException\ResourceDoesNotExistException('Resource does not exist');
            } else {
                $resultFileOrFolder = $fileOrFolder->rename($targetName,
                    $conflictMode);
                $resources[$identifier] = [
                    'status' => 'RENAMED',
                    'message' => 'File/folder was successfully renamed',
                    'resultIdentifier' => $resultFileOrFolder->getCombinedIdentifier()
                ];
            }
        } catch (ResourceException $e) {
            $message = $e->getMessage();
        }
        if ($message !== '') {
            $resources[$identifier] = [
                'status' => 'FAILED',
                'message' => $message
            ];
        }
        return new JsonResponse($resources);
    }

    /**
     * delete file or folder
     * Query parameters
     *  'identifiers' array of strings identifier of file or folder to delete
     *
     * @param ServerRequestInterface $request
     *
     * @return JsonResponse
     */
    public function deleteResourcesAction(ServerRequestInterface $request): JsonResponse
    {
        try {
            $identifiers = $request->getQueryParams()['identifiers'];
            if (empty($identifiers)) {
                throw new ControllerException('Identifiers needed', 1553699828);
            }
        } catch (ControllerException $e) {
            return new JsonExceptionResponse($e);
        }
        $resourceFactory
            = GeneralUtility::makeInstance(ResourceFactory::class);
        $resources = [];
        foreach ($identifiers as $identifier) {
            try {
                $sourceObject = $resourceFactory->getObjectFromCombinedIdentifier($identifier);
                if ($success = $sourceObject->delete(true)) {
                    $resources[$identifier] = [
                        'status' => 'DELETED'
                    ];
                } else {
                    throw new ResourceException('Resource could not be deleted');
                }
            } catch (ResourceException $e) {
                if ($resources[$identifier] === null) {
                    $resources[$identifier] = [
                        'status' => 'FAILED',
                        'message' => $e->getMessage()
                    ];
                }
            }
        }
        return new JsonResponse(['resources' => $resources]);
    }

    /**
     * @return BackendUserAuthentication
     */
    protected function getBackendUser(): BackendUserAuthentication
    {
        return $GLOBALS['BE_USER'];
    }
}
