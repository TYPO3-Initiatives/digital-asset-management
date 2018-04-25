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

class MockJsonFileSystemService extends AbstractFileSystemService implements FileSystemInterface
{
    /**
     * @param string $path
     * @return string
     */
    public function read($path): string
    {
        // TODO: Implement read() method.
    }

    /**
     * @param string $path
     * @param string $content
     * @return bool success
     */
    public function write($path, $content): bool
    {
        // TODO: Implement write() method.
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
        // TODO: Implement exists() method.
    }

    /**
     * @param string $path
     * @return bool success
     */
    public function delete($path): bool
    {
        // TODO: Implement delete() method.
    }

    /**
     * get file metadata by key such as
     *  modification-timestamp, filename, size, mimetype
     *
     * @param string $path
     * @param string|array $keys
     * @return string
     */
    public function getMetadata($path, $keys): string
    {
        // TODO: Implement getMetadata() method.
    }

    /**
     * @param string $path
     * @return array of strings
     */
    public function listFiles($path): array
    {
        // TODO: Implement listFiles() method.
    }

    /**
     * @param $path
     * @return array
     */
    public function listFilesWithMetadata($path): array
    {
        $mock = [
            [
                "id" => "1:/MockBerlinBerlin2.JPG",
                "name" => "MockBerlinBerlin2.JPG",
                "extension" => "JPG",
                "type" => "2",
                "mimetype" => "image/jpeg",
                "size" => 519278,
                "url" => "fileadmin/Berlin2.JPG",
                "indexed" => true,
                "uid" => 84,
                "permissions" => [
                "read" => true,
                    "write" => true,
                    "delete" => true
                ],
                "checksum" => "6210d35b9db551812eb2e5af110f368e",
                "pid" => 0,
                "missing" => 0,
                "storage" => 1,
                "identifier" => "/Berlin2.JPG",
                "identifier_hash" => "d96508f2cdd87b6b087cdb16d6d2394e33b03a57",
                "mime_type" => "image/jpeg",
                "sha1" => "86ec0dbed8f1c71f3fc320349c2d9eaa6fee8c0c",
                "creation_date" => 1524042395,
                "modification_date" => 1468008600,
                "folder_hash" => "42099b4af021e53fd8fd4e056c2568d7c2e3ffa8",
                "atime" => 1524668466,
                "mtime" => 1468008600,
                "ctime" => 1524042395,
                "storageName" => "fileadmin/ (auto-created)",
                "storageUid" => 1
            ],
            [
                "id" => "1:/IMG_4701.JPG",
                "name" => "IMG_4701.JPG",
                "extension" => "JPG",
                "type" => "2",
                "mimetype" => "image/jpeg",
                "size" => 2248681,
                "url" => "fileadmin/IMG_4701.JPG",
                "indexed" => true,
                "uid" => 85,
                "permissions" => [
                "read" => true,
                    "write" => true,
                    "delete" => true
                ],
                "checksum" => "08ea49f08ee7552efec2c564691a29f4",
                "pid" => 0,
                "missing" => 0,
                "storage" => 1,
                "identifier" => "/IMG_4701.JPG",
                "identifier_hash" => "22f151cee8a571f48d011cb56f5a2126fcbcd526",
                "mime_type" => "image/jpeg",
                "sha1" => "ba03ac6ee99295143f66b5b613dab7ae46cc4f0c",
                "creation_date" => 1524042393,
                "modification_date" => 1292857731,
                "folder_hash" => "42099b4af021e53fd8fd4e056c2568d7c2e3ffa8",
                "atime" => 1524668466,
                "mtime" => 1292857731,
                "ctime" => 1524042393,
                "storageName" => "fileadmin/ (auto-created)",
                "storageUid" => 1
            ],
            [
                "id" => "1:/IMG_4705.JPG",
                "name" => "IMG_4705.JPG",
                "extension" => "JPG",
                "type" => "2",
                "mimetype" => "image/jpeg",
                "size" => 1745072,
                "url" => "fileadmin/IMG_4705.JPG",
                "indexed" => true,
                "uid" => 86,
                "permissions" => [
                "read" => true,
                    "write" => true,
                    "delete" => true
                ],
                "checksum" => "3e30ebb11db24f6e64ed8fa45648e3a5",
                "pid" => 0,
                "missing" => 0,
                "storage" => 1,
                "identifier" => "/IMG_4705.JPG",
                "identifier_hash" => "869cab646efe941488e3d4cc2e06fd179e49c395",
                "mime_type" => "image/jpeg",
                "sha1" => "e437f8a988a49fb462ca2c511dd45178bd862764",
                "creation_date" => 1524042393,
                "modification_date" => 1292857798,
                "folder_hash" => "42099b4af021e53fd8fd4e056c2568d7c2e3ffa8",
                "atime" => 1524668466,
                "mtime" => 1292857798,
                "ctime" => 1524042393,
                "storageName" => "fileadmin/ (auto-created)",
                "storageUid" => 1
            ],
            [
                "id" => "1:/index.php",
                "name" => "index.php",
                "extension" => "php",
                "type" => "1",
                "mimetype" => "text/x-php",
                "size" => 975,
                "url" => "fileadmin/index.php",
                "indexed" => true,
                "uid" => 83,
                "permissions" => [
                "read" => false,
                    "write" => false,
                    "delete" => false
                ],
                "checksum" => "feed3afed0cebb2a87e9657069d27b02",
                "pid" => 0,
                "missing" => 0,
                "storage" => 1,
                "identifier" => "/index.php",
                "identifier_hash" => "94fcba4f84335cd9108c542d573a95c1e4286bcf",
                "mime_type" => "text/x-php",
                "sha1" => "1198954e996bcfdca719bfc0f0fb76629d0225ca",
                "creation_date" => 1524039300,
                "modification_date" => 1523946896,
                "folder_hash" => "42099b4af021e53fd8fd4e056c2568d7c2e3ffa8",
                "atime" => 1524668466,
                "mtime" => 1523946896,
                "ctime" => 1524039300,
                "storageName" => "fileadmin/ (auto-created)",
                "storageUid" => 1
            ]
        ];
        return $mock;
    }

