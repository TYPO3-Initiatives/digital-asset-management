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

interface FileSystemInterface
{
    /**
     * @param string $path
     * @return string
     */
    public function read($path): string;

    /**
     * @param string $path
     * @param string $content
     * @return bool success
     */
    public function write($path, $content): bool;

    /**
     * checks if file exists
     * folders are created implicit
     *
     * @param string $path
     * @return bool success
     */
    public function exists($path): bool;

    /**
     * @param string $path
     * @return bool success
     */
    public function delete($path): bool;

    /**
     * get file metadata by key such as
     *  modification-timestamp, filename, size, mimetype
     *
     * @param string $path
     * @param string|array $keys
     * @return string
     */
    public function getMetadata($path, $keys): string;

    /**
     * @param string $path
     * @return array of strings
     */
    public function listFiles($path): array;

    /**
     * @param $path
     * @return array
     */
    public function listFilesWithMetadata($path): array;

    /**
     * @param string $path
     * @return array of strings
     */
    public function listFolder($path): array;

    /**
     * @param $path
     * @return array
     */
    public function listFolderWithMetadata($path): array;
}