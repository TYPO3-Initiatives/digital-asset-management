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

import * as $ from 'jquery';
import 'bootstrap';
// import Icons = require('TYPO3/CMS/Backend/Icons');

/**
 * Module: TYPO3/CMS/Backend/InfoWindow
 * @exports TYPO3/CMS/Backend/InfoWindow
 */
class DigitalAssetManagementActions {

	static folderPartial: string = '    <div class="card folder-action d-inline-block {mimetype}" data-method="getContent" ' +
		'data-parameter="{identifier}" style="width: 180px;">\n' +
		'   <div class="icon folder-icon icon-apps-filetree-folder"></div>' +
		'   <div class="card-body">\n' +
		'   <h5 class="card-title">{name}</h5>\n' +
		'    <p class="card-text">&nbsp;</p>\n' +
		'    </div>\n' +
		'  </div>\n';

	static filePartial: string = '<div class="card d-inline-block {mimetype}" style="width: 180px;">\n' +
		'    <img class="card-img-top" src="PlaceholderImage" data-src="{uid}" width="180" height="120"/>\n' +
		'    <div class="card-body">\n' +
		'    <h5 class="card-title">{name}</h5>\n' +
		'    <p class="card-text">{lll:dam.labels.filesize}: {size} <br>{lll:dam.labels.modified}: {modification_date}</p>\n' +
		'    <a href="#" class="btn btn-primary">Go somewhere</a>\n' +
		'    </div>\n' +
		'  </div>\n';

	static breadcrumbPartial: string = '<span class="folder-action" data-method="getContent" ' +
		'data-parameter="{pathsegment}">{label}</span>';

	/**
	 *
	 */
	public static init(): void {
		let my = DigitalAssetManagementActions;
		// @todo: why does only 'top.' work here?
		console.log(top.TYPO3.lang['localize.wizard.header']);
		// todo: how include own labels?
		console.log(top.TYPO3.lang['dam.labels.filesize']);
		console.log('DigitalAssetManagement.init');
		// my.renderBreadcrumb('/');
		my.request('getContent', '/');
		$('.digital-asset-management').on('click', '.folder-action', function(): void {
			let method = $(this).data('method');
			let parameter = $(this).data('parameter');
			console.log ( 'method: ' + method + ', par: ' + parameter);
			my.request(method, parameter);
		});
	}

	/**
	 *
	 * @param err any
	 */
	public static renderError(err: any): void {
		$('.errorlog').html(err.responseText);
	}

	/**
	 *
	 * @param data object
	 */
	public static renderContent(data: any): void {
		let my = DigitalAssetManagementActions;
		if (data && data.request) {
			$('.errorlog').html(data.request + data.response);
		}
		if (data.getContent && (data.getContent.files || data.getContent.folder)) {
			// Show folders and files
			let html = '';
			for (let i = 0; i < data.getContent.folders.length; i++) {
				const folder = data.getContent.folders[i];
				// Icons.getIcon('apps-filetree-folder', 'large').done( (iconMarkup: string): void => {
				// 	$('.folder-icon').html(iconMarkup);
				// });
				// @todo: use moment.js for date-formatting?!
				// @todo: how to get the thumbnail images without viewhelper?
				folder.mimetype = 'folder';
				html += my.replaceTemplateVars(my.folderPartial, folder);
			}
			$('.folders').html(html);
			html = '';
			// icon mimetypes-pdf
			for (let i = 0; i < data.getContent.files.length; i++) {
				const file = data.getContent.files[i];
				// @todo: use moment.js for date-formatting?!
				// @todo: how to get the thumbnail images without viewhelper?
				// Add mimetype as two classes: image/jpeg -> image jpeg
				file.mimetype = file.mimetype.replace('/', ' ');
				html += my.replaceTemplateVars(my.filePartial, file);
			}
			$('.files').html(html);
		} else {
			// Show storage infos
		}
	}

	protected static renderBreadcrumb(data: any): void {
		let html = '';
		let path = '';
		let label;
		let item;
		let parts = [];
		let my = DigitalAssetManagementActions;
		console.log('renderBreadCrumb');
		console.log(data);
		if (data.getContent) {
			item = {identifier: data.actionparam};
			parts = item.identifier.split('/');
			// if (data.getContent.folders.length) {
			// 	item = data.getContent.folders[0];
			// 	parts = item.identifier.split('/');
			// 	parts.pop();
			// 	parts.pop();
			// } else if (data.getContent.files.length) {
			// 	item = data.getContent.files[0];
			// 	parts = item.identifier.split('/');
			// 	parts.pop();
			// }
			console.log(parts);
			for (let i = 0; i < parts.length; i++) {
				const part = parts[i];
				if (i === 0) {
					// 	// @todo: insert storage name
					path = '/';
					label = 'Dateien';
				} else {
					path += '/' + part;
					label = part;
					html += '&nbsp;&gt;&nbsp;';
				}
				// Render single breadcrumb item
				console.log('render breadcrumb identifier: ' + item.identifier + ', path: ' + path + ', part: ' + part);
				html += my.replaceTemplateVars(my.breadcrumbPartial, {pathsegment: path, part: part, label: label});
			}
			if (html) {
				$('.breadcrumb').html(html);
			}
			if (data.getContent.files.length) {
				$('.files').removeClass('empty');
			} else {
				$('.files').addClass('empty');
			}
			if (data.getContent.folders.length) {
				$('.folders').removeClass('empty');
			} else {
				$('.folders').addClass('empty');
			}
		}
	}

	/**
	 * query a json backenendroute
	 *
	 * @param {string} method
	 * @param {string} parameter
	 */
	protected static request(method: string, parameter: string): void {
		let my = DigitalAssetManagementActions;
		// @todo: why does TYPO3.sett... work here without top.?
		let query = {};
		query[method] = parameter;
		$.getJSON(TYPO3.settings.ajaxUrls.dam_request, query)
			.done((data: any): void => {
				switch (method) {
					case 'getContent':
						my.renderBreadcrumb(data);
						my.renderContent(data);
						break;
					default:
						top.TYPO3.Notification.warning('Request failed', 'Unknown method: ' + method);
				}
			})
			.fail((err: any): void => {
				console.log('DigitalAssetManagement request promise fail ' + JSON.stringify(err));
				top.TYPO3.Notification.warning('Request failed', 'Content can not be displayed. ' + err.readyState);
				my.renderError(err);
			});
	}

	/**
	 *
	 * @param {string} template
	 * @param {object} data
	 * @returns {string}
	 */
	protected static replaceTemplateVars(template: string, data: object): string {
		return template.replace(
				/{([:a-zA-Z_\.-]*)}/g,
				function(m: string, key: string): string {
					// console.log('translate key: '+ key + ', ' + data[key] );
					if (key.indexOf('lll:') === 0) {
						return TYPO3.lang[key.replace(/lll:/, '')] || key;
					} else {
						return data.hasOwnProperty(key) ? data[key] : '###missing prop:' + key + '#';
					}
				}
			);
	}
}

$(DigitalAssetManagementActions.init);

// expose as global object
TYPO3.DigitalAssetManagementActions = DigitalAssetManagementActions;
export = DigitalAssetManagementActions;
