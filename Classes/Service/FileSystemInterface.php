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
     * read file content
     *
     * @param string $identifier
     * @return string
     */
    public function read($identifier): string;

    /**
     * write file file content
     *
     * @param string $identifier
     * @param string $content
     * @return bool success
     */
    public function write($identifier, $content): bool;

    /**
     * checks if file exists
     *
     * @param string $identifier
     * @return bool success
     */
    public function exists($identifier): bool;

    /**
     * delete a single file
     *
     * @param string $identifier
     * @return bool success
     */
    public function delete($identifier): bool;

    /**
     * rename a single file
     *
     * @param string $identifier
     * @param string $newName
     * @return bool success
     */
    public function rename($identifier, $newName): bool;

    /**
     * @param string $identifier
     * @return array
     */
    public function info($identifier): array;

    /**
     * returns an array of folders in a defined path
     *
     * @param string $path
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
    public function listFolder($path, $sort = '', $sortRev = false): array;

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
    public function listFiles($path, $withMetadata = false, $start = 0, $maxNumberOfItems = 0, $sort = '', $sortRev = false): array;
}
