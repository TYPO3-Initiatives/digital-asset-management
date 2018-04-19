<?php
declare(strict_types = 1);
namespace TYPO3\CMS\DigitalAssetManagement\Utility;

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


/**
 *
 *
 * @package TYPO3\CMS\DigitalAssetManagement\Utility
 */

use TYPO3\CMS\Core\Database\Connection;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Utility\GeneralUtility;


class DigitalAssetManagementFileService
{
    /**
    * Get the number of file references or '-' if resource is not a file
    * @param $file
    * return count FileReference
    */
    public static function countFileReference($resource) {
        if($resource instanceof File ) {
            $queryBuilder = GeneralUtility::makeInstance(ConnectionPool::class)->getQueryBuilderForTable('sys_file');
            $statement = $queryBuilder
                ->count('*')
                ->from('sys_file')
                ->join(
                    'sys_file',
                    'sys_file_reference',
                    'ref',
                    $queryBuilder->expr()->eq('sys_file.uid','ref.uid_local')
                )
                ->where(
                    $queryBuilder->expr()->eq('sys_file.identifier', $queryBuilder->createNamedParameter($resource->getIdentifier()) )
                )
                ->execute()
                ->fetchColumn();

            return $statement;
        } else {
            return '-';
        }
   }
}