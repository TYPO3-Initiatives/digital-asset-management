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
        $colums = $GLOBALS['TCA']['sys_file_metadata']['columns'];
        $fields = [];
        foreach ($colums as $col => $value) {
            if (!in_array($col, ['fileinfo', 'l10n_diffsource', 'l10n_parent', 'sys_language_uid', 't3ver_label'] )) {
                $fields[] = 'sys_file_metadata.' . $col;
            }
        }
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('sys_file_metadata');
        $statement = $queryBuilder
            ->select(...$fields)
            ->from('sys_file_metadata')
            ->join('sys_file_metadata', 'sys_file', 'file',
                $queryBuilder->expr()->eq('file.uid','sys_file_metadata.file')
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
            if (!in_array($col, ['l10n_diffsource', 'l10n_parent', 'sys_language_uid', 't3ver_label'] )) {
                $fields[] = 'sys_file_reference.' . $col;
            }
        }
        $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('sys_file_reference');
        $statement = $queryBuilder
            ->select(...$fields)
            ->from('sys_file_reference')
            ->join('sys_file_reference', 'sys_file', 'file',
                $queryBuilder->expr()->eq('file.uid','sys_file_reference.uid_local')
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
     * get file thumbnail
     *
     * @param string $path
     * @param bool $base64
     * @param int $width
     * @param int $height
     * @param string $method crop, fit, adapt
     * @param int $quality // the quality of any generated JPGs on a scale of 0 to 100
     * @param bool $sharpen  // Shrinking images can blur details, perform a sharpen on re-scaled images?
     * @return string
     */
    public function thumbnail($path, $base64 = false, $width = null, $height = 200, $method = 'fit', $quality = 75, $sharpen = false): string
    {
        if (!file_exists($path)) return '';
        $result = '';
        // Check the image dimensions
        $dimensions = getimagesize($path);
        $source_width = $dimensions[0];
        $source_height = $dimensions[1];
        $mime = $dimensions['mime'];
        if (!in_array($mime, ['image/png', 'image/gif', 'image/jpeg', 'image/jpg'] )) return '';
        $source_ratio = $source_width / $source_height;
        $dst_width = $width;
        $dst_height = $height;
        $new_width = $dst_width;
        $new_height = $dst_height;
        $offset_x = 0;
        $offset_y = 0;
        if ($method == 'crop') {
            if (!(($source_width <= $dst_width) && ($source_height <= $dst_height))) {
                $dst_ratio = $dst_width / $dst_height;
                if ($source_ratio > $dst_ratio) {
                    $new_width = $dst_height * $source_ratio;
                } else {
                    $new_height = $dst_width / $source_ratio;
                }
                $offset_x = (int) floor((($new_width - $dst_width) / 2) * $source_width / $new_width);
                $offset_y = (int) round((($new_height - $dst_height) / 2) * $source_height / $new_height);
            } else {
                return '';
            }
        } elseif ($method == 'fit') {
            if (empty($dst_width)) {
                $dst_width = $source_ratio * $dst_height;
            }
            if (empty($dst_height)) {
                $dst_height = $dst_width / $source_ratio;
            }
            $dst_ratio = $dst_width / $dst_height;
            if ($source_ratio < $dst_ratio) {
                $dst_width = $dst_height * $source_ratio;
                $new_width = $dst_width;
                $new_height = $dst_height;
            } else {
                $dst_height = $dst_width / $source_ratio;
                $new_height = $dst_height;#
                $new_width = $dst_width;
            }
        } elseif ($method == 'adapt') {
            if (!(($source_width <= $dst_width) || ($source_height <= $dst_height))) {
                if ($source_ratio < 1) {
                    $dst_height = $dst_width / $source_ratio;
                    $new_height = $dst_height;
                } else {
                    $dst_width = $dst_height * $source_ratio;
                    $new_width = $dst_width;
                }
            } else {
                return '';
            }
        }
        $new_width = (int) ceil($new_width);
        $new_height = (int) ceil($new_height);
        $dst_width = (int) ceil($dst_width);
        $dst_height = (int) ceil($dst_height);
        $dst = ImageCreateTrueColor($dst_width, $dst_height);
        $whiteBackground = imagecolorallocate($dst, 255, 255, 255);
        imagefill($dst,0,0,$whiteBackground); // fill the background with white
        switch ($mime) {
            case 'image/png':
                $src = ImageCreateFromPng($path); // original image
                imagealphablending($dst, false);
                imagesavealpha($dst, true);
                $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
                imagefilledrectangle($dst, 0, 0, $new_width, $new_height, $transparent);
                break;
            case 'image/gif':
                $src = ImageCreateFromGif($path); // original image
                break;
            case 'image/jpg':
            case 'image/jpeg':
            case 'image/djpeg':
                $src = ImageCreateFromJpeg($path); // original image
                ImageInterlace($dst, 1); // Enable interlancing (progressive JPG, smaller size file)
                break;
        }
        ImageCopyResampled($dst, $src, 0, 0, $offset_x, $offset_y, $new_width, $new_height, $source_width, $source_height); // do the resize in memory
        ImageDestroy($src);
        // sharpen the image?
        // NOTE: requires PHP compiled with the bundled version of GD (see http://php.net/manual/en/function.imageconvolution.php)
        if ($sharpen == true && function_exists('imageconvolution')) {
            $intFinal = $new_width * (750.0 / $source_width);
            $intA = 52;
            $intB = -0.27810650887573124;
            $intC = .00047337278106508946;
            $intRes = $intA + $intB * $intFinal + $intC * $intFinal * $intFinal;
            $intSharpness =  max(round($intRes), 0);
            $arrMatrix = array(
                array(-1, -2, -1),
                array(-2, $intSharpness + 12, -2),
                array(-1, -2, -1)
            );
            imageconvolution($dst, $arrMatrix, $intSharpness, 0);
        }
        // Enable output buffering
        ob_start();
        switch ($mime) {
            case 'image/png':
                $ok = ImagePng($dst, null, 9);
                break;
            case 'image/gif':
                $ok = ImageGif($dst);
                break;
            default:
                $ok = ImageJpeg($dst, null, $quality);
                break;
        }
        if ($ok) {
            // Capture the output
            $result = ob_get_clean();
            if ($base64) {
                $result = 'data:' . $mime . ';base64,' . base64_encode($result);
            }
        }
        // Clear the output buffer
        ob_end_clean();
        ImageDestroy($dst);
        return $result;
    }

    /**
     * returns an array of files in a defined path
     *
     * @param string $path
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
    public function listFiles($path, $withMetadata = false, $start = 0, $maxNumberOfItems = 0, $sort = '', $sortRev = false): array
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
            $files = $storage->getFilesInFolder($startingFolder, $start, $maxNumberOfItems, true, false, $sort, $sortRev);
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
     * returns an array of folders in a defined path
     *
     * @param string $path
     * @param int $start
     * @param int $maxNumberOfItems
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
    public function listFolder($path, $start = 0, $maxNumberOfItems = 0, $sort = '', $sortRev = false): array
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
            $folders = $storage->getFoldersInFolder($startingFolder, $start, $maxNumberOfItems, true,  false, $sort, $sortRev);
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
