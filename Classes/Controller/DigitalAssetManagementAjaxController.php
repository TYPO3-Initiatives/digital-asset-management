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
use TYPO3\CMS\Core\Resource\ResourceStorage;
use TYPO3\CMS\DigitalAssetManagement\Service\FileSystemInterface;

/**
 * Backend controller: The "Digital Asset Management" JSON response controller
 *
 * Optional replacement of filelist
 */
class DigitalAssetManagementAjaxController
{
    /**
     * Main entry method: Dispatch to other actions - those method names that end with "Action".
     *
     * @param ServerRequestInterface $request the current request
     * @return ResponseInterface the response with the content
     */
    public function handleAjaxRequestAction(ServerRequestInterface $request): ResponseInterface
    {
        $response = new JsonResponse();
        $result = [];
        $params = $request->getQueryParams();
        // Execute all query params starting with get using its values as parameter
        foreach ($params as $key => $param){
            if (strpos($key, 'get') === 0) {
                $func = $key.'Action';
                if (is_callable([$this, $func])) {
                    $result['actionparam'] = $param;
                    $result[$key] = call_user_func(array(DigitalAssetManagementAjaxController::class, $func), $param);
                }
            }
        }
        $response->setPayload($result);
        return $response;
    }

    /**
     * get file and folder content for a path
     * empty string means get all storages or mounts of the be-user or the root level of a single available storage
     *
     * @param string $path
     * @return array
     */
    protected function getContentAction($path = "")
    {
        $backendUser = $this->getBackendUser();
        // Get all storage objects
        /** @var ResourceStorage[] $fileStorages */
        $fileStorages = $backendUser->getFileStorages();
        /** @var FileSystemInterface $service */
        $service = null;
        $result['debug'] = \TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($fileStorages,null, 8, false, true,true);
        if (is_array($fileStorages)){
            $storageId = null;
            if (($path !== "") && (strlen($path)>1)) {
                list($storageId, $path) = explode(":", $path, 2);
            }
            if ($path === "") {
                $path = "/";
            }
            $files = [];
            $folders = [];
            $breadcrumbs = [];
            $breadcrumbs[] = [
                'identifier' => '',
                'name' => 'home',
                'type' => 'home'
            ];
            $relPath = $path;
            /** @var ResourceStorage $fileStorage  */
            foreach ($fileStorages as $fileStorage) {
                $storageInfo = $fileStorage->getStorageRecord();
                if ((count($fileStorages) == 1) || ($storageId && ($storageInfo['uid'] == $storageId))) {
                    $identifier = $storageInfo['uid'] . ':';
                    $fileMounts = $fileStorage->getFileMounts();
                    if (!empty($fileMounts)) {
                        foreach ($fileMounts as $fileMount) {
                            if (strpos ( $path, $fileMount['path'] ) === 0) {
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
                        $identifier .= '/';
                        if (count($fileStorages) > 1) {
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
                    $service = new \TYPO3\CMS\DigitalAssetManagement\Service\LocalFileSystemService($fileStorage);
                    if ($service) {
                        $files = $service->listFiles($path);
                        $folders = $service->listFolder($path);
                        unset($service);
                    }
                    break;
                } elseif ($storageId === null) {
                    $fileMounts = $fileStorage->getFileMounts();
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
                        unset($fileMounts);
                    } else {
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
            }
            return ['files' => $files, 'folders' => $folders, 'breadcrumbs' => $breadcrumbs];
        }
    }

    /**
     * get file and folder content for a path
     * empty string means get all storages or mounts of the be-user or the root level of a single available storage
     *
     * @param string $path
     * @return array
     */
    protected function getThumbnailAction($path = "")
    {
        $backendUser = $this->getBackendUser();
        // Get all storage objects
        /** @var ResourceStorage[] $fileStorages */
        $fileStorages = $backendUser->getFileStorages();
        /** @var FileSystemInterface $service */
        $service = null;
        //$result['debug'] = \TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($fileStorages,null, 8, false, true,true);
        $path = urldecode($path);
        if (is_array($fileStorages) && (strlen($path)>6)) {
            list($storageId, $path) = explode(":", $path, 2);
            if ($storageId && !empty($path)) {
                /** @var ResourceStorage $fileStorage  */
                foreach ($fileStorages as $fileStorage) {
                    $storageInfo = $fileStorage->getStorageRecord();
                    if ($storageInfo['uid'] == $storageId) {
                        $service = new \TYPO3\CMS\DigitalAssetManagement\Service\LocalFileSystemService($fileStorage);
                        if ($service) {
                            $file = $fileStorage->getFile($path);
                            $thumb = $service->thumbnail(rtrim($_SERVER["DOCUMENT_ROOT"],"/").'/'.$file->getPublicUrl(), true);
                            unset($service);
                        }
                        break;
                    }
                }
            }
            return ['thumbnail' => $thumb];
        }
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
