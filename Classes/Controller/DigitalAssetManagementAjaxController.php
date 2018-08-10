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
use TYPO3\CMS\Core\Http\JsonResponse;
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
    protected function getContentAction(array $params = null): array
    {
        $userSettings = $this->getSettings($params);
        $path = $userSettings['path'] ?? '';
        if (!empty($params['path'])) {
            $path = $params['path'];
        }
        if ($path === '*') {
            // Root-Level
            $result = $this->getStorages();
            $result['userSettings'] = $userSettings;
            return $result;
        }

        if ($path !== '') {
            $resourceFactory = GeneralUtility::makeInstance(ResourceFactory::class);
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
            $current = end($breadcrumbs); reset($breadcrumbs);
            $breadcrumbs = array_reverse($breadcrumbs);
            return [
                'current' => $current,
                'files' => $fileSystemService->listFiles($folderObject),
                'folders' => $fileSystemService->listFolder($folderObject),
                'breadcrumbs' => $breadcrumbs,
                'settings' => $userSettings
            ];
        }
    }

    /**
     * get thumbnail from image file
     * only local storages are supported until now
     * $params['path']/$params = $storageId.':'.$identifier
     *
     * @param string|array $params
     * @return array
     */
    protected function getThumbnailAction($params = ''): array
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
     * @param string|array $params
     * @return array
     */
    protected function getSettings($params): array
    {
        $backendUser = $this->getBackendUserAuthentication();
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
        if ($backendUser->uc['dam']) {
            $userSettings = $backendUser->uc['dam'];
        }
        // overwrite settings by query params
        if (is_array($params)) {
            if (isset($params['start'])) {
                $userSettings['start'] = (integer)$params['start'];
            }
            if (isset($params['count'])) {
                $userSettings['count'] = (integer)$params['count'];
            }
            if (isset($params['sort'])) {
                if (in_array($params['sort'], ['name', 'modified', 'size'])) {
                    $userSettings['sort'] = (string)$params['sort'];
                }
            }
            if (isset($params['view'])) {
                if (in_array($params['view'], ['list', 'symbols', 'photos'])) {
                    $userSettings['view'] = (string)$params['view'];
                }
            }
            if (isset($params['reverse'])) {
                $userSettings['reverse'] = filter_var($params['reverse'], FILTER_VALIDATE_BOOLEAN);
            }
            if (isset($params['meta'])) {
                $userSettings['meta'] = filter_var($params['meta'], FILTER_VALIDATE_BOOLEAN);
            }
        }
        return $userSettings;
    }

    /**
     * @return array
     */
    protected function getStorages(): array
    {
        $folders = [];
        foreach ($this->getBackendUserAuthentication()->getFileStorages() as $storage) {
            $storageInfo = $storage->getStorageRecord();
            $fileMounts = $storage->getFileMounts();
            if (!empty($fileMounts)) {
                foreach ($fileMounts as $fileMount) {
                    $folders[] = [
                        'identifier' => $storageInfo['uid'] . ':' . $fileMount['path'],
                        'name' => $fileMount['title'],
                        'storage_name' => $storageInfo['name'],
                        'storage' => $storageInfo['uid'],
                        'type' => 'mount'
                    ];
                }
            } else {
                // No mountpoint exists in the storage
                $folders[] = [
                    'identifier' => $storageInfo['uid'] . ':',
                    'name' => $storageInfo['name'],
                    'storage_name' => $storageInfo['name'],
                    'storage' => $storageInfo['uid'],
                    'type' => 'storage'
                ];
            }
        }
        return [
            'files' => [],
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

        $parentFolder = $folder->getParentFolder();
        if ($parentFolder->getIdentifier() === '/') {
            $breadcrumbs[] = [
                'identifier' => $folder->getStorage()->getUid() . ':/',
                'name' => $folder->getStorage()->getName(),
                'type' => 'storage'
            ];
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
