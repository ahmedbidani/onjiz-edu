const $BODY = $('body');
const $HTML = $('html');

class BaseBackendEKP {
	constructor() {
		if($('html').attr('lang') == undefined) {
			this.lang = 'en';
		} else {
			this.lang = $('html').attr('lang');
		}
		if(i18n) {
			this.messages = {
				headlineAdd: i18n[this.lang]["Add new"],
				headlineUpdate: i18n[this.lang]["Update"],
				addSuccess: i18n[this.lang]["Add new successfully"],
				editSuccess: i18n[this.lang]["Update successfully"],
				error: i18n[this.lang]["Error"],
				add: i18n[this.lang]["Add"],
				update: i18n[this.lang]["Update"],
				cancel: i18n[this.lang]["Cancel"],
				deletePopup: i18n[this.lang]["Do you want to delete?"],
				dataInvalid: i18n[this.lang]["Data invalid"],
				deleteSuccessfully: i18n[this.lang]["Delete successfully!"],
				sendSuccessfully: i18n[this.lang]["Send successfully!"],
				continue: i18n[this.lang]["Continue"],
				cannotImport: i18n[this.lang]["Can not import"],
				importSuccessfully: i18n[this.lang]["Import successfully"],
				cannotUploadExcceedMaxSize: i18n[this.lang]["Can not upload file exceeded maximum size"],
				chooseItem: i18n[this.lang]["Please choose items which applied action"],
				typeMessage: i18n[this.lang]["Please type messsage"],
				sendNotiPopup: i18n[this.lang]["Do you want to send this notifition?"],
				sendNotiSuccessfully: i18n[this.lang]["Send notification successfully"],
				hourFormatInvalid: i18n[this.lang]["Hour format is invalid"],
				deleteRow: i18n[this.lang]["Delete this row?"],
				publicFeeInvoicePopup: i18n[this.lang]["Are you sure to public these invoices?"],
				publicFeeInvoiceSuccessfully: i18n[this.lang]["Public invoices successfully!"],
				activated: i18n[this.lang]["Activated"],
				inactivated: i18n[this.lang]["Inactivated"],
        allStudent: i18n[this.lang]["All student"],
        moveStudent: i18n[this.lang]["Move student"],
        successfully: i18n[this.lang]["Successfully"]
				//For Full Calander
				// January: i18n[this.lang]['January'],
				// Jan: i18n[this.lang]['Jan'],
				// February: i18n[this.lang]['February'],
				// Feb: i18n[this.lang]['Feb'],
				// March: i18n[this.lang]['March'],
				// Mar: i18n[this.lang]['Mar'],
				// April: i18n[this.lang]['April'],
				// Apr:i18n[this.lang]['Apr'],
				// May: i18n[this.lang]['May'],
				// _May:i18n[this.lang]['_May'],
				// June: i18n[this.lang]['June'],
				// Jun:i18n[this.lang]['Jun'],
				// July: i18n[this.lang]['July'],
				// Jul:i18n[this.lang]['Jul'],
				// August: i18n[this.lang]['August'],
				// Aug:i18n[this.lang]['Aug'],
				// Septemper: i18n[this.lang]['Septemper'],
				// Sep:i18n[this.lang]['Sep'],
				// October: i18n[this.lang]['October'],
				// Oct: i18n[this.lang]['Oct'],
				// November: i18n[this.lang]['November'],
				// Nov: i18n[this.lang]['Nov'],
				// December: i18n[this.lang]['December'],
				// Dec: i18n[this.lang]['Dec'],
				// Monday: i18n[this.lang]['Monday'],
				// Mon: i18n[this.lang]['Mon'],
				// Tuesday: i18n[this.lang]['Tuesday'],
				// Tue: i18n[this.lang]['Tue'],
				// Wednesday: i18n[this.lang]['Wednesday'],
				// Wed: i18n[this.lang]['Wed'],
				// Thursday: i18n[this.lang]['Thursday'],
				// Thu: i18n[this.lang]['Thu'],
				// Friday: i18n[this.lang]['Friday'],
				// Fri: i18n[this.lang]['Fri'],
				// Saturday: i18n[this.lang]['Saturday'],
				// Sat: i18n[this.lang]['Sat'],
				// Sunday: i18n[this.lang]['Sunday'],
				// Sun:i18n[this.lang]['Sun'],
			}
		}
	}
}
class ModalBackendEKP {
	constructor(opts) {
		$.extend(this, {
			selector: null,
			onShow: null,
			onCancel: null,
			onOk: null,
			showOnElement: null
		});
		if (opts) $.extend(this, opts);
		this.initialize();
	}
	initialize() {
		let _this = this;
		if (!$(_this.selector).length) return;
		_this.initButtons();
	}
	update(opts) {
		if (opts) $.extend(this, opts);
	}
	initButtons() {
		let _this = this;
		let _el = $(_this.selector);
		let btnOk = _el.find('.btn-ok');
		let btnCancel = _el.find('.btn-cancel');
		btnOk.on('click', (e) => {
			e.preventDefault();
			if (_this.onOk) {
				_this.onOk();
			}
			_el.modal('hide');
		});
		btnCancel.on('click', (e) => {
			e.preventDefault();
			if (_this.onCancel) {
				_this.onCancel();
			}
			_el.modal('hide');
		})
	}
	html(msg) {
		let _this = this;
		let _el = $(_this.selector);

		if (msg) {
			_el.html(msg);
		}
	}
	show(msg) {
		let _this = this;
		let _el = $(_this.selector);
		if (msg) {
			_el.find('.modal-body').html(msg);
		}
		if (_this.onShow) {
			_this.onShow(_el);
		}
		if (_this.showOnElement) {
			_el.modal({
				backdrop: false
			});
		}
		_el.modal('show');
	}
	hide() {
		let _this = this;
		let _el = $(_this.selector);
		if (_this.onCancel) {
			_this.onCancel(_el);
		}
		_el.modal('hide');
	}
	toggle() {
		let _this = this;
		let _el = $(_this.selector);
		_el.modal('toggle');
	}
}
class CheckBoxBackendEKP {
	constructor(opts) {
		$.extend(this, {
			isChkAll: false,
			childSelector: null,
			selector: null,
			onChange: null
		});
		if (opts) $.extend(this, opts);

		this.initialize();
	}

	initialize() {
		let _this = this;
		if (!$(_this.selector).length) return;

		_this.value = (_this.isChkAll ? '' : undefined);
		_this.el = $(_this.selector);
		$(_this.selector).on('change', (e) => {
			if (_this.isChkAll) {
				_this.value = '';
				let children = $(_this.childSelector);
				if (_this.el[0].checked) {
					$(_this.childSelector).each(function (i, child) {
						child.checked = true;
						_this.value += (i == 0 ? child.value : ';' + child.value);
					});
				} else {
					$(_this.childSelector).each(function (i, child) {
						child.checked = false;
					});
				}
				if (_this.onChange) _this.onChange(e, _this.value);
			} else {
				if (_this.onChange) _this.onChange(e, _this.el.val());
			}
		});
		if (_this.isChkAll) {
			$(_this.childSelector).each((i, child) => {
				$(child).on('change', (e) => {
					if (e.target.checked) {
						if (_this.value == '') {
							_this.value = e.target.value;
						} else {
							_this.value += ';' + e.target.value;
						}
						let total = 0;
						$(_this.childSelector).each((ind, _child) => {
							total += (_child.checked ? 1 : 0);
						});
						if (total == $(_this.childSelector).length) {
							_this.el[0].checked = true;
						}
					} else {
						_this.el[0].checked = false;
						//remove item in arr
						let _val = _this.value.split(';');
						_val.splice(_val.indexOf(e.target.value), 1);
						_this.value = _val.join(';');
					}
					console.log('value of check all: ' + _this.value);
				});
			});
		}
	}
}
class Component {
	constructor(options = {}) {
		this.$el = options.$el ? options.$el : $(document);
		this.el = this.$el[0];
		delete options.$el;

		this.options = options;

		this.isProcessed = false;
	}

	initialize() {
		// Initialize the Component
	}
	process() {
		// Bind the Event on the Component
	}

	run(...state) {
		// run Component
		if (!this.isProcessed) {
			this.initialize();
			this.process();
		}

		this.isProcessed = true;
	}

	triggerResize() {
		if (document.createEvent) {
			let ev = document.createEvent('Event');
			ev.initEvent('resize', true, true);
			window.dispatchEvent(ev);
		} else {
			element = document.documentElement;
			let event = document.createEventObject();
			element.fireEvent('onresize', event);
		}
	}
}
class Scrollable {
	constructor($el) {
		this.$el = $el;
		this.api = null;

		this.init();
	}

	init() {
		this.api = this
			.$el
			.asScrollable({
				namespace: 'scrollable',
				skin: 'scrollable-inverse',
				direction: 'vertical',
				contentSelector: '>',
				containerSelector: '>',
			})
			.data('asScrollable');
	}

	update() {
		if (this.api) {
			this.api.update();
		}
	}

	enable() {
		if (!this.api) {
			this.init();
		}
		if (this.api) {
			this.api.enable();
		}
	}

	disable() {
		if (this.api) {
			this.api.disable();
		}
	}
}
class Hoverscroll {
	constructor($el) {
		this.$el = $el;
		this.api = null;

		this.init();
	}

	init() {
		this.api = this
			.$el
			.asHoverScroll({
				namespace: 'hoverscorll',
				direction: 'vertical',
				list: '.site-menu',
				item: '> li',
				exception: '.site-menu-sub',
				fixed: false,
				boundary: 100,
				onEnter() {
					// $(this).siblings().removeClass('hover'); $(this).addClass('hover');
				},
				onLeave() {
					// $(this).removeClass('hover');
				},
			})
			.data('asHoverScroll');
	}

	update() {
		if (this.api) {
			this.api.update();
		}
	}

	enable() {
		if (!this.api) {
			this.init();
		}
		if (this.api) {
			this.api.enable();
		}
	}

	disable() {
		if (this.api) {
			this.api.disable();
		}
	}
}
class Menubar extends Component {
	constructor(...args) {
		super(...args);

		this.top = false;
		this.folded = false;
		this.foldAlt = false;
		this.$menuBody = this.$el.children('.site-menubar-body');
		this.$menu = this.$el.find('[data-plugin=menu]');

		if ($BODY.data('autoMenubar') === false || $BODY.is('.site-menubar-keep')) {
			if ($BODY.hasClass('site-menubar-fold')) {
				this.auto = 'fold';
			} else if ($BODY.hasClass('site-menubar-unfold')) {
				this.auto = 'unfold';
			}
		} else {
			this.auto = true;
		}

		let breakpoint = Breakpoints.current();
		if (this.auto === true) {
			if (breakpoint) {
				switch (breakpoint.name) {
					case 'lg':
						this.type = 'unfold';
						break;
					case 'md':
					case 'sm':
						this.type = 'fold';
						break;
					case 'xs':
						this.type = 'hide';
						break;
				}
			}
		} else {
			switch (this.auto) {
				case 'fold':
					if (breakpoint.name == 'xs') {
						this.type = 'hide';
					} else {
						this.type = 'fold';
					}
					break;
				case 'unfold':
					if (breakpoint.name == 'xs') {
						this.type = 'hide';
					} else {
						this.type = 'unfold';
					}
					break;
			}
		}
	}

	initialize() {
		if (this.$menuBody.length > 0) {
			this.initialized = true;
		} else {
			this.initialized = false;
			return;
		}

		this.scrollable = new Scrollable(this.$menuBody);
		this.hoverscroll = new Hoverscroll(this.$menuBody);

		$HTML.removeClass('css-menubar').addClass('js-menubar');

		if ($BODY.is('.site-menubar-top')) {
			this.top = true;
		}

		if ($BODY.is('.site-menubar-fold-alt')) {
			this.foldAlt = true;
		}

		this.change(this.type);
	}

	process() {
		$('.site-menu-sub').on('touchstart', function (e) {
			e.stopPropagation();
		}).on('ponitstart', function (e) {
			e.stopPropagation();
		});
	}

	getMenuApi() {
		return this.$menu.data('menuApi');
	}

	setMenuData() {
		let api = this.getMenuApi();

		if (api) {
			api.folded = this.folded;
			api.foldAlt = this.foldAlt;
			api.outerHeight = this.$el.outerHeight();
		}
	}

	update() {
		this.scrollable.update();
		this.hoverscroll.update();
	}

	change(type) {
		if (this.initialized) {
			this.reset();
			this[type]();
			this.setMenuData();
		}
	}

	animate(doing, callback = function () { }) {
		$BODY.addClass('site-menubar-changing');

		doing.call(this);

		this.$el.trigger('changing.site.menubar');

		let menuApi = this.getMenuApi();
		if (menuApi) {
			menuApi.refresh();
		}

		setTimeout(() => {
			callback.call(this);
			$BODY.removeClass('site-menubar-changing');
			this.update();
			this.$el.trigger('changed.site.menubar');
		}, 500);
	}

	reset() {
		$BODY.removeClass('site-menubar-hide site-menubar-open site-menubar-fold site-menubar-unfold');
		$HTML.removeClass('disable-scrolling');
	}

	open() {
		this.animate(() => {
			$BODY.addClass('site-menubar-open site-menubar-unfold');

			$HTML.addClass('disable-scrolling');
		}, function () {
			this.scrollable.enable();
		});

		this.type = 'open';
	}

	hide() {
		this.hoverscroll.disable();

		this.animate(() => {
			$BODY.addClass('site-menubar-hide site-menubar-unfold');
		}, function () {
			this.scrollable.enable();
		});

		this.type = 'hide';
	}

	unfold() {
		this.hoverscroll.disable();

		this.animate(function () {
			$BODY.addClass('site-menubar-unfold');
			this.folded = false;
		}, function () {
			this.scrollable.enable();

			this.triggerResize();
		});

		this.type = 'unfold';
	}

	fold() {
		this.scrollable.disable();

		this.animate(function () {
			$BODY.addClass('site-menubar-fold');
			this.folded = true;
		}, function () {
			this.hoverscroll.enable();

			this.triggerResize();
		});

		this.type = 'fold';
	}
}
class MediaGridTable {
	constructor(){
		this.initialize();
		this.process();
	}
	initialize() {

		this.$arrGrid = $('#arrangement-grid');
		this.$arrList = $('#arrangement-list');
		this.$content = $('#mediaContent');

		// states
		this.states = {
			list: false
		}
	}
	process() {
		// super.process();

		this.steupArrangement();
		// this.setupActionBtn();
		this.bindListChecked();
		this.bindDropdownAction();
	}

	list(active) {
		if (active) {
			this.$arrGrid.removeClass('active');
			this.$arrList.addClass('active');
			$('.media-list').removeClass('is-grid').addClass('is-list');
			$('.media-list>ul>li').removeClass('animation-scale-up').addClass('animation-fade');
		} else {
			this.$arrList.removeClass('active');
			this.$arrGrid.addClass('active');
			$('.media-list').removeClass('is-list').addClass('is-grid');
			$('.media-list>ul>li').removeClass('animation-fade').addClass('animation-scale-up');
		}

		this.states.list = active;
	}

	steupArrangement() {
		let self = this;
		this.$arrGrid.on('click', function() {
			if ($(this).hasClass('active')) {
				return;
			}

			self.list(false);
		});
		this.$arrList.on('click', function() {
			if ($(this).hasClass('active')) {
				return;
			}

			self.list(true);
		});
	}

	bindListChecked() {
		this.selectableObj = new Selectable(this.$content);
		// this.$content.on('asSelectable::change', (e) => {
		// 	console.log(this.selectableObj.getSelected());
		// })
	}

	bindDropdownAction() {
		$('.info-wrap>.dropdown').on('show.bs.dropdown', function() {
			$(this).closest('.media-item').toggleClass('item-active');
		}).on('hidden.bs.dropdown', function() {
			$(this).closest('.media-item').toggleClass('item-active');
		});

		$('.info-wrap .dropdown-menu').on('`click', (e) => {
			e.stopPropagation();
		});
	}

	getSelectedMedias() {
		let els = this.selectableObj.getSelected();
		let ids = [];
		for(let el of els) {
			ids.push($(el).attr('data-id'))
		};
		return ids;
	}
}
class Selectable {
	constructor(element, options) {
		this.element = element;
		this.$element = $(element);
		this.options = $.extend({}, {
			allSelector: '.selectable-all',
			itemSelector: '.selectable-item',
			rowSelector: 'tr',
			rowSelectable: false,
			rowActiveClass: 'active',
			onChange: null
		}, options, this.$element.data());

		this.init();
	}

	init() {
		const self = this;
		const options = this.options;

		self.$element.on('change', options.allSelector, function() {
			const value = $(this).prop("checked");
			self.getItems().each(function() {
				const $one = $(this);
				$one.prop("checked", value).trigger('change', [true]);;
				self.selectRow($one, value);
			});
		});

		self.$element.on('click', options.itemSelector, function(e) {
			const $one = $(this);
			const value = $one.prop("checked");
			self.selectRow($one, value);
			e.stopPropagation();
		});

		self.$element.on('change', options.itemSelector, function() {
			const $all = self.$element.find(options.allSelector);
			const $row = self.getItems();
			const total = $row.length;
			const checked = self.getSelected().length;

			if (total === checked) {
				$all.prop('checked', true);
			} else {
				$all.prop('checked', false);
			}

			self._trigger('change', checked);

			if (typeof options.callback === 'function') {
				options.callback.call(this);
			}
		});

		if (options.rowSelectable) {
			self.$element.on('click', options.rowSelector, function(e) {
				if ("checkbox" !== e.target.type && "button" !== e.target.type && "a" !== e.target.tagName.toLowerCase() && !$(e.target).parent("div.checkbox-custom").length) {
				const $checkbox = $(options.itemSelector, this);
				const value = $checkbox.prop("checked");
				$checkbox.prop("checked", !value);
				self.selectRow($checkbox, !value);
				}
			});
		}
	}

	selectRow(item, value) {
		if (value) {
			item.parents(this.options.rowSelector).addClass(this.options.rowActiveClass);
		} else {
			item.parents(this.options.rowSelector).removeClass(this.options.rowActiveClass);
		}
	}

	getItems() {
		return this.$element.find(this.options.itemSelector);
	}

	getSelected() {
		return this.getItems().filter(':checked');
	}

	_trigger(eventType) {
		const method_arguments = Array.prototype.slice.call(arguments, 1);
		const data = [this].concat(method_arguments);

		// event
		this.$element.trigger(`asSelectable::${eventType}`, data);

		// callback
		eventType = eventType.replace(/\b\w+\b/g, word => word.substring(0, 1).toUpperCase() + word.substring(1));
		const onFunction = `on${eventType}`;
		if (typeof this.options[onFunction] === 'function') {
			this.options[onFunction].apply(this, method_arguments);
		}
	}
}
