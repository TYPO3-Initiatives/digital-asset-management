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
use TYPO3\CMS\Core\Resource\ResourceStorage;
use TYPO3\CMS\Core\Database\ConnectionPool;
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
     * @param string|array $identifier
     * @return array
     */
    public function delete($identifier): array
    {
        $result = [];
        if ($this->storage) {
            if (is_array($identifier)) {
                for ($i = 0; $i < count($identifier); $i++) {
                    /** @var File $file */
                    $file = $this->storage->getFile($identifier[$i]);
                    $result[] = [
                        'identifier' => $identifier[$i],
                        'status' => ($file->delete() ? 'success' : 'failure')
                    ];
                }
            } else {
                /** @var File $file */
                $file = $this->storage->getFile($identifier);
                $result[] = [
                    'identifier' => $identifier,
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
            if (is_array($identifier)) {
                for ($i = 0; $i < count($identifier); $i++) {
                    /** @var File $file */
                    $file = $this->storage->moveFile($identifier[$i], $newFolderIdentifier);
                    $result[] = [
                        'identifier' => $identifier[$i],
                        'status' => ($file->getParentFolder() == $newFolderIdentifier ? 'success' : 'failure')
                    ];
                }
                $result = true;
            } else {
                /** @var File $file */
                $file = $this->storage->moveFile($identifier, $newFolderIdentifier);
                $result[] = [
                    'identifier' => $identifier,
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
            foreach ($files as $file){
                $fileArr = $file->toArray();
                $newFile = [];
                foreach ($fileArr as $key => $value) {
                    if ($withMetadata || in_array($key, ['uid', 'name', 'identifier', 'storage', 'url', 'mimetype', 'size', 'permissions', 'modification_date'] )) {
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
    public function listFolder(Folder $folder,  $sort = '', $sortRev = false): array
    {
        $folderArray = [];
        if ($this->storage) {
            /** @var Folder[] $folders */
            $folders = $this->storage->getFoldersInFolder($folder, 0, 0, true,  false, $sort, $sortRev);
            foreach ($folders as $item){
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
     * AbstractFileSystemService constructor.
     * @param ResourceStorage $storage
     */
    public function __construct($storage)
    {
        $this->storage = $storage;
    }
}
