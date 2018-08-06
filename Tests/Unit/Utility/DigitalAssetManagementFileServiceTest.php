<?php
declare(strict_types = 1);
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

use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\DigitalAssetManagement\Utility\DigitalAssetManagementFileService;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

class DigitalAssetManagementFileServiceTest extends UnitTestCase
{
    /**
     * DataProvider
     * @return array
     */
    public function fileDataProvider(): array
    {
        return [
            'file of type gif' => [true, $this->getFileProphetByExtension('gif')],
            'file of type png' => [true, $this->getFileProphetByExtension('png')],
            'file of type jpg' => [true, $this->getFileProphetByExtension('jpg')],
            'file of type pdf' => [false, $this->getFileProphetByExtension('pdf')],
            'file of type zip' => [false, $this->getFileProphetByExtension('zip')],
            'file of type svg' => [true, $this->getFileProphetByExtension('svg')],
        ];
    }

    /**
     * @test
     * @dataProvider fileDataProvider
     * @param bool $expected
     * @param File $file
     */
    public function isImageReturnCorrectValue(bool $expected, File $file)
    {
        $this->assertSame($expected, DigitalAssetManagementFileService::isImage($file));
    }


    /**
     * @param $extension
     * @return object
     */
    protected function getFileProphetByExtension($extension)
    {
        $mapping = [
            'gif' => 'image/gif',
            'png' => 'image/png',
            'jpg' => 'image/jpg',
            'pdf' => 'application/pdf',
            'svg' => 'image/svg+xml',
            'zip' => 'application/zip',
        ];
        $fileProphet = $this->prophesize(File::class);
        $fileProphet->getMimeType()->willReturn($mapping[$extension]);
        return $fileProphet->reveal();
    }
}
