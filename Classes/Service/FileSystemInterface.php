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
     * @param string $path
     * @return array
     */
    public function info($path): array;

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
    public function listFolder($path, $start = 0, $maxNumberOfItems = 0, $sort = '', $sortRev = false): array;

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
