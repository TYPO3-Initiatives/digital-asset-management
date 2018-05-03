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
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;

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
        if ($this->deleteFile($path)) {
            // @todo: delete from sys_file
        }
        return !$this->exists($path);
    }

    /**
     * get file metadata
     *
     * @param string $identifier
     * @return array
     */
    private function getMetadata($identifier): array
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('sys_file_metadata');
        $statement = $queryBuilder
            ->select('sys_file_metadata.title', 'sys_file_metadata.width', 'sys_file_metadata.height',
                     'sys_file_metadata.description', 'sys_file_metadata.alternative')
            ->from('sys_file_metadata')
            ->join('sys_file_metadata', 'sys_file', 'file',
                $queryBuilder->expr()->eq('file.uid','sys_file_metadata.file')
            )
            ->where(
                $queryBuilder->expr()->eq('file.identifier', $queryBuilder->createNamedParameter($identifier))
            )
            ->execute()
            ->fetch();
        return $statement;
    }

    /**
     * get entries where file is referenced
     *
     * @param string $identifier
     * @return array
     */
    private function getReferences($identifier): array
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('sys_file_reference');
        $statement = $queryBuilder
            ->select('sys_file_reference.title', 'sys_file_reference.tablenames AS table', 'sys_file_reference.uid',
                     'sys_file_reference.fieldname AS field', 'sorting_foreign AS sorting', 'sys_file_reference.pid')
            ->from('sys_file_reference')
            ->join('sys_file_reference', 'sys_file', 'file',
                $queryBuilder->expr()->eq('file.uid','sys_file_reference.uid_local')
            )
            ->where(
                $queryBuilder->expr()->eq('file.identifier', $queryBuilder->createNamedParameter($identifier))
            )
            ->execute()
            ->fetchAll();
        return $statement;
    }

    /**
     * get file info
     *
     * @param string $path
     * @return array
     */
    public function info($path): array
    {
        $result = [];
        if ($this->storage) {
            $storage = $this->storage;
            // $file returns a TYPO3\CMS\Core\Resource\File object
            $file = $storage->getFile($path);
            $result = $file->toArray();
            $result['meta'] = $this->getMetadata($file->getIdentifier());
            $result['references'] = $this->getReferences($file->getIdentifier());
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
     * @throws \RuntimeException
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
                $fileArr = $file->toArray();
                $newFile = [];
                foreach ($fileArr as $key => $value) {
                    if ($withMetadata || in_array($key, ['uid', 'name', 'identifier', 'storage', 'url', 'mimetype', 'size', 'permissions', 'modification_date'] )) {
                        if ($key === 'identifier') {
                            $newFile[$key] = $storage->getUid() . ':' . $value;
                        } else {
                            $newFile[$key] = $value;
                        }
                    }
                }
                $newFile['storage_name'] = $storage->getName();
                $newFile['type'] = 'file';
                if ($withMetadata) {
                    $newFile['meta'] = $this->getMetadata($file->getIdentifier());
                    $newFile['references'] = $this->getReferences($file->getIdentifier());
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
     * @throws \RuntimeException
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
                    if ($newKey === 'identifier') {
                        $newFolder[$newKey] = $storage->getUid() . ':' . $value;
                    } elseif ($newKey === 'name') {
                        $newFolder[$newKey] = $value;
                    }
                }
                $newFolder['storage_name'] = $storage->getName();
                $newFolder['storage'] = $storage->getUid();
                $newFolder['type'] = 'folder';
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
