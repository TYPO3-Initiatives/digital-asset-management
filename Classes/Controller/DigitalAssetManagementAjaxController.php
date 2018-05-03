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
     * / means get all storages or the root level of a single available storage
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
            //If there is only one storage show content of that as entrypoint
            if ((count($fileStorages) === 1) || ($path !== '')) {
                $storageId = 0;
                if ($path !== '') {
                    list($storageId, $path) = explode(':', $path, 2);
                }
                /** @var ResourceStorage $fileStorage  */
                foreach ($fileStorages as $fileStorage) {
                    if ($fileStorage->getUid() == $storageId) {
                        $storageInfo = $fileStorage->getStorageRecord();
                        if (isset($storageInfo['driver'])) {
                            switch ($storageInfo['driver']) {
                                case 'Local':
                                    $service = new \TYPO3\CMS\DigitalAssetManagement\Service\LocalFileSystemService($fileStorage);
                                    //$service = new \TYPO3\CMS\DigitalAssetManagement\Service\MockJsonFileSystemService($fileStorage);
                                    break;
                            }
                        }
                        if ($service) {
                            return ['files' => $service->listFiles($path), 'folders' => $service->listFolder($path)];
                        }
                    }
                }
            } else { //if (count($fileStorages) > 1) {
                $folders = [];
                foreach ($fileStorages as $fileStorage) {
                    $storageInfo = $fileStorage->getStorageRecord();
                    $folder = [];
                    $folder['identifier'] = $storageInfo['uid'] . ':';
                    $folder['name'] = $storageInfo['name'];
                    $folder['storage_name'] = $storageInfo['name'];
                    $folder['storage'] = $storageInfo['uid'];
                    $folder['type'] = 'storage';
                    $folders[] = $folder;
                }
                return ['files' => [], 'folders' => $folders];
            }
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
