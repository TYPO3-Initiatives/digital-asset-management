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
import moment = require('moment');
// import Icons = require('TYPO3/CMS/Backend/Icons');


interface ResponseObject {
	action: string;
	params: any;
	result: any;

	request: any;
	response: any;
}

interface RequestCallback {
	(data: ResponseObject): void;
}

interface Settings {
	path: string;
	start: number;
	count: number;
	sort: string;
	reverse: boolean;
	meta: boolean;
}

// interface Parameter {
// 	action: string;
// 	parameter: Settings; // todo: object or Settings?
// }

/**
 * Module: TYPO3/CMS/Backend/InfoWindow
 * @exports TYPO3/CMS/Backend/InfoWindow
 */
class DigitalAssetManagementActions {

	static folderPartial: string = '    <div class="grid selectable ajax-action {mimetype}" data-action="getContent" ' +
		'data-parameter="{identifier}">\n' +
		'   <div class="grid-cell" >\n' +
		'      <div class="icon folder-icon {type}"></div>' +
		'   </div>\n' +
		'   <div class="info">\n' +
		'      <div class="grid-cell filename"><h5 class="card-title">{name}</h5></div>\n' +
		'   </div>\n' +
		'  </div>\n';

	static filePartial: string = '<div class="grid file {mimetype} selectable ajax-action" data-action="getMetadata"' +
		' data-parameter="{identifier}">\n' +
		// '    <img class="card-img-top" src="PlaceholderImage" data-src="{uid}" width="180" height="120"/>\n' +
		'    <div class="preview" >' +
		'<img src="/typo3conf/ext/digital_asset_management/Resources/Public/Images/empty.png" data-src="{identifier}"></div>\n' +
		'    <div class="grid-cell selectbox" >\n' +
		'    </div>\n' +
		'    <div class="grid-cell" >\n' +
		'        <div class="icon icon-mimetypes-{mimetype}" /></div>\n' +
		'    <div class="info">\n' +
		'      <div class="grid-cell filename"><h5>{name}</h5></div>\n' +
		'      <div class="grid-cell filesize"><p><span class="grid-label">{lll:dam.labels.filesize}: </span>{size}</p></div>\n' +
		'      <div class="grid-cell moddate"><p><span class="grid-label">{lll:dam.labels.modified}: \<n></n>' +
		'		</span>{modification_date_formated}</p></div>\n' +
		'    </div>' +
		'  </div>\n';

	static breadcrumbPartial: string = '<span class="ajax-action" data-action="getContent" ' +
		'data-parameter="{identifier}">{label}</span>';

	static metadataPartial: string = '';

	static settings: Settings;

	/**
	 *
	 */
	public static init(): void {
		let my = DigitalAssetManagementActions;
		console.log('DigitalAssetManagement.init');
		my.request('getContent', {path: ''}, my.genericRequestCallback);
		$('.digital-asset-management').on('click', '.ajax-action', function(): void {
			let action = this.dataset.action;
			let parameter = {path: this.dataset.parameter, sort: my.settings.sort, reverse: my.settings.reverse};
			if (this.dataset.parameter === 'selected') {
				parameter.path = [];
				$('.selected').each(function(index: number): void {
					console.log(this);
					parameter.path.push(this.dataset.parameter);
				});
			}
			console.log ('ajax-action: ' + action + ', par: ' + JSON.stringify(parameter));
			my.request(action, parameter, my.genericRequestCallback);
		});
		$('.digital-asset-management').on('click', '.selectbox', function(e: any): boolean {
			e.preventDefault();
			// if it is a selectable-inputbox do nothing than selecting the file/folder
			$(this).parent('.selectable').toggleClass('selected');
			// todo: check if one file is selected and show/hide edit button panel
			my.selectFiles('selectionChanged');
			return false;
		});
		$('.digital-asset-management').on('click', '.view-action', function(): void {
			let action = this.dataset.action;
			let parameter = this.dataset.parameter;
			console.log ( 'view-action: ' + action + ', par: ' + parameter);
			// Remove all other view-* classes and add the clicked class
			$('.maincontent').removeClass(function (index: number, className: string): string {
				return (className.match (/(^|\s)view-\S+/g) || []).join(' ');
			}).addClass(action);
		});
		$('.digital-asset-management').on('click', '.sort-action', function(): void {
			let action = this.dataset.action;
			let parameter = {path: my.settings.path};
			console.log('sort-action');
			my.sortAction(action, parameter);
		});
		$('.digital-asset-management').on('click', '.select-action', function(): void {
			let action = this.dataset.action;
			let parameter = {path: my.settings.path};
			console.log('local-action');
			my.selectFiles(action);
		});
		$('body').on('click', function(): void {
			$('.sidebar').addClass('hidden');
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
	 * @param data ResponseObject
	 */
	public static renderContent(data: ResponseObject): void {
		let my = DigitalAssetManagementActions;
		if (data && data.request) {
			$('.errorlog').html(data.request + data.response);
		}
		if (data.result && (data.result.files || data.result.folder)) {
			// Show folders and files
			let html = '';
			for (let i = 0; i < data.result.folders.length; i++) {
				const folder = data.result.folders[i];
				// Icons.getIcon('apps-filetree-folder', 'large').done( (iconMarkup: string): void => {
				// 	$('.folder-icon').html(iconMarkup);
				// });
				// @todo: how to get the thumbnail images without viewhelper?
				folder.mimetype = 'folder';
				// folder.modification_date_formated = moment(folder.modification_date).
				// format(TYPO3.settings.DateTimePicker.DateFormat[1] || 'YYYY-MM-DD');
				html += my.replaceTemplateVars(my.folderPartial, folder);
			}
			$('.folders').html(html);
			html = '';
			// icon mimetypes-pdf
			for (let i = 0; i < data.result.files.length; i++) {
				const file = data.result.files[i];
				// @todo: how to get the thumbnail images without viewhelper?
				// Add mimetype as two classes: image/jpeg -> image jpeg
				file.mimetype = file.mimetype.replace('/', ' ');
				file.modification_date_formated = moment.unix(file.modification_date)
					.format(top.TYPO3.settings.DateTimePicker.DateFormat[1] || 'YYYY-MM-DD');
				html += my.replaceTemplateVars(my.filePartial, file);
			}
			$('.files').html(html);
		} else {
			// Show storage infos
		}
	}

	protected static renderBreadcrumb(data: ResponseObject): void {
		let html = '';
		let my = DigitalAssetManagementActions;
		let lastidentifier = '';
		if (data.result && data.result.breadcrumbs) {
			for (let i = 0; i < data.result.breadcrumbs.length; i++) {
				const part = data.result.breadcrumbs[i];
				if (part.type === 'home') {
					part.label = TYPO3.lang['dam.labels.files'];
				} else {
					part.label = part.name;
					lastidentifier = part.identifier;
					html += '&nbsp;&gt;&nbsp;';
				}
				// Render single breadcrumb item
				html += my.replaceTemplateVars(my.breadcrumbPartial, part);
			}
			// Set actual identifier to reindex-action parameter
			$('.ajax-action[data-action="reindexStorage"]').attr('data-parameter', lastidentifier).removeClass('disabled');
			// Add some classes
			if (html) {
				$('.breadcrumb').html(html).removeClass('empty');
			} else {
				$('.breadcrumb').html('').addClass('empty');
			}
			if (data.result.files.length) {
				$('.files').removeClass('empty');
			} else {
				$('.files').addClass('empty');
			}
			if (data.result.folders.length) {
				$('.folders').removeClass('empty');
			} else {
				$('.folders').addClass('empty');
			}
		}
	}

	/**
	 *  load thumbnail from getThumbnail
	 *  @return void
	 *  @todo: only request images which are in the viewport, and trigger this when scrolling
	 */
	protected static loadThumbs(): void {
		let my = DigitalAssetManagementActions;
		$('.grid.image').each(function(): void {
			let $el = $(this).find('img');
			let src = $el.attr('data-src');
			if (src) {
				my.request('getThumbnail', {path: src}, my.renderThumb);
			}
		});
	}

	protected static renderThumb(data: ResponseObject): void {
		let my = DigitalAssetManagementActions;
		if (data.result && data.result.thumbnail) {
			$('.grid.image').each(function(): void {
				let $el = $(this).find('img');
				if (data.params.path === $el.attr('data-src')) {
					$el.attr('src', data.result.thumbnail);
					$(this).find('.icon').addClass('small');
					// $(this).addClass('haspreview').css('width', 'auto');
				}
			});
		}
	}

	protected static showMetadata(data: ResponseObject): void {
		let my = DigitalAssetManagementActions;
		if (data.result && data.result.file) {
			let html = '<h4>Metadata</h4>\n<dl class="row">\n';
			console.log(data.result.file);
			for (let field in data.result.file) {
				if (data.result.file.hasOwnProperty(field)) {
					html += '<dt class="col-sm-4">' + field + '</dt><dd class="col-sm-8">' + data.result.file[field] + '</dd>';
				}
			}
			html += '</dl>';
			$('.metadata').html(html);
			$('.sidebar').removeClass('hidden');
		}
	}

	/**
	 * query a json backenendroute
	 *
	 * @param {string} action
	 * @param {object} parameter
	 * @param {string} callback
	 */
	protected static request(action: string, parameter: object, callback: RequestCallback): void {
		let my = DigitalAssetManagementActions;
		// @todo: why does TYPO3.sett... work here without top.?
		let query = {action: '', params: {}};
		let failedbefore = false;
		query.action = action;
		query.params = parameter;
		console.log(query);
		$.getJSON(TYPO3.settings.ajaxUrls.dam_request, query)
			.done((data: ResponseObject): void => {
				callback(data);
			})
			.fail((err: any): void => {
				console.log('DigitalAssetManagement request promise fail ' + JSON.stringify(err));
				if (!failedbefore) {
					top.TYPO3.Notification.warning('Request failed', 'Content can not be displayed. ' + err.readyState);
					failedbefore = true;
				}
				my.renderError(err);
			});
	}

	protected static genericRequestCallback(data: ResponseObject): void {
		let my = DigitalAssetManagementActions;
		let action = data.action;
		if (data.result && data.result.settings) {
			my.settings = data.result.settings;
		}
		switch (action) {
			case 'getContent':
				my.renderBreadcrumb(data);
				my.renderContent(data);
				my.loadThumbs();
				$('.sort-order').removeClass('active');
				if (my.settings.reverse) {
					$('.sort-action[data-action="sort-order-dsc"]').addClass('active');
				} else {
					$('.sort-action[data-action="sort-order-asc"]').addClass('active');
				}
				$('.sort-field').removeClass('active');
				if (my.settings.sort === 'modified') {
					$('.sort-action[data-action="sort-by-date"]').addClass('active');
				} else if (my.settings.sort === 'name') {
					$('.sort-action[data-action="sort-by-name"]').addClass('active');
				} else if (my.settings.sort === 'size') {
					$('.sort-action[data-action="sort-by-size"]').addClass('active');
				}
				break;
			case 'getThumbnail':
				my.renderThumb(data);
				break;
			case 'getMetadata':
				my.showMetadata(data);
				break;
			default:
				top.TYPO3.Notification.warning('Request failed', 'Unknown action: ' + action);
		}
		my.selectFiles('selectionChanged');
	}

	protected static sortAction(action: string, parameter: object): void {
		let my = DigitalAssetManagementActions;
		console.log ( 'sort-action: ' + action + ', par: ' + JSON.stringify(parameter));
		switch (action) {
			case 'sort-order-asc':
				my.settings.reverse = false;
				break;
			case 'sort-order-dsc':
				my.settings.reverse = true;
				break;
			case 'sort-by-name':
				my.settings.sort = 'name';
				break;
			case 'sort-by-size':
				my.settings.sort = 'size';
				break;
			case 'sort-by-date':
				my.settings.sort = 'modified';
				break;
			default:
				// do nothing
		}
		parameter.reverse = my.settings.reverse || false;
		parameter.sort = my.settings.sort || 'name';
		console.log ( 'sort-action: ' + action + ', par: ' + JSON.stringify(parameter));
		// Remove all other view-* classes and add the clicked class
		$('.maincontent').removeClass(function (index: number, className: string): string {
			return (className.match (/(^|\s)sort-order-\S+/g) || []).join(' ');
		}).addClass(action).attr('data-reverse', parameter.reverse );
		my.request('getContent', parameter, my.genericRequestCallback);
	}

	protected static selectFiles(action: string): void {
		if (action === 'deselectAll') {
			$('.selectable').removeClass('selected');
		}
		if ($('.selectable.selected').length) {
			if ($('.selected').length === 1) {
				$('.filesselected').text(TYPO3.lang['dam.labels.nav.fileselected']);
			} else {
				$('.filesselected').text($('.selected').length + ' ' + TYPO3.lang['dam.labels.nav.filesselected']);
			}
			$('.newaction').hide();
			$('.fileaction').show();
		} else {
			$('.newaction').show();
			$('.fileaction').hide();
		}
	}

	/**
	 * Replace template variables surrounded by {|}.
	 * Replace language keys surrounded by {lll:|}.
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
