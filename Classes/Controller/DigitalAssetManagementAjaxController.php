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
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Resource\ResourceStorage;

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
        foreach ($params as $key => $param){
            if (strpos($key, 'get') === 0) {
                $func = $key.'Action';
                if (is_callable([$this, $func])) {
                    $result['actionparam'] = $param;
                    $result[$key] = call_user_func(array(DigitalAssetManagementAjaxController::class, $func), $param);
                }
            }
        }
//        if (isset($params['getContent'])){
//            $result['content'] = $this->getContentAction($params['getContent']);
//        }
//        if (isset($params['another action'])){
//            $result['another'] = "blabla";
//        }
        $result['request'] = \TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($request,null, 8, false, true,true);
        $result['response'] = \TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($response,null, 8, false, true,true);
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
    protected function getContentAction($path = "/"){
        $backendUser = $this->getBackendUser();
        // Get all storage objects
        /** @var ResourceStorage[] $fileStorages */
        $fileStorages = $backendUser->getFileStorages();
        if (is_array($fileStorages)){
            //If there is only one storage show content of that as entrypoint
            if (count($fileStorages) === 1) {
                /** @var ResourceStorage $fileStorage  */
                $fileStorage = reset($fileStorages);
                if ($fileStorage) {
                    return $this->getFolderContent($fileStorage, $path);
                }
            } else if (count($fileStorages) > 1) {
                return 'todo support multiple file storages';
            }
        }
    }

    /**
     * Return first level of files/folders/storages as an assoziative array
     * this can be:
     *  if there is only one storage the content of that storage is returned
     *  if there are more than one storages the storages are returned
     *
     * @param ResourceStorage $fileStorage
     * @param string $identifier
     * @return array
     * @throws \RuntimeException
     */
    protected function getFolderContent($fileStorage, $identifier){
        if ($fileStorage) {
            if( $identifier === '/') {
                $startingFolder = $fileStorage->getRootLevelFolder();
            } else {
                $startingFolder = $fileStorage->getFolder($identifier);
            }
//            $fileIdentifiers = $fileStorage->getFileIdentifiersInFolder($startingFolder->getIdentifier());
//            $folderIdentifiers = $fileStorage->getFolderIdentifiersInFolder($startingFolder->getIdentifier());
            /** @var File[] $files */
            $files = $fileStorage->getFilesInFolder($startingFolder);
            /** @var Folder[] $folders */
            $folders = $fileStorage->getFoldersInFolder($startingFolder);
            $folderArray = [];
            foreach ($folders as $folder){
                $newFolder = [];
                $folder = (array)$folder;
                foreach ($folder as $key => $value) {
                    $newFolder[preg_replace('/[^a-zA-Z]/', '', $key)] = $value;
                }
                $newFolder['storageName'] = $fileStorage->getName();
                $newFolder['storageUid'] = $fileStorage->getUid();
                $folderArray[] = $newFolder;
            }
            $fileArray = [];
            foreach ($files as $file){
                $file = $file->toArray();
                $file['storageName'] = $fileStorage->getName();
                $file['storageUid'] = $fileStorage->getUid();
                $fileArray[] = $file;
            }
            $fileStorage = (array)$fileStorage;
        } else {
            throw new \RuntimeException('Could not find any storage to be displayed.', 1349276894);
        }
         return ['files' => $fileArray, 'folders' => $folderArray, 'storage' => $fileStorage];
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