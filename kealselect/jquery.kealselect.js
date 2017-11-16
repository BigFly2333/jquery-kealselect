(function($, window) {
  var $doc = $(document);

  // 实现构造器继承: 寄生组合继承。
  // 子类必须先在内部继承父类的构造器内部属性和方法
  // function Child(name){
  //   Parent.call(this);
  // }
  function _classExtends (Parent, Child) {
    // 创建一个没有实例方法的类
    var Super = function() {};
    Super.prototype = Parent.prototype;
    // 将实例作为子类的原型
    Child.prototype = new Super();

    return Child;
  }
  // selector check
  function _is(selector, selects, cb1, cb2) {
    if (!selector) {
      $.each(selects, function(index, select){
        !!cb1 && cb1(select);
      });
    } else {
      var selectors = selector.split(',');
      
      $.each(selectors, function(i, item) {
        var $item = $($.trim(item));
        $.each(selects, function(j, select){
          if (select.$el.is($item)) {
            !!cb2 && cb2(select);
          }
        });
      });
    }
  }


  // Select
  function Select(options) {
    // this.options = $.extend(true, {}, this.options);
    this.options = {
      // header: true,
      maxwidth: 300,
      minWidth: 200,
      btnClasses: '',
      menuClasses: '',
      text: {
        noneSelected: 'Select options',
        cbAll: 'all',
        clear: 'clear',
        btnSure: 'sure',
        btnCancel: 'cancel'
      },
      selectedCb: function(){},
    }
    $.extend(true, this.options, options);
    this.$el = this.options.$el;
    this.selected = {};

    this._init();

  }

  Select.prototype = {
    _init: function() {
      var that = this,
          o = that.options,
          $el = that.$el,
          title = $.trim($el.attr('title')) || '';

      if (title !== '') o.text.noneSelected = title;

      this.id = $el.attr('id');
      if (!this.id) {
        throw('id is none');
      }

      that._self_init && that._self_init();

      this._isOpen = that.isOpen || false;
      $el.hide();
      that._create();

      that._self_init_after && that._self_init_after();
      
      return this;
    },
    _create: function(){
      var that = this,
          o = that.options,
          $el = that.$el;

      var $wrapper = (this.$wrapper = $('<div></div>'))
        .addClass('keal-select-wrapper')
        .appendTo($el.parent());

      $el.appendTo($wrapper);

      var $button = (this.$button = $('<p></p>'))
        .addClass('keal-select-btn')
        .addClass(o.btnClasses || null)
        .attr({ 'id': $el.attr('id') ? $el.attr('id')  + 'KealBtn' : null })
        .appendTo($wrapper);

      var $buttonlabel = (this.$buttonlabel = $('<span />')
        .html(o.text.noneSelected)
        .attr({'title': $el.attr('title')})
        .appendTo($button));

      var $menu = (this.$menu = $('<div />')
        .addClass('keal-select-menu')
        .addClass(o.menuClasses || null)
        .appendTo($wrapper));

      if (this.$header) {
        this.$header
        .addClass(o.headerClass)
        .appendTo($menu);
      }

      // build menu
      this.refresh(true);

      if (this.$footer) {
        this.$footer.appendTo($menu)
      }

      // event bindings
      this._bindEvents();
    },
    _makeOption: function() {
      var that = this,
          o = that.options,
          $el = that.$el,
          $btn = that.$button,
          $buttonlabel = that.$buttonlabel,
          $menu = that.$menu;
      
      var $itemsWrap = (this.$itemsWrap = $('<ul />')
        .addClass('ks-menu-items-wrap')
        .appendTo($menu));

      $.each($el.find('option'), function(index, option) {
        var $option = $(option),
            isSelected = $option.attr("selected"),
            isDisabled = $option.attr('disabled');

        var $li = $('<li />')
              .addClass('ks-menu-item')
              .attr({'data-value': $option.val()})
              .appendTo($itemsWrap);
        
        if (isDisabled && isDisabled === 'disabled') $li.addClass('disabled');

        var $span = $('<p />')
              .addClass('ks-menu-item-text')
              .html($option.html())
              .attr('title', $option.html())
              .append($item_icon)
              .appendTo($li);

        if(that.$item_icon) {
          var $item_icon = that.$item_icon.clone()
                .prependTo($span);
        }
        // 初始化默认选中
        if (isSelected && isSelected === 'selected') {
          if (that.type === 'multi' || !$itemsWrap.find('.ks-menu-item-active').length) {
            that._bindItemSelected($li);
          }
        }
      });

      var $items = (that.$items = $itemsWrap.find('.ks-menu-item'));

      return this;
    },
    refresh: function(init) {
      var that = this;
      that._makeOption();
      that._position();
    },
    _bindEvents: function() {
      var that = this;

      $doc.on('mousedown', function(e){
        var target = e.target;

        if (that._isOpen && 
            target !== that.$button[0] &&
            target !== that.$menu[0] &&
            !$.contains(that.$menu[0], target) &&
            !$.contains(that.$button[0], target)
          ) {
           that.close(); 
        }
      });

      that._bindBtnEvents();
      that._bindMenuEvents();

    },
    _bindBtnEvents: function() {
      var that = this,
          $btn = that.$button,
          $menu = that.$menu;
      
      function clickHandle() {
        that[that._isOpen ? 'close' : 'open']();
      }

      $btn.on('click', clickHandle);

      return this;
    },
    _bindMenuEvents: function() {
      var that = this;

      that._bindMenuItemEvents();

      return this;
    },
    _bindMenuItemEvents: function() {
      var that = this,
          $itemsWrap = that.$itemsWrap;

      $itemsWrap.on('click', '.ks-menu-item', function() {
        var $this = $(this);
        if ($this.hasClass('disabled')) {
          return false;
        }
        that._bindItemSelected($this, that.options.selectedCb);
      });
    },
    _bindItemSelected: function($this, cb) {
      var that = this,
          $btn = that.$button,
          $buttonlabel = that.$buttonlabel,
          $itemsWrap = that.$itemsWrap,
          text = $this.find('.ks-menu-item-text').text(),
          value = $this.data('value'),
          $ops = that.$el.find('option');

      $.each($ops, function(i, op) {
        if(op.value === value) {
          op.selected = true;
        } else {
          op.selected = false;
        }
      });
      
      // 给select触发change事件
      that.$el.trigger('change');

      that.selected.val = value;
      that.selected.text = text;
      $btn.attr('data-value', value);
      $buttonlabel.text(text).attr('title', text);
      $itemsWrap.find('.ks-menu-item').removeClass('ks-menu-item-active');
      $this.addClass('ks-menu-item-active');

      that.close();

      cb && cb(that.id, that.selected);

      return this;
    },
    _bindClear: function() {
      var that = this;
      
      that.clear();
      that.options.selectedCb(that.id, that.selected);
      that.close();

      return this;
    },
    close: function() {
      var that = this,
          $btn = that.$button,
          $menu = that.$menu;

      this._isOpen = false;
      $menu.hide();
      $btn.removeClass('keal-select-btn-active');
    },
    open: function() {
      var that = this,
          $btn = that.$button,
          $menu = that.$menu;

      this._isOpen = true;
      $menu.show();
      $btn.addClass('keal-select-btn-active');
    },
    clear: function() {
      var that = this,
          options = that.options,
          $el = that.$el,
          $buttonlabel = that.$buttonlabel,
          $items = that.$items,
          $ops = that.$el.find('option');

      $items.removeClass('ks-menu-item-active');
      $buttonlabel.text(options.text.noneSelected).attr('title', options.text.noneSelected);
      
      $.each($ops, function(i, op) {
        op.selected = false;
      });

      that.selected = {};

      // 给select触发change事件
      that.$el.trigger('change');

      return true;
    },
    _position: function() {
      var that = this,
          o = that.options,
          $el = that.$el,
          $btn = that.$button,
          $menu = that.$menu,
          $itemsWrap = that.$itemsWrap;

      var width = $el.attr('width') || '';

      $btn.css({
        width: (width || $menu.outerWidth()) + 'px',
        'min-width': (width || o.minWidth) + 'px',
        'max-width': o.maxwidth
      });
      $menu.css({
        top: $btn.outerHeight() + 'px',
        width: width + 'px',
        'min-width': (width || o.minWidth) + 'px',
        'max-width': o.maxwidth
      });
    },
    _setVal: function(val, reload) {
      var that = this,
          $items = that.$itemsWrap.find('.ks-menu-item'),
          clear_status = false;

      if (typeof val === 'string') {
        for (var i = 0; i < $items.length; i++) {
          var $item = $items.eq(i);
          if ($item.data('value') === val && !$item.hasClass('ks-menu-item-active')) {
            if (!clear_status && reload) clear_status = that.clear();
            that._bindItemSelected($item);
            break;
          }
        }
      } else if (val && typeof val === 'object' && val instanceof Array && that.type === 'multi') {
        for (var j = 0; j < val.length; j++) {
          var _val = val[j];
          for (var i = 0; i < $items.length; i++) {
            var $item = $items.eq(i);
            if ($item.data('value') === _val && !$item.hasClass('ks-menu-item-active')) {
              if (!clear_status && reload) clear_status = that.clear();
              that._bindItemSelected($item);
              break;
            }
          }
        }
        
      }
    },
    _setOptions: function(o) {
      var that = this;
      $.each(o, function(key, item) {
        switch(key) {
          case 'selectedCb':
            that.options.selectedCb = item;
            break;
        }
      });

      //todo 如何重新渲染组件和绑定事件

      return this;
    },
    _bindEventsRuter: function(event, o) {
      var that = this;
      switch(event) {
        case 'setVal':
        
          break;
        
      }
      return this;
    },
    _getAttrsRuter: function(attrName) {
      var that = this,
          attr = '';
      switch(attrName) {
        case 'id':
          attr = that.id;
          break;
        case 'options':
          attr = that.options;
          break;
        case 'selected': 
          attr = that.selected;
          break;
        case 'value': 
          attr = that.selected.val || ''
          break;
      }
      return attr;
    },
    test: function() {
      var that = this;

      console.log(that.id + ': this is select');
    },
  }

  //Multi Select
  function MultiSelect(options) {
    var that = this;
    this.options = { };
    $.extend(true, that.options, options);

    that._self_init = function() {
      that.$item_icon = $('<i></i>')
        .addClass('item-icon item-icon-cb');

      that.selected = { val: [], text: [] };
      that.type = 'multi';

      var $header = (that.$header = $('<p />')
        .addClass('ks-menu-header'));

      var $selectAll = (that.$selectAll = $('<span />')
        .addClass('ks-select-all')
        .html(that.options.text.cbAll)
        .append($('<i />'))
        .appendTo($header));

      var $oprates = (that.$oprates = $('<span />')
        .addClass('ks-oprates')
        .appendTo($header));

      var $clear = (that.$clear = $('<a />')
        .addClass('ks-oprates-clear')
        .attr('href', 'javascript:;')
        .html(that.options.text.clear)
        .appendTo($oprates));

      // var $sure = (that.$sure = $('<a />')
      //   .addClass('ks-oprates-sure')
      //   .attr('href', 'javascript:;')
      //   .html(that.options.text.sure)
      //   .appendTo($oprates));

      var $footer = (that.$footer = $('<p />')
        .addClass('ks-menu-footer'));

      var $btnSure = (that.$btnSure = $('<a />')
        .addClass('ks-btn-sure')
        .attr('href', 'javascript:;')
        .html(that.options.text.btnSure)
        .appendTo($footer));

      var $btnCancel = (that.$btnCancel = $('<a />')
        .addClass('ks-btn-cancel last')
        .attr('href', 'javascript:;')
        .html(that.options.text.btnCancel)
        .appendTo($footer));
    }

    that._self_init_after = function() {
      that.$wrapper.addClass('ks-wrapper-multi');
    }

    Select.call(that, that.options);
  } 
  //继承Select的prototype
  _classExtends(Select, MultiSelect);

  $.extend(MultiSelect.prototype, {
    _bindMenuItemEvents: function() {
      var that = this,
          $itemsWrap = that.$itemsWrap;

      $itemsWrap.on('click', '.ks-menu-item', function() {
        var $this = $(this);
        if ($this.hasClass('disabled')) {
          return false;
        }
        that._bindItemSelected($this);
      });
    },
    _bindItemSelected: function($this, cb) {
      var that = this,
          $itemsWrap = that.$itemsWrap,
          text = $this.find('.ks-menu-item-text').text(),
          value = $this.data('value'),
          $ops = that.$el.find('option');
          
      if ($this.hasClass('ks-menu-item-active')) {
        $this.removeClass('ks-menu-item-active');
        $.each($ops, function(i, op) {
          if(op.value === value) {
            op.selected = false;
            // return false;
          }
        });
      } else {
        $this.addClass('ks-menu-item-active');
        $.each($ops, function(i, op) {
          if(op.value === value) {
            op.selected = true;
            // return false;
          }
        });
      }

      that.selected.text = [];
      that.selected.val = [];
      $.each($itemsWrap.find('.ks-menu-item-active'), function(index, item) {
        that.selected.text.push($(item).text());
        that.selected.val.push($(item).data('value'));
      });

      if (that.selected.val.toString() === that._getAllVal().toString()) {
        that.$selectAll.addClass('ks-select-all-active')
      } else {
        that.$selectAll.removeClass('ks-select-all-active')        
      }
      
      //给select触发change事件
      that.$el.trigger('change');

      that._btnReload();
      
      cb && cb(that.id, that.selected);

      return this;
    },
    _bindMenuEvents: function() {
      var that = this;

      that._bindMenuHearderEvents();
      that._bindMenuItemEvents();

      return this;
    },
    _bindMenuHearderEvents: function() {
      var that = this,
          $clear = that.$clear,
          $btnSure = that.$btnSure,
          $btnCancel = that.$btnCancel;

      that._bindSelectAll();

      $clear.on('click', function() {
        that._bindClear.apply(that);
      });
      $btnSure.on('click', function() {
        that._bindBtnSure.apply(that);
      });
      $btnCancel.on('click', function() {
        that._bindBtnCancel.apply(that);
      });

      return this;
    },
    _bindSelectAll: function() {
      var that = this,
          $header = that.$header,
          $selectAll = that.$selectAll,
          $items = that.$items,
          $ops = that.$el.find('option');

      $selectAll.on('click', function() {
        var $this = $(this);
        if ($this.hasClass('ks-select-all-active')) {
          $items.not('.disabled').removeClass('ks-menu-item-active');

          $.each($ops, function(i, op) {
            op.selected = false;
          });

          that.selected.val = [];
          that.selected.text = [];
          that._btnReload();
        } else {
          $items.not('.disabled').addClass('ks-menu-item-active');  

          $.each($ops, function(i, op) {
            op.selected = true;
          });

          that.selected.val = that._getAllVal(); 
          that.selected.text = that._getAllText();
          that._btnReload();
        }

        //给select触发change事件
        that.$el.trigger('change');

        $this.toggleClass('ks-select-all-active');
      });

      return this;
    },
    _bindClear: function() {
      var that = this;

      that.clear();
      that.options.selectedCb(that.id, that.selected);
      that.close();

      return this;
    },
    _bindBtnSure: function() {
      var that = this;

      that.close();
      that.options.selectedCb(that.id, that.selected);

      return this;
    },
    _bindBtnCancel: function() {
      var that = this;

      that.close();

      return this;
    },
    _getAllVal: function(isAbled) {
      var that = this,
          $options = that.$el.find('option'),
          vals = [];

      if (isAbled === undefined) {
        isAbled = true;
      } else if (typeof isAbled !== 'boolean') {
        throw('参数类型有误');
        return false;
      }

      $.each($options, function(i, item) {
        var $item = $(item);
        if (isAbled && !($item.attr('disabled') && $item.attr('disabled') === 'disabled')) {
          vals.push($item.val());
        }
      })

      return vals;
    },
    _getAllText: function(isAbled) {
      var that = this,
          $options = that.$el.find('option'),
          texts = [];

      if (isAbled === undefined) {
        isAbled = true;
      } else if (typeof isAbled !== 'boolean') {
        throw('参数类型有误');
        return false;
      }

      $.each($options, function(i, item) {
        var $item = $(item);
        if (isAbled && !($item.attr('disabled') && $item.attr('disabled') === 'disabled')) {
          texts.push($item.text());
        }
      })

      return texts;
    },
    _btnReload: function() {
      var that = this,
          $btn = that.$button,
          $buttonlabel = that.$buttonlabel,
          val_str = that.selected.val.join(','),
          text_str = that.selected.text.length ? that.selected.text.join(',') : that.options.text.noneSelected;
          
      $btn.attr('data-value', val_str);
      $buttonlabel.text(text_str).attr('title', text_str);

      return this;
    },
    clear: function() {
      var that = this,
          options = that.options,
          $el = that.$el,
          $buttonlabel = that.$buttonlabel,
          $selectAll = that.$selectAll,
          $items = that.$items,
          $ops = that.$el.find('option');

      $items.removeClass('ks-menu-item-active');
      $selectAll.removeClass('ks-menu-item-active');
      $buttonlabel.text(options.text.noneSelected).attr('title', options.text.noneSelected);
      
      $.each($ops, function(i, op) {
        op.selected = false;
      });

      that.selected.val = [];
      that.selected.text = [];
      
      //给select触发change事件
      that.$el.trigger('change');

      return true;
    },
    test: function() {
      var that = this;
      
      console.log(that.id + ': this is multi select');
    }
  });

  // KealSelect
  function KealSelect(options) {
    this.options = $.extend(true, {}, this.options);
    $.extend(true, this.options, options);
    this.$els = $(this.options.el);

    this._init();
  }

  KealSelect.prototype = {
    _init: function() {
      var that = this,
          options = that.options,
          selects = [];
      // 创建多个select实例
      $.each(that.$els, function(index, el) {
        var $el = $(el),
            multiple = $el.attr('multiple');

        $.extend(options, {$el: $el});

        if (multiple && multiple === 'multiple') {
          var select = new MultiSelect(options);
          selects.push(select);
        } else {
          var select = new Select(options);
          selects.push(select);
        }
      });
      this.selects = selects;

      return this;
    },
    _getSelect: function(selector) {
      var that = this,
      selects = that.selects,
      resules = [];
      
      _is(selector, selects,
        function(select){
          resules.push(select);
        },
        function(select) {
          resules.push(select);
        }
      );

      return resules;
    },
    bind: function(selector, event, o) {
      var that = this,
          selects = that.selects;

      if (!selector && !event && !o) {
        throw('参数不完整');
        return false;
      } else if (!event && !o) {
        if (typeof selector === 'string') {
          event = selector;
          selector = undefined;
          o = undefined;
        } else {
          throw('参数类型有误');
          return false;
        }
      } else if (!o) {
        if (typeof selector === 'string' && typeof event === 'object') {
          o = event;
          event = selector;
          selector = undefined;
        } else {
          throw('参数类型有误');
          return false;
        }
      } else if (typeof selector !== 'string' || typeof event != 'string' || !(typeof o === 'object' && !(o instanceof Array))) {
        throw('参数类型有误');
        return false;
      }

      _is(selector, selects,
        function(select){
          select._bindEventsRuter(event, o);
        },
        function(select) {
          select._bindEventsRuter(event, o);
        }
      );

      return this;
    },
    getAttr: function(selector, attr) {
      var that = this,
          selects = that.selects,
          results = {};

      if (!selector && !attr) {
        throw('参数不完整');
        return false;
      } else if (!attr) {
        if (typeof selector === 'string') {
          attr = selector;
          selector = undefined;
        } else {
          throw('参数类型有误');
          return false;
        }
      } else if (typeof selector !== 'string' || typeof attr !== 'string') {
        throw('参数类型有误');
        return false;
      }

      _is(selector, selects,
        function(select){
          results[select.id] = select._getAttrsRuter(attr);
        },
        function(select) {
          results[select.id] = select._getAttrsRuter(attr);
        }
      );

      return results;
    },
    getVal: function(selector) {
      var that = this,
          selects = that.selects,
          results = {};

      _is(selector, selects,
        function(select){
          results[select.id] = select._getAttrsRuter('value');
        },
        function(select) {
          results[select.id] = select._getAttrsRuter('value');
        }
      );
      return results;
    },
    setOptions: function(selector, o) {
      var that = this,
          selects = that.selects;

      if (!o && !selector) {
        throw('参数不完整');
        return false;
      } else if (!o) {
        if (typeof selector === 'object') {
          o = selector;
          selector = undefined;
        } else {
          throw('参数类型有误');
          return false;
        }
      } else if (typeof selector !== 'string' || !(typeof o === 'object' && !(o instanceof Array))) {
        throw('参数类型有误');
        return false;
      }

      _is(selector, selects,
        function(select){
          select._setOptions(o);
        },
        function(select) {
          select._setOptions(o);
        }
      );
    },
    setVal: function(selector, val, reload) {//reload: 是否重制select，默认为true
      var that = this,
          selects = that.selects;
        
      if (!selector && !val && reload === undefined) {
        throw('参数不完整');
        return false;
      } else if (val === undefined && reload === undefined) {
        val = selector;
        selector = undefined;
        reload = true;
      } else if (reload === undefined) {
        if (typeof val === 'boolean') {
          reload = val;
          val = selector;
          selector = undefined;
        } else {
          reload = true;          
        }
      } else if (typeof selector !== 'string' || typeof reload !== 'boolean' || typeof o === 'object' && !(o instanceof Array)) {
        throw('参数类型有误');
        return false;
      }

      _is(selector, selects,
        function(select){
          select._setVal(val, reload);
        },
        function(select) {
          select._setVal(val, reload);
        }
      );
    },
    clear: function(selector) {
      var that = this,
          selects = that.selects;

      _is(selector, selects,
        function(select){
          select._bindClear();
        },
        function(select) {
          select._bindClear();
        }
      );
    }
    
  };

  window.KealSelect = KealSelect;

}(jQuery, window));