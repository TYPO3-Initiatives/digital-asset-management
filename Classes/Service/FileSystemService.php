<?php
declare(strict_types = 1);

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

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
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Resource\ResourceStorage;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class FileSystemService implements FileSystemInterface
{
    /**
     * @var ResourceStorage $storage
     */
    protected $storage = null;

    /**
     * read file content
     *
     * @param string $identifier
     * @return string
     */
    public function read($identifier): string
    {
        $result = '';
        if ($this->storage) {
            /** @var File $file */
            $file = $this->storage->getFile($identifier);
            $result = $file->getContents(); // @todo: check method
        }
        return $result;
    }

    /**
     * write file content
     *
     * @param string $identifier
     * @param string $content
     * @return bool success
     */
    public function write($identifier, $content): bool
    {
        $result = false;
        if ($this->storage) {
            /** @var File $file */
            $file = $this->storage->getFile($identifier);
            $file = $file->setContents($content); // @todo: check method
            $result = ($file) ? true : false;
        }
        return $result;
    }

    /**
     * checks if file exists
     *
     * @param string $identifier
     * @return bool success
     */
    public function exists($identifier): bool
    {
        $result = false;
        if ($this->storage) {
            /** @var File $file */
            $file = $this->storage->getFile($identifier);
            $result = $file->isIndexed(); // @todo: check method
        }
        return $result;
    }

    /**
     * delete file(s) within the same storage
     *
     * @param array $identifier
     * @return array
     */
    public function delete($identifier): array
    {
        $result = [];
        if ($this->storage) {
            if (!is_array($identifier)) {
                $identifier = [$identifier];
            }
            $identifierCount = count($identifier);
            for ($i = 0; $i < $identifierCount; $i++) {
                /** @var File $file */
                $file = $this->storage->getFile($identifier[$i]);
                $result[] = [
                    'identifier' => $identifier[$i],
                    'status' => ($file->delete() ? 'success' : 'failure')
                ];
            }
        }
        return $result;
    }

    /**
     * rename a single file
     *
     * @param string $identifier
     * @param string $newName
     * @return array
     */
    public function rename($identifier, $newName): array
    {
        $result = [];
        if ($this->storage) {
            /** @var File $file */
            $file = $this->storage->getFile($identifier);
            $file = $file->rename($newName); // @todo: check method
            $result[] = [
                'identifier' => $identifier,
                'status' => ($file->getName() == $newName ? 'success' : 'failure')
            ];
        }
        return $result;
    }

    /**
     * move file(s) within the same storage
     *
     * @param string|array $identifier
     * @param string $newFolderIdentifier
     * @return array
     */
    public function move($identifier, $newFolderIdentifier): array
    {
        $result = [];
        if ($this->storage) {
            if (!is_array($identifier)) {
                $identifier = [$identifier];
            }
            $identifierCount = count($identifier);
            for ($i = 0; $i < $identifierCount; $i++) {
                /** @var File $file */
                $file = $this->storage->moveFile($identifier[$i], $newFolderIdentifier);
                $result[] = [
                    'identifier' => $identifier[$i],
                    'status' => ($file->getParentFolder() == $newFolderIdentifier ? 'success' : 'failure')
                ];
            }
        }
        return $result;
    }

    /**
     * get file metadata
     *
     * @param string $identifier
     * @return array
     */
    private function getMetadata($identifier): array
    {
        $colums = $GLOBALS['TCA']['sys_file_metadata']['columns'];
        $fields = [];
        foreach ($colums as $col => $value) {
            if (!in_array($col, ['fileinfo', 'l10n_diffsource', 'l10n_parent', 'sys_language_uid', 't3ver_label'])) {
                $fields[] = 'sys_file_metadata.' . $col;
            }
        }
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('sys_file_metadata');
        $statement = $queryBuilder
            ->select(...$fields)
            ->from('sys_file_metadata')
            ->join(
                'sys_file_metadata',
                'sys_file',
                'file',
                $queryBuilder->expr()->eq('file.uid', 'sys_file_metadata.file')
            )
            ->where(
                $queryBuilder->expr()->eq('file.identifier', $queryBuilder->createNamedParameter($identifier))
            )
            ->execute()
            ->fetch();
        if (!$statement) {
            $statement = [];
        }
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
        $colums = $GLOBALS['TCA']['sys_file_reference']['columns'];
        $fields = [];
        foreach ($colums as $col => $value) {
            if (!in_array($col, ['l10n_diffsource', 'l10n_parent', 'sys_language_uid', 't3ver_label'])) {
                $fields[] = 'sys_file_reference.' . $col;
            }
        }
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('sys_file_reference');
        $statement = $queryBuilder
            ->select(...$fields)
            ->from('sys_file_reference')
            ->join(
                'sys_file_reference',
                'sys_file',
                'file',
                $queryBuilder->expr()->eq('file.uid', 'sys_file_reference.uid_local')
            )
            ->where(
                $queryBuilder->expr()->eq('file.identifier', $queryBuilder->createNamedParameter($identifier))
            )
            ->execute()
            ->fetchAll();
        if (!$statement) {
            $statement = [];
        }
        return $statement;
    }

    /**
     * get file info
     *
     * @param string $identifier
     * @return array
     */
    public function info($identifier): array
    {
        $result = [];
        if ($this->storage) {
            /** @var File $file */
            $file = $this->storage->getFile($identifier);
            $result = $file->toArray();
            $result['meta'] = $this->getMetadata($file->getIdentifier());
            $result['references'] = $this->getReferences($file->getIdentifier());
        }
        return $result;
    }

    /**
     * returns an array of files in a defined path
     *
     * @param Folder $folder
     * @param bool $withMetadata
     * @param int $start
     * @param int $maxNumberOfItems
     * @param string $sort Property name used to sort the items.
     *                     Among them may be: '' (empty, no sorting), name,
     *                     fileext, size, tstamp and rw.
     *                     If a driver does not support the given property, it
     *                     should fall back to "name".
     * @param bool $sortRev TRUE to indicate reverse sorting (last to first)
     * @throws \RuntimeException
     * @return array
     */
    public function listFiles(Folder $folder, $withMetadata = false, $start = 0, $maxNumberOfItems = 0, $sort = '', $sortRev = false): array
    {
        $fileArray = [];
        if ($this->storage) {
            /** @var File[] $files */
            $files = $this->storage->getFilesInFolder($folder, $start, $maxNumberOfItems, true, false, $sort, $sortRev);
            foreach ($files as $file) {
                $fileArr = $file->toArray();
                $newFile = [];
                foreach ($fileArr as $key => $value) {
                    if ($withMetadata || in_array($key, ['uid', 'name', 'identifier', 'storage', 'url', 'mimetype', 'size', 'permissions', 'modification_date'])) {
                        if ($key === 'identifier') {
                            $newFile[$key] = $this->storage->getUid() . ':' . $value;
                        } else {
                            $newFile[$key] = $value;
                        }
                    }
                }
                $newFile['storage_name'] = $this->storage->getName();
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
     * returns an array of folders in a defined path
     *
     * @param Folder $folder
     * @param string $sort Property name used to sort the items.
     *                     Among them may be: '' (empty, no sorting), name,
     *                     fileext, size, tstamp and rw.
     *                     If a driver does not support the given property, it
     *                     should fall back to "name".
     * @param bool $sortRev TRUE to indicate reverse sorting (last to first)
     *
     * @throws \RuntimeException
     * @return array
     */
    public function listFolder(Folder $folder, $sort = '', $sortRev = false): array
    {
        $folderArray = [];
        if ($this->storage) {
            /** @var Folder[] $folders */
            $folders = $this->storage->getFoldersInFolder($folder, 0, 0, true, false, $sort, $sortRev);
            foreach ($folders as $item) {
                $item = (array)$item;
                $newFolder = [];
                foreach ($item as $key => $value) {
                    // replace protected /u0000 in key
                    $newKey = substr($key, 3);
                    if ($newKey === 'identifier') {
                        $newFolder[$newKey] = $this->storage->getUid() . ':' . $value;
                    } elseif ($newKey === 'name') {
                        $newFolder[$newKey] = $value;
                    }
                }
                $newFolder['storage_name'] = $this->storage->getName();
                $newFolder['storage'] = $this->storage->getUid();
                $newFolder['type'] = 'folder';
                $folderArray[] = $newFolder;
            }
        } else {
            throw new \RuntimeException('Could not find any storage to be displayed.', 1349276894);
        }
        return $folderArray;
    }

    /**
     * returns an array of files in a current path
     *
     * @param string $searchWord
     */
    public function searchFiles($searchWord = '') : array
    {
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('sys_file');
        $statement = $queryBuilder->select('*')
            ->from('sys_file')
            ->join(
                'sys_file',
                'sys_file_metadata',
                'file_metadata',
                $queryBuilder->expr()->eq('sys_file.uid', 'file_metadata.file')
            )
            ->where($queryBuilder->expr()->like('sys_file.name', $queryBuilder->createNamedParameter('%'. $queryBuilder->escapeLikeWildcards($searchWord).'%') ))
            ->execute();

        $files = array();
        while ($row = $statement->fetch()) {
            $file['identifier'] = $this->storage->getUid().':'.$row[identifier];
            $file['mimetype'] = $row['mime_type'];
            $file['size'] = $row['size'];
            $file['name'] = $row['name'];
            $file['modification_date'] = $row['modification_date'];
            $files[] = $file;
        }

        return $files;
    }
    

    /**
     * AbstractFileSystemService constructor.
     * @param ResourceStorage $storage
     */
    public function __construct($storage)
    {
        $this->storage = $storage;
    }
}
