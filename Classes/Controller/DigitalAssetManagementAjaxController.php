<?php
declare(strict_types = 1);
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
    /** @var array $result */
    private $result = [];

    /**
     * Main entry method: Dispatch to other actions - those method names that end with "Action".
     *
     * @param ServerRequestInterface $request the current request
     * @return ResponseInterface the response with the content
     */
    public function handleAjaxRequestAction(ServerRequestInterface $request): ResponseInterface
    {
        $response = new JsonResponse();
        $this->result['action'] = '';
        $this->result['params'] = [];
        $params = $request->getQueryParams();
        // Execute all query params starting with get using its values as parameter
        foreach ($params as $key => $param) {
            if ($key === 'action') {
                $this->result['action'] = $param;
                $func = $param . 'Action';
            } elseif ($key === 'params') {
                $this->result['params'] = $param;
            }
        }
        if ($func && is_callable([$this, $func])) {
            $this->result['result'] = call_user_func(array(DigitalAssetManagementAjaxController::class, $func), $this->result['params']);
        }
        $response->setPayload($this->result);
        return $response;
    }

    /**
     * get file and folder content for a path
     * empty string means get all storages or mounts of the be-user or the root level of a single available storage
     * $params['path']/$params = $storageId.':'.$identifier
     *
     * @param string|array $params
     * @return array
     */
    protected function getContentAction($params = ""): array
    {
        // load user settings array updated by query values
        $userSettings = $this->getSettings($params);
        // get requested path from params
        $path =  (is_array($params) ? $params['path'] : $params);
        // get backend user
        $backendUser = $this->getBackendUser();
        // get all storage objects
        /** @var ResourceStorage[] $storages */
        $storages = $backendUser->getFileStorages();
        if (is_array($storages)){
            $storageId = null;
            if ($path === "" || is_null($path)) {
                $path = $userSettings['path'];
            } elseif ($path === "*" ) {
                $userSettings['path'] = '';
                $path = "";
            }
            if (($path !== "") && (strlen($path) > 1)) {
                list($storageId, $path) = explode(":", $path, 2);
            }
            if ($path === "") {
                $path = "/";
            }
            // init return values
            $files = [];
            $folders = [];
            $breadcrumbs = [];
            $breadcrumbs[] = [
                'identifier' => '*',
                'name' => 'home',
                'type' => 'home'
            ];
            $relPath = $path;
            /** @var ResourceStorage $storage  */
            if ($storageId === null) {
                // no storage, mountpoint and folder selected
                if (count($storages) > 1) {
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
                        // only one mountpoint
                        $service = new FileSystemService($storage);
                        if ($service) {
                            $files = $service->listFiles($path);
                            $folders = $service->listFolder($path);
                            unset($service);
                        }
                    }
                    unset($storageInfo);
                }
            } else {
                // storage or mountpoint selected
                foreach ($storages as $storage) {
                    $storageInfo = $storage->getStorageRecord();
                    if ((count($storages) === 1) || ($storageId && ($storageInfo['uid'] == $storageId))) {
                        // selected storage
                        $identifier = $storageInfo['uid'] . ':';
                        $fileMounts = $storage->getFileMounts();
                        if (!empty($fileMounts)) {
                            // mountpoint exists
                            foreach ($fileMounts as $fileMount) {
                                if (strpos($path, $fileMount['path']) === 0) {
                                    $identifier .= $fileMount['path'];
                                    $breadcrumbs[] = [
                                        'identifier' => $identifier,
                                        'name' => $fileMount['title'],
                                        'type' => 'mount'
                                    ];
                                    $relPath = str_replace($fileMount['path'], '', $relPath);
                                }
                            }
                            unset($fileMounts);
                        } else {
                            // no mountpoint exists but more than one storage
                            $identifier .= '/';
                            if (count($storages) > 1) {
                                $breadcrumbs[] = [
                                    'identifier' => $identifier,
                                    'name' => $storageInfo['name'],
                                    'type' => 'storage'
                                ];
                            }
                        }
                        $aPath = explode('/', $relPath);
                        for ($i = 0; $i < count($aPath); $i++) {
                            if ($aPath[$i] !== '') {
                                $identifier .= $aPath[$i] . '/';
                                $breadcrumbs[] = [
                                    'identifier' => $identifier,
                                    'name' => $aPath[$i],
                                    'type' => 'folder'
                                ];
                            }
                        }
                        /** @var FileSystemInterface $service */
                        $service = new FileSystemService($storage);
                        if ($service) {
                            if( $path === '/') {
                                $folder = $storage->getRootLevelFolder();
                            } else {
                                $folder = $storage->getFolder($path);
                            }
                            if ($userSettings['start'] == 0) {
                                $folders = $service->listFolder($folder, 0, 0, $userSettings['sort'], $userSettings['reverse']);
                            }
                            $files = $service->listFiles($folder, $userSettings['meta'], $userSettings['start'], $userSettings['count'], $userSettings['sort'], $userSettings['reverse']);
                            unset($service);
                        }
                        // store path to user settings
                        $userSettings['path'] = $identifier;
                        break;
                    }
                    unset($storageInfo);
                }
            }
            // save user settings array
            $this->setSettings($userSettings);
            return ['files' => $files, 'folders' => $folders, 'breadcrumbs' => $breadcrumbs, 'settings' => $userSettings];
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
    protected function getThumbnailAction($params = ""): array
    {
        $path = (is_array($params) ? reset($params) : $params);
        if (strlen($path)>6) {
            list($storageId, $identifier) = explode(":", $path, 2);
            if ($storageId && !empty($identifier)) {
                /** @var ResourceStorage $storage */
                $storage = ResourceFactory::getInstance()->getStorageObject($storageId);
                $storage->setEvaluatePermissions(true);
                if (($storage->getUid() == $storageId) && ($storage->getDriverType() === 'Local')) {
                    /** @var FileSystemInterface $service */
                    $service = new FileSystemService($storage);
                    if ($service) {
                        $file = $storage->getFile($identifier);
                        $thumb = $service->thumbnail(rtrim($_SERVER["DOCUMENT_ROOT"], "/") . '/' . urldecode($file->getPublicUrl()), true);
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
        if (strlen($path)>6) {
            list($storageId, $identifier) = explode(":", $path, 2);
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
     * rename file
     *
     * @param array $params
     * @return array
     */
    protected function renameFile($params): array
    {
        if (is_array($params)) {
            if (strlen($params['path'])>6) {
                list($storageId, $identifier) = explode(":", $params['path'], 2);
                if ($storageId && !empty($identifier) && !empty($params['newName'])) {
                    /** @var ResourceStorage $storage */
                    $storage = ResourceFactory::getInstance()->getStorageObject($storageId);
                    $storage->setEvaluatePermissions(true);
                    /** @var FileSystemInterface $service */
                    $service = new FileSystemService($storage);
                    if ($service) {
                        $file = $service->rename($identifier, $params['newName']);
                        unset($service);
                    }
                    unset($storage);
                    return ['file' => $file];
                }
            }
        }
    }

    /**
     * delete file(s)
     *
     * @param string|array $params
     * @return array
     */
    protected function deleteFile($params): array
    {
        if (is_array($params)) {
            for($i=0; $i < count($params); $i++) {
                if (strlen($params[$i])>6) {
                    list($storageId, $identifier) = explode(":", $params['path'], 2);
                    if ($storageId && !empty($identifier)) {
                        /** @var ResourceStorage $storage */
                        $storage = ResourceFactory::getInstance()->getStorageObject($storageId);
                        $storage->setEvaluatePermissions(true);
                        /** @var FileSystemInterface $service */
                        $service = new FileSystemService($storage);
                        if ($service) {
                            $service->delete($identifier);
                            unset($service);
                        }
                        unset($storage);
                    }
                }
            }
        } elseif (strlen($params)>6) {
            list($storageId, $identifier) = explode(":", $params, 2);
            if ($storageId && !empty($identifier)) {
                /** @var ResourceStorage $storage */
                $storage = ResourceFactory::getInstance()->getStorageObject($storageId);
                $storage->setEvaluatePermissions(true);
                /** @var FileSystemInterface $service */
                $service = new FileSystemService($storage);
                if ($service) {
                    $service->delete($identifier);
                    unset($service);
                }
                unset($storage);
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
    protected function reindexStorageAction($params = "")
    {
        $path = (is_array($params) ? reset($params) : $params);
        if (strlen($path)>1) {
            list($storageId, $identifier) = explode(":", $path, 2);
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
        $backendUser = $this->getBackendUser();
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
                $userSettings['meta'] = filter_var($params['meta'], FILTER_VALIDATE_BOOLEAN);;
            }
        }
        return $userSettings;
    }

    /**
     * Set the DAM user settings
     *
     * @param array $settings
     */
    protected function setSettings($settings)
    {
        $backendUser = $this->getBackendUser();
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
    protected function getBackendUser()
    {
        return $GLOBALS['BE_USER'];
    }
}
