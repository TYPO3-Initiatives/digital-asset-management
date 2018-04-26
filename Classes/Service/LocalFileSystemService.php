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

use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\Folder;

class LocalFileSystemService extends AbstractFileSystemService implements FileSystemInterface
{
    /**
     * @param string $path
     * @return string
     */
    public function read($path): string
    {
        if (is_file($path)) {
            return file_get_contents($path);
        }
    }

    /**
     * @param string $path
     * @param string $content
     * @return bool success
     */
    public function write($path, $content): bool
    {
        $parts = explode('/', $path);
        $file = array_pop($parts);
        $dir = '';
        foreach($parts as $part) {
            if (!is_dir($dir .= "/$part")) {
                mkdir($dir);
            }
        }
        return (file_put_contents("$dir/$file", $content) !== false);
    }

    /**
     * checks if file exists
     * folders are created implicit
     *
     * @param string $path
     * @return bool success
     */
    public function exists($path): bool
    {
        return is_file($path) || is_dir($path);
    }

    /**
     * @param string $path
     * @return bool success
     */
    public function delete($path): bool
    {
        if(is_file($path)){
            // @todo: uncomment next line, but do not really delete files for now
            // unlink($path);
        }
        return !$this->exists($path);
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
        $result['filename'] = pathinfo($path,PATHINFO_FILENAME);
        $result['filesize'] = filesize($path);
        $result['filetime'] = filemtime($path);
        $result['mimetype'] = mime_content_type($path);
        // todo: add supported mime types & special keys
        if (in_array($result['mimetype'], ['image/jpeg'])) {
            $fp = fopen($path, 'rb');
            if ($fp) {
                $headers = exif_read_data($fp);
                foreach ($keys as $key) {
                    switch ($key) {
                        case 'height':
                            $result['height'] = $headers['COMPUTED']['Height'];
                            break;
                        case 'width':
                            $result['width'] = $headers['COMPUTED']['Width'];
                            break;
                    }
                }
            }
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
     * @return array[string]
     */
    public function listFiles($path): array
    {
        $fileArray = [];
        if ($this->storage) {
            $storage = $this->storage;
            if( $path === '/') {
                $startingFolder = $storage->getRootLevelFolder();
            } else {
                $startingFolder = $storage->getFolder($path);
            }
            /** @var File[] $files */
            $files = $storage->getFilesInFolder($startingFolder);
            foreach ($files as $file){
                $fileArray[] = $file->getName();
            }
        } else {
            throw new \RuntimeException('Could not find any storage to be displayed.', 1349276894);
        }
        return $fileArray;
    }

    /**
     * @param $path
     * @return array
     */
    public function listFilesWithMetadata($path): array
    {
        $fileArray = [];
        if ($this->storage) {
            $storage = $this->storage;
            if( $path === '/') {
                $startingFolder = $storage->getRootLevelFolder();
            } else {
                $startingFolder = $storage->getFolder($path);
            }
            /** @var File[] $files */
            $files = $storage->getFilesInFolder($startingFolder);
            foreach ($files as $file){
                $file = $file->toArray();
                $file['storageName'] = $storage->getName();
                $file['storageUid'] = $storage->getUid();
                $fileArray[] = $file;
            }
        } else {
            throw new \RuntimeException('Could not find any storage to be displayed.', 1349276894);
        }
        return $fileArray;
    }

    /**
     * @param string $path
     * @return array of strings
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
                $folderArray[] = $folder->getName();
            }
        } else {
            throw new \RuntimeException('Could not find any storage to be displayed.', 1349276894);
        }
        return $folderArray;
    }

    /**
     * @param $path
     * @return array
     */
    public function listFolderWithMetadata($path): array
    {
        $newFolder = [];
        if ($this->storage) {
            $storage = $this->storage;
            if( $path === '/') {
                $startingFolder = $storage->getRootLevelFolder();
            } else {
                $startingFolder = $storage->getFolder($path);
            }
            /** @var Folder[] $folders */
            $folders = $storage->getFoldersInFolder($startingFolder);
            $folderArray = [];
            foreach ($folders as $folder){
                $folder = (array)$folder;
                foreach ($folder as $key => $value) {
                    $newFolder[preg_replace('/[^a-zA-Z]/', '', $key)] = $value;
                }
                $newFolder['storageName'] = $storage->getName();
                $newFolder['storageUid'] = $storage->getUid();
                $folderArray[] = $newFolder;
            }
        } else {
            throw new \RuntimeException('Could not find any storage to be displayed.', 1349276894);
        }
        return $folderArray;
    }
}