    /**
     * @param string $path
     * @return array of strings
     */
    public function listFolder($path): array
    {
        // TODO: Implement listFolder() method.
    }

    /**
     * @param $path
     * @return array
     */
    public function listFolderWithMetadata($path): array
    {
        $mock = [
            [
                "storage" => [],
                "identifier" => "/introduction/",
                "name" => "introduction",
                "fileAndFolderNameFilters" => [],
                "storageName" => "fileadmin/ (auto-created)",
                "storageUid" => 1
            ],
            [
                "storage" => [],
                "identifier" => "/lns-backend-login/",
                "name" => "lns-backend-login",
                "fileAndFolderNameFilters" => [],
                "storageName" => "fileadmin/ (auto-created)",
                "storageUid" => 1
            ],
            [
                "storage" => [],
                "identifier" => "/lns_distribution/",
                "name" => "lns_distribution",
                "fileAndFolderNameFilters" => [],
                "storageName" => "fileadmin/ (auto-created)",
                "storageUid" => 1
            ],
            [
                "storage" => [],
                "identifier" => "/styleguide/",
                "name" => "styleguide",
                "fileAndFolderNameFilters" => [],
                "storageName" => "fileadmin/ (auto-created)",
                "storageUid" => 1
            ],
            [
                "storage" => [],
                "identifier" => "/user_upload/",
                "name" => "user_upload",
                "fileAndFolderNameFilters" => [],
                "storageName" => "fileadmin/ (auto-created)",
                "storageUid" => 1
            ],
            [
                "storage" => [],
                "identifier" => "/_temp_/",
                "name" => "_temp_",
                "fileAndFolderNameFilters" => [],
                "storageName" => "fileadmin/ (auto-created)",
                "storageUid" => 1
            ]
        ];
        return $mock;
    }
}