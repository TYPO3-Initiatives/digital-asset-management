<?php
declare(strict_types = 1);
namespace TYPO3\CMS\DigitalAssetManagement\Service;

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

use TYPO3\CMS\Core\Resource\ResourceStorage;
use TYPO3\CMS\Core\Resource\File;

abstract class AbstractFileSystemService implements FileSystemInterface
{
    /**
     * @param string $path
     * @return string
     */
    abstract protected function readFile($path): string;

    /**
     * @param string $path
     * @param string $content
     * @return bool success
     */
    abstract protected function writeFile($path, $content): bool;

    /**
     * @param string $path
     * @return bool success
     */
    abstract protected function existsFile($path): bool;

    /**
     * @param string $path
     * @return bool success
     */
    abstract protected function deleteFile($path): bool;

    /**
     * @param string $path
     * @return array
     */
    abstract protected function infoFile($path): array;

    /**
     * @param string $path
     * @return string
     */
    public function read($path): string
    {
        if (true) { // @todo: check sys_file
            return ($this->readFile($path));
        } else {
            return '';
        }
    }

    /**
     * @param string $path
     * @param string $content
     * @return bool success
     */
    public function write($path, $content): bool
    {
        if ($this->writeFile($path, $content)) {
            // @todo: update sys_file
        }
    }

    /**
     * @param string $path
     * @return bool success
     */
    public function exists($path): bool
    {
        // @todo: check sys_file
        return ($this->existsFile($path));
    }

    /**
     * @param string $path
     * @return bool success
     */
    public function delete($path): bool
    {
        if($this->deleteFile($path)){
            // @todo: delete from sys_file
        }
        return !$this->exists($path);
    }

    /**
     * @param string $path
     * @return array
     */
    public function info($path): array
    {
        if ($this->storage) {
            $storage = $this->storage;
            // $file returns a TYPO3\CMS\Core\Resource\File object
            $file = $storage->getFile($path);
            return $file->toArray();
        }
    }

    /**
     * get file metadata by key such as
     *  modification-timestamp, filename, size, mimetype
     *
     * @param string $path
     * @param string|array $keys
     * @return array
     */
    public function getMetadata($path, $keys): array
    {
        $result = [];
        // @todo: get from sys_file, else
        if (method_exists($this, 'getMetadataFile')) {
            $arr = $this->getMetadataFile();
            $result = array_merge($result, $arr);
        }
        return $result;
    }

    /**
     * array of files/folders/storages as an assoziative array
     * this can be:
     *  if there is only one storage the content of that storage is returned
     *  if there are more than one storages the storages are returned
     *
     * @param string $path
     * @param bool $withMetadata
     * @return array
     */
    public function listFiles($path, $withMetadata = false): array
    {
        $fileArray = [];
        if ($this->storage) {
            $storage = $this->storage;
            if( $path === '/') {
                // respect file mounts
                $startingFolder = $storage->getRootLevelFolder();
            } else {
                $startingFolder = $storage->getFolder($path);
            }
            /** @var File[] $files */
            $files = $storage->getFilesInFolder($startingFolder);
            foreach ($files as $file){
                $file = $file->toArray();
                $newFile = [];
                foreach ($file as $key => $value) {
                    if ($withMetadata || in_array($key, ['uid', 'name', 'identifier', 'url', 'mimetype', 'size', 'permissions', 'modification_date'] )) {
                        $newFile[$key] = $value;
                    }
                }
                //$newFile['storageName'] = $storage->getName();
                //$newFile['storageUid'] = $storage->getUid();
                if ($withMetadata) {
                    // todo: get the real metadata
                }
                $fileArray[] = $newFile;
            }
        } else {
            throw new \RuntimeException('Could not find any storage to be displayed.', 1349276894);
        }
        return $fileArray;
    }

    /**
     * @param string $path
     * @return array
     */
    public function listFolder($path): array
    {
        $folderArray = [];
        if ($this->storage) {
            $storage = $this->storage;
            if( $path === '/') {
                $startingFolder = $storage->getRootLevelFolder();
            } else {
                $startingFolder = $storage->getFolder($path);
            }
            /** @var Folder[] $folders */
            $folders = $storage->getFoldersInFolder($startingFolder);
            foreach ($folders as $folder){
                $folder = (array)$folder;
                $newFolder = [];
                foreach ($folder as $key => $value) {
                    // replace protected /u0000 in key
                    $newKey = substr($key, 3);
                    if (in_array($newKey, ['name', 'identifier'])) {
                        $newFolder[$newKey] = $value;
                    }
                }
                $folderArray[] = $newFolder;
            }
        } else {
            throw new \RuntimeException('Could not find any storage to be displayed.', 1349276894);
        }
        return $folderArray;
    }

    /**
     * @var ResourceStorage $storage
     */
    protected $storage = null;

    /**
     * @var array
     */
    protected $storageInfo = null;

    /**
     * AbstractFileSystemService constructor.
     * @param ResourceStorage $storage
     */
    public function __construct($storage)
    {
        $this->storage = $storage;
        $this->storageInfo = $this->storage->getStorageRecord();
    }
}
