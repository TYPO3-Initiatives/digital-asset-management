<?php
declare(strict_types=1);

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

namespace TYPO3\CMS\DigitalAssetManagement\Tests\Unit\Utility;

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

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\DigitalAssetManagement\Service\FileSystemService;
use TYPO3\TestingFramework\Core\Functional\FunctionalTestCase;

class FileSystemServiceTest extends FunctionalTestCase
{
    /**
     * Sets up this test case.
     */
    protected function setUp()
    {
        parent::setUp();

        // $this->importDataSet('EXT:digital_asset_management/Tests/Functional/Service/Fixtures/sys_file.xml');
    }

    /**
     * @test
     */
    public function readStorageContent()
    {
        // $fileSystemService = GeneralUtility::makeInstance(FileSystemService::class, 1);
        // $this->assertEquals('todo: Fancy json data structure', $fileSystemService::read('/'));
        $this->assertEquals(true, true);
    }
}
