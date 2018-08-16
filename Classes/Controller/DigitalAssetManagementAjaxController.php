<?php
declare(strict_types = 1);

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

namespace TYPO3\CMS\DigitalAssetManagement\Controller;

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Routing\Exception\RouteNotFoundException;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Http\JsonResponse;
use TYPO3\CMS\Core\Resource\Exception\InsufficientFolderAccessPermissionsException;
use TYPO3\CMS\Core\Resource\Exception\ResourceDoesNotExistException;
use TYPO3\CMS\Core\Resource\FolderInterface;
use TYPO3\CMS\Core\Resource\Index\Indexer;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Resource\ResourceStorage;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\DigitalAssetManagement\Service\FileSystemInterface;
use TYPO3\CMS\DigitalAssetManagement\Service\FileSystemService;

/**
 * Backend controller: The "Digital Asset Management" JSON response controller
 *
 * Optional replacement of filelist
 */
class DigitalAssetManagementAjaxController
{
    /**
     * @var array
     */
    private $result = [];

    /**
     * Main entry method: Dispatch to other actions - those method names that end with "Action".
     *
     * @param ServerRequestInterface $request the current request
     * @return ResponseInterface the response with the content
     */
    public function handleAjaxRequestAction(ServerRequestInterface $request): ResponseInterface
    {
        $requestParameters = $request->getQueryParams();
        $this->result['action'] = $requestParameters['action'] ?? null;
        $this->result['params'] = $requestParameters['params'] ?? null;

        $method = $this->result['action'] . 'Action';
        if (is_callable([$this, $method])) {
            $this->result['result'] = $this->$method($this->result['params']);
        }
        return new JsonResponse($this->result);
    }

    /**
     * Get file and folder content for a path
     * empty string means get all storages or mounts of the backend user or the root level of a single available storage
     *
     * $params['path'] = $storageId.':'.$identifier
     *
     * @param array $params
     * @return array
     */
    protected function getContentAction(array $params = []): array
    {
        $userSettings = $this->getSettings($params);
        $path = $userSettings['path'] ?? '';
        if (!empty($params['path'])) {
            $path = $params['path'];
        }
        if ($path !== '' && $path !== '*') {
            $resourceFactory = GeneralUtility::makeInstance(ResourceFactory::class);
            try {
                $folderObject = $resourceFactory->getObjectFromCombinedIdentifier($path);
                $userSettings['path'] = $path;
                $this->setSettings($userSettings);
                $fileSystemService = new FileSystemService($folderObject->getStorage());
                $breadcrumbs = $this->buildBreadCrumb($folderObject);
                $breadcrumbs[] = [
                    'identifier' => '*',
                    'name' => 'home',
                    'type' => 'home'
                ];
                $current = end($breadcrumbs);
                reset($breadcrumbs);
                $breadcrumbs = array_reverse($breadcrumbs);
                return [
                    'current' => $current,
                    'files' =>  $fileSystemService->listFiles($folderObject),
                    'folders' => $fileSystemService->listFolder($folderObject),
                    'breadcrumbs' => $breadcrumbs,
                    'settings' => $userSettings
                ];
            } catch (ResourceDoesNotExistException $exception) {
                $path = '*';
            }
        }
        if ($path === '*' || $path === '') {
            // Root-Level, get storages and/or mounts
            $result = $this->getMountsAndStorages();
            $result['breadcrumbs'] = [[
                'identifier' => '*',
                'name' => 'home',
                'type' => 'home'
            ]];
            $result['settings'] = $userSettings;
            return $result;
        }

        return [
            [
                'identifier' => '*',
                'name' => 'home',
                'type' => 'home'
            ]
        ];
    }

    /**
     * get thumbnail from image file using core thumbnail controller
     * only local storages are supported until now
     * $params['path']/$params = $storageId.':'.$identifier
     *
     * @param array $params
     * @return array
     */
    protected function getThumbnailAction($params = []): array
    {
        $combinedIdentifier = (is_array($params) ? reset($params) : $params);
        if (strlen($combinedIdentifier) > 6) {
            try {
                $imageUri = (string)GeneralUtility::makeInstance(UriBuilder::class)
                ->buildUriFromRoute('thumbnails', [
                    'fileIdentifier' => $combinedIdentifier,
                    'processingInstructions' => [
                        'width' => 0,
                        'height' => 0,
                        'maxHeight' => 198
                    ]
                ]);
            } catch (RouteNotFoundException $e) {
                // todo: remove when this patch https://review.typo3.org/c/57646/ was merged
                $imageUri = $this->getThumbnail($params);
            }
            return ['thumbnail' => $imageUri];
        }
    }

