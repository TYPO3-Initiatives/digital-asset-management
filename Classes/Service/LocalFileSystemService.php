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
    protected function readFile($path): string
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
    protected function writeFile($path, $content): bool
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
    protected function existsFile($path): bool
    {
        return is_file($path) || is_dir($path);
    }

    /**
     * @param string $path
     * @return bool success
     */
    protected function deleteFile($path): bool
    {
        if(is_file($path)){
            // @todo: uncomment next line, but do not really delete files for now
            // unlink($path);
        }
        return !$this->existsFile($path);
    }

    /**
     * @param string $path
     * @return array
     */
    public function infoFile($path): array
    {
        $result = [];
        $result['name'] = pathinfo($path,PATHINFO_FILENAME);
        $result['size'] = filesize($path);
        $result['modification_date'] = filemtime($path);
        $result['mime_type'] = mime_content_type($path);
        return $result;
    }

    /**
     * get file metadata by key such as
     *  modification-timestamp, filename, size, mimetype
     *
     * @param string $path
     * @param string|array $keys
     * @return array
     */
    protected function getMetadataFile($path, $keys): array
    {
        $result = [];
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

}
