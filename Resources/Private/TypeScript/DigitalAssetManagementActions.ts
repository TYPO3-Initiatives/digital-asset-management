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
import Notification = require('TYPO3/CMS/Backend/Notification');
import uploader = require('TYPO3/CMS/Backend/DragUploader');

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
	// todo: Get templates by fluid. Add fields to insert as data-attributes and insert content by jQuery.text()
	// todo: Use jQuery.html() if data-escape="false" is set, otherwise jQuery.text()
	static folderPartial: string = '    <div class="grid selectable ajax-action {mimetype}" data-action="getContent" ' +
		'data-parameter="{identifier}">\n' +
		'   <div class="grid-cell" >\n' +
		'      <div class="icon folder-icon {type}"></div>' +
		'   </div>\n' +
		'   <div class="info">\n' +
		'      <div class="grid-cell filename"><h5 class="card-title" data-field="name" data-escape="false">{name}</h5></div>\n' +
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

	static breadcrumbPartial: string = '<li class="breadcrumb-item ajax-action" data-action="getContent" ' +
		'data-parameter="{identifier}">{label}</li>';

	static metadataPartial: string = '';

	static settings: Settings;

	/**
	 *
	 */
	public static init(): void {
		let my = DigitalAssetManagementActions;
		let $dam = $('.digital-asset-management');
		let $body = $('body');
		console.log('DigitalAssetManagement.init');
		my.request('getContent', {path: ''}, my.genericRequestCallback);
		$dam.on('click', '.ajax-action', function(): void {
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
		$dam.on('click', '.selectbox', function(e: any): boolean {
			e.preventDefault();
			// if it is a selectable-inputbox do nothing than selecting the file/folder
			$(this).parent('.selectable').toggleClass('selected');
			// todo: check if one file is selected and show/hide edit button panel
			my.selectFiles('selectionChanged');
			return false;
		});
		$dam.on('click', '.view-action', function(): void {
			let action = this.dataset.action;
			let parameter = this.dataset.parameter;
			console.log ( 'view-action: ' + action + ', par: ' + parameter);
			my.viewAction(action);
		});
		$dam.on('click', '.sort-action', function(): void {
			let action = this.dataset.action;
			let parameter = {path: my.settings.path};
			console.log('sort-action');
			my.sortAction(action, parameter);
		});
		$dam.on('click', '.select-action', function(): void {
			let action = this.dataset.action;
			let parameter = {path: my.settings.path};
			console.log('select-action');
			my.selectFiles(action);
		});
		$body.on('click', function(): void {
			$('.sidebar').addClass('hidden');
		});
		$('.dropzone-close').on('click', function(e: Event): void {
			console.dir(uploader);
			uploader.hideDropzone(e);
			// $('.dropzone').addClass('hidden');
		});
		uploader.initialize('.dropzone');
		// my.initDropzone();
		$('.localize').each(function (index: number): void {
			let key = $(this).attr('data-l10nkey');
			if (TYPO3.lang[key]) {
				$(this).text(TYPO3.lang[key]);
			} else {
				$(this).text('## localization missing: ' + key);
			}
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
				// todo: security XSS !!! escape! Use jQuery.text() and DOM-functions to insert data instead of string concatination
				const part = data.result.breadcrumbs[i];
				if (part.type === 'home') {
					part.label = TYPO3.lang['dam.labels.files'];
				} else {
					part.label = part.name; // part.name escapen !!
					lastidentifier = part.identifier;
				}
				// Render single breadcrumb item
				html += my.replaceTemplateVars(my.breadcrumbPartial, part); // security xss posible
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
			console.log('got thumbs');
			console.log(data);
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
					Notification.warning('Request failed', 'Content can not be displayed. ' + err.readyState);
					// Notification.warning('Request failed', 'Content can not be displayed. ' + err.readyState);
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
				console.log(data);
				my.renderBreadcrumb(data);
				my.renderContent(data);
				my.loadThumbs();
				if (data.result.current && data.result.current.identifier) {
					$('.breadcrumb').attr('data-identifier', data.result.current.identifier);
					$('.t3js-drag-uploader').attr('data-target-folder', data.result.current.identifier);
				}
				$('.sort-order').removeClass('active');
				if (my.settings.reverse) {
					$('.sort-action[data-action="sort-order-dsc"]').addClass('active');
				} else {
					$('.sort-action[data-action="sort-order-asc"]').addClass('active');
				}
				// $('.sort-field').removeClass('active');
				$('.sort-action').removeClass('active');
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
				Notification.warning('Request failed', 'Unknown action: ' + action);
		}
		my.selectFiles('selectionChanged');
	}

	protected static viewAction(action: string): void {
		let my = DigitalAssetManagementActions;
		switch (action) {
			case 'upload':
				// show uploadloader dropzone
				uploader.showDropzone();
				// $('.dropzone').removeClass('hidden');
				break;
			case 'showUploadProgress':
				$('.upload-progress').removeClass('hidden');
				break;
			default:
				// Switch the view by removing all other view-* classes and adding the clicked class
				$('.maincontent').removeClass(function (index: number, className: string): string {
					return (className.match (/(^|\s)view-\S+/g) || []).join(' ');
				}).addClass(action);
		}
	}

	protected static sortAction(action: string, parameter: Settings): void {
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
				my.settings.reverse = !my.settings.reverse;
				break;
			case 'sort-by-size':
				my.settings.sort = 'size';
				my.settings.reverse = !my.settings.reverse;
				break;
			case 'sort-by-date':
				my.settings.sort = 'modified';
				my.settings.reverse = !my.settings.reverse;
				break;
			default:
				// do nothing
		}
		parameter.reverse = my.settings.reverse;
		parameter.sort = my.settings.sort;
		console.log ( 'sort-action: ' + action + ', par: ' + JSON.stringify(parameter));
		// Remove all other view-* classes and add the clicked class
		$('.maincontent').removeClass(function (index: number, className: string): string {
			return (className.match (/(^|\s)sort-order-\S+/g) || []).join(' ');
		}).addClass(action).attr('data-reverse', parameter.reverse );
		$('.sort-action').removeClass('sort-order-asc sort-order-dsc');
		$('.sort-action[data-action="' + action + '"]').addClass(
			parameter.reverse ? 'sort-order-dsc' : 'sort-order-asc'
		);
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
	 * Handle drop zone
	 */
	protected static initDropzone(): void {
		let my = DigitalAssetManagementActions;
		let $dropzone = $('.dropzone');
		$('body').on('dragenter', function(e: Event): void {
			e.preventDefault();
			e.stopPropagation();
			$dropzone.removeClass('hidden');
		});
		$dropzone.on('dragenter', function(e: Event): void {
			e.preventDefault();
			e.stopPropagation();
		});
		$dropzone.on('dragleave', function(e: Event): void {
			e.preventDefault();
			e.stopPropagation();
			$dropzone.addClass('hidden');
		});
		$dropzone.on('dragover', function(e: Event): void {
			e.preventDefault();
			e.stopPropagation();
			e.originalEvent.dataTransfer.dropEffect = 'copy';
		});
		$dropzone.on('drop', function(e: Event): void {
			console.dir(e);
			if (e.originalEvent.dataTransfer) {
				if (e.originalEvent.dataTransfer.files.length) {
					e.preventDefault();
					e.stopPropagation();
					// upload files to server
					console.dir(e.originalEvent.dataTransfer.files);
					my.showFilesToUpload('.sidebar', e.originalEvent.dataTransfer.files);
					$dropzone.addClass('hidden');
					my.uploadFiles(e.originalEvent.dataTransfer.files);
				}
			}
		});
		$dropzone.on('click', function(): void {
			$(this).addClass('hidden');
		});
		$('input[type=file]').on('change', function(e: Event): void {
			console.log('upload files from file dialog to server');
			console.dir(e);
			console.log($(this).val());
			console.dir(e.originalEvent.target.files);

			// my.showFilesToUpload('.sidebar', e.originalEvent.dataTransfer.files);
			// $dropzone.addClass('hidden');
			// my.uploadFiles(e.originalEvent.dataTransfer.files);
		});
	}

	/**
	 * Render view of file names with
	 *
	 * @param {string} targetSelector
	 * @param {{}} files
	 */
	protected static showFilesToUpload(targetSelector: string, files: {}): void {
		// let my = DigitalAssetManagementActions;
		let $target = $(targetSelector);
		$target.removeClass('hidden');
		if (files) {
			let items = [];
			items.push('<h4>Files</h4>\n<dl class="row">\n');
			for (let i = 0, f; f = files[i]; i++) {
				items.push('<dt id="file' + i + '" class="col-sm-4">' + f.name + '</dt>' +
					'<dd class="col-sm-8">(' + f.type || 'n/a'  + ') - ' + f.size + ' bytes</dd>');
			}
			items.push('</dl>');
			$('.metadata').html(items.join(''));
			$target.removeClass('hidden');
		}
	}

	/**
	 * Send files to server
	 * Show upload progress in frontend
	 */
	protected static uploadFiles(files: Array): void {
		let my = DigitalAssetManagementActions;
		if (files) {
			console.log('to upload:');
			$('.upload-in-progress-info').removeClass('hidden');
			let target = $('.breadcrumb').attr('data-identifier');
			for (let i = 0, f; f = files[i]; i++) {
				let formData = new FormData();
				formData.append('file', f, f.name);
				formData.append('overwriteExistingFiles', 'cancel');
				console.log(files);
				$.ajax(TYPO3.settings.ajaxUrls.file_process, {
					datatype: 'json',
					cache: false,
					contentType: false,
					processData: false,
					data: formData,
					type: 'post'
				}).done((data: ResponseObject): void => {
					console.log('uploaded!!!!');
					$('.upload-in-progress-info').addClass('hidden');
					console.dir(data);
				}).fail((err: any): void => {
					console.log('DigitalAssetManagement upload files ajax call fails ' + JSON.stringify(err));
					Notification.warning('Request failed', 'Error uploading files. ' + err.readyState);
					my.renderError(err);
				});
			}
		}
	}

	/**
	 * Replace template variables surrounded by {|}.
	 * Replace language keys surrounded by {lll:|}.
	 * todo: XSS possible: Use jQuery text for inserting text properties
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
if (typeof TYPO3 !== 'undefined') {
	TYPO3.DigitalAssetManagementActions = DigitalAssetManagementActions;
}
export = DigitalAssetManagementActions;