    /**
     * get thumbnail from image file
     * only local storages are supported until now
     * $params['path']/$params = $storageId.':'.$identifier
     *
     * @param array $params
     * @deprecated use core route thumbnails instead
     * @return array
     */
    protected function getThumbnail($params = []): array
    {
        $path = (is_array($params) ? reset($params) : $params);
        if (strlen($path) > 6) {
            list($storageId, $identifier) = explode(':', $path, 2);
            if ($storageId && !empty($identifier)) {
                /** @var ResourceStorage $storage */
                $storage = ResourceFactory::getInstance()->getStorageObject($storageId);
                $storage->setEvaluatePermissions(true);
                if (($storage->getUid() == $storageId) && ($storage->getDriverType() === 'Local')) {
                    /** @var FileSystemInterface $service */
                    $service = new FileSystemService($storage);
                    if ($service) {
                        $file = $storage->getFile($identifier);
                        $thumb = $service->thumbnail(rtrim($_SERVER['DOCUMENT_ROOT'], '/') . '/' . urldecode($file->getPublicUrl()), true);
                        unset($service);
                    }
                }
                unset($storage);
                return ['thumbnail' => $thumb];
            }
        }
    }

    /**
     * get metadata of file
     * $params['path']/$params = $storageId.':'.$identifier
     *
     * @param string|array $params
     * @return array
     */
    protected function getMetadataAction($params): array
    {
        $path = (is_array($params) ? reset($params) : $params);
        if (strlen($path) > 6) {
            list($storageId, $identifier) = explode(':', $path, 2);
            $file = [];
            if ($storageId && !empty($identifier)) {
                /** @var ResourceStorage $storage */
                $storage = ResourceFactory::getInstance()->getStorageObject($storageId);
                $storage->setEvaluatePermissions(true);
                /** @var FileSystemInterface $service */
                $service = new FileSystemService($storage);
                if ($service) {
                    $file = $service->info($identifier);
                    unset($service);
                }
                unset($storage);
                return ['file' => $file];
            }
        }
    }

    /**
     * delete file(s) within the same storage
     * $params[]/$params = $storageId.':'.$identifier
     *
     * @param string|array $params
     * @return array
     */
    protected function deleteAction($params): array
    {
        if (is_array($params)) {
            $identifier = [];
            $storageId = null;
            $i = 0;
            foreach ($params['path'] as $param) {
                list($storageId, $identifier[$i]) = explode(':', $param, 2);
                $i++;
            }
        } else {
            list($storageId, $identifier) = explode(':', $params, 2);
        }
        if ($storageId && !empty($identifier)) {
            /** @var ResourceStorage $storage */
            $storage = ResourceFactory::getInstance()->getStorageObject($storageId);
            //$storage->setEvaluatePermissions(true);
            /** @var FileSystemInterface $service */
            $service = new FileSystemService($storage);
            if ($service) {
                $this->result['deleteFile'] = $service->delete($identifier);
                unset($service);
            }
            unset($storage);
        }
        $this->result['action'] = 'getContent';
        return $this->getContentAction('');
    }

    /**
     * rename file
     * $params['path'] = $storageId.':'.$identifier
     * $params['newName'] = new filename string
     *
     * @param array $params
     * @return array
     */
    protected function renameAction($params): array
    {
        if (is_array($params)) {
            if (strlen($params['path']) > 6) {
                list($storageId, $identifier) = explode(':', $params['path'], 2);
                if ($storageId && !empty($identifier) && !empty($params['newName'])) {
                    /** @var ResourceStorage $storage */
                    $storage = ResourceFactory::getInstance()->getStorageObject($storageId);
                    $storage->setEvaluatePermissions(true);
                    /** @var FileSystemInterface $service */
                    $service = new FileSystemService($storage);
                    if ($service) {
                        $this->result['renameFile'] = $service->rename($identifier, $params['newName']);
                        unset($service);
                    }
                    unset($storage);
                }
            }
        }
        $this->result['action'] = 'getContent';
        return $this->getContentAction('');
    }

    /**
     * move file(s) within the same storage
     * $params['path']/$params['path'][] = $storageId.':'.$identifier
     * $params['newpath'] = $storageId.':'.$identifier of destination path string
     *
     * @param string|array $params
     * @return array
     */
    protected function moveAction($params): array
    {
        if (is_array($params)) {
            if ((strlen($params['newPath']) > 6) && !is_null($params['path'])) {
                list($storageId, $newFolderIdentifier) = explode(':', $params['newPath'], 2);
                if ($storageId && !empty($params['path'])) {
                    if (is_array($params['path'])) {
                        $identifier = [];
                        $i = 0;
                        foreach ($params['path'] as $param) {
                            list($storageId, $identifier[$i]) = explode(':', $param, 2);
                            $i++;
                        }
                    } else {
                        list($storageId, $identifier) = explode(':', $params['path'], 2);
                    }
                    /** @var ResourceStorage $storage */
                    $storage = ResourceFactory::getInstance()->getStorageObject($storageId);
                    $storage->setEvaluatePermissions(true);
                    /** @var FileSystemInterface $service */
                    $service = new FileSystemService($storage);
                    if ($service) {
                        $this->result['moveFile'] = $service->move($identifier, $newFolderIdentifier);
                        unset($service);
                    }
                    unset($storage);
                }
            }
        }
        $this->result['action'] = 'getContent';
        return $this->getContentAction('');
    }

    /**
     * FAL reindexing actual storage
     * $params['path']/$params = $storageId.':'.$identifier
     *
     * @param string|array $params
     * @return array
     */
    protected function reindexStorageAction($params = '')
    {
        $path = (is_array($params) ? reset($params) : $params);
        if (strlen($path)>1) {
            list($storageId, $identifier) = explode(':', $path, 2);
            if ($storageId) {
                /** @var ResourceStorage $storage  */
                $storage = ResourceFactory::getInstance()->getStorageObject($storageId);
                $storage->setEvaluatePermissions(false);
                /** @var Indexer $indexer */
                $indexer = GeneralUtility::makeInstance(Indexer::class, $storage);
                // @todo: don't take whole storage, use $identifier
                $indexer->processChangesInStorages();
                $storage->setEvaluatePermissions(true);
                unset($indexer);
                unset($storage);
            }
        }
        $this->result['action'] = 'getContent';
        return $this->getContentAction('');
    }

    /**
     * Returns the DAM user settings
     *
     * @param array $params
     * @return array
     */
    protected function getSettings($params): array
    {
        $backendUserAuthentication = $this->getBackendUserAuthentication();
        // default settings
        $userSettings = [
            'path' => '',
            'start' => 0,
            'count' => 0,
            'sort' => 'name',
            'view' => 'symbols',
            'reverse' => false,
            'meta' => false
        ];
        // get settings from user cache
        if ($backendUserAuthentication->uc['dam']) {
            $userSettings = $backendUserAuthentication->uc['dam'];
        }
        // overwrite settings by query params
        if (\is_array($params)) {
            foreach ($params as $key => $val) {
                if (isset($userSettings[$key])) {
                    switch ($key) {
                        case 'start':
                        case 'count':
                            $userSettings[$key] = (integer)$val;
                            break;
                        case 'sort':
                            if (\in_array($val, ['name', 'modified', 'size'])) {
                                $userSettings[$key] = (string)$val;
                            }
                            break;
                        case 'view':
                            if (\in_array($val, ['list', 'symbols', 'photos'])) {
                                $userSettings[$key] = (string)$val;
                            }
                            break;
                        case 'reverse':
                        case 'meta':
                            $userSettings[$key] = filter_var($val, FILTER_VALIDATE_BOOLEAN);
                            break;
                    }
                }
            }
        }
        return $userSettings;
    }

    /**
     * @return array
     */
    protected function getMountsAndStorages(): array
    {
        /**
         * @var ResourceStorage[] $storages
         */
        $storages = $this->getBackendUserAuthentication()->getFileStorages();
        $files = [];
        $folders = [];
        if (\is_array($storages)) {
            if (\count($storages) > 1) {
                // more than one storage
                foreach ($storages as $storage) {
                    $storageInfo = $storage->getStorageRecord();
                    $fileMounts = $storage->getFileMounts();
                    if (!empty($fileMounts)) {
                        // mount points exists in the storage
                        foreach ($fileMounts as $fileMount) {
                            $folders[] = [
                                'identifier' => $storageInfo['uid'] . ':' . $fileMount['path'],
                                'name' => $fileMount['title'],
                                'storage_name' => $storageInfo['name'],
                                'storage' => $storageInfo['uid'],
                                'type' => 'mount'
                            ];
                        }
                        unset($fileMounts);
                    } else {
                        // no mountpoint exists in the storage
                        $folders[] = [
                            'identifier' => $storageInfo['uid'] . ':',
                            'name' => $storageInfo['name'],
                            'storage_name' => $storageInfo['name'],
                            'storage' => $storageInfo['uid'],
                            'type' => 'storage'
                        ];
                    }
                    unset($storageInfo);
                }
            } else {
                // only one storage
                $storage = reset($storages);
                $storageInfo = $storage->getStorageRecord();
                $fileMounts = $storage->getFileMounts();
                if (count($fileMounts) > 1) {
                    // more than one mountpoint
                    foreach ($fileMounts as $fileMount) {
                        $folders[] = [
                            'identifier' => $storageInfo['uid'] . ':' . $fileMount['path'],
                            'name' => $fileMount['title'],
                            'storage_name' => $storageInfo['name'],
                            'storage' => $storageInfo['uid'],
                            'type' => 'mount'
                        ];
                    }
                    unset($fileMounts);
                } else {
                    // only one mountpoint, get the content immediately
                    $fileSystemService = new FileSystemService($storage);
                    $fileMount = array_shift($fileMounts);
                    try {
                        $folder = $storage->getFolder($fileMount['path']);
                        if ($fileSystemService) {
                            $files = $fileSystemService->listFiles($folder);
                            $folders = $fileSystemService->listFolder($folder);
                        }
                    } catch (InsufficientFolderAccessPermissionsException $exception) {
                    } catch (\Exception $exception) {
                    }
                }
            }
        }
        return [
            'files' => $files,
            'folders' => $folders,
            'breadcrumbs' => []
        ];
    }

    /**
     * @param FolderInterface $folder
     * @return array
     */
    protected function buildBreadCrumb(FolderInterface $folder): array
    {
        $breadcrumbs = [];
        $breadcrumbs[] = [
            'identifier' => $folder->getStorage()->getUid() . ':' . $folder->getIdentifier(),
            'name' => $folder->getName(),
            'type' => 'folder'
        ];

        try {
            $parentFolder = $folder->getParentFolder();
        } catch (InsufficientFolderAccessPermissionsException $exception) {
            return $breadcrumbs;
        }
        if ($parentFolder->getIdentifier() === '/') {
            if (count($this->getBackendUserAuthentication()->getFileStorages()) > 1) {
                $breadcrumbs[] = [
                    'identifier' => $folder->getStorage()->getUid() . ':/',
                    'name' => 'test ' . $folder->getStorage()->getName(),
                    'type' => 'storage'
                ];
            }
        } else {
            $breadcrumbs = array_merge($breadcrumbs, $this->buildBreadCrumb($parentFolder));
        }

        return $breadcrumbs;
    }

    /**
     * Set the DAM user settings
     *
     * @param array $settings
     */
    protected function setSettings($settings)
    {
        $backendUser = $this->getBackendUserAuthentication();
        $backendUser->uc['dam'] = $settings;
        $backendUser->writeUC();
    }

    /**
     * Returns an instance of LanguageService
     *
     * @return \TYPO3\CMS\Core\Localization\LanguageService
     */
    protected function getLanguageService()
    {
        return $GLOBALS['LANG'];
    }

    /**
     * Returns the current BE user.
     *
     * @return \TYPO3\CMS\Core\Authentication\BackendUserAuthentication
     */
    protected function getBackendUserAuthentication()
    {
        return $GLOBALS['BE_USER'];
    }
}
