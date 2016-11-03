(function(field, factory, context) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        context[field] = factory();
    }
})("SlsModal", function() {

    //检测是否引入jquery或者zepto
    var $ = window["jQuery"] || window["Zepto"] || null;
    if (!$) {
        console.error("请引入jQuery或Zepto");
        return;
    }

    var getScrollWidth = function() {
        var noScroll, scroll, oDiv = document.createElement("DIV");
        oDiv.style.cssText = "position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;";
        noScroll = document.body.appendChild(oDiv).clientWidth;
        oDiv.style.overflowY = "scroll";
        scroll = oDiv.clientWidth;
        document.body.removeChild(oDiv);
        return noScroll - scroll;
    }

    //声明一个modal类
    var SlsModal = function() {

        //保存当前作用域
        var self = this;

        //当前弹框容器DOM对象(不是jquery对象)
        this.container = null;

        //当前版本
        this.version = "1.0.0";

        //默认参数
        this.options = {
            onShowBefore: function() {}, //显示框之前的回调
            onShowAfter: function() {}, //显示框之后的回调
            onCloseBefore: function() {}, //关闭框之前的回调
            onCloseAfter: function() {}, //关闭框之后的回调

            onClickClose: function() {}, //点击右上角x号的回调函数
            onClickBg: function() {}, //点击背景的回调函数
            onClickBtn: function() {}, //点击按钮的回调函数

            /**
             * isClickClose  是否点击关闭按钮关闭框
             * isClickBtn       是否点击按钮关闭
             * isClickBg        是否点击背景关闭
             */
            isClickClose: true,
            isClickBtn: true,
            isClickBg: true,

            isAutoClose: true,

            //默认显示右上角关闭×号
            //设为false不显示x号
            isShowClose: true,

            header: "标题是啥呢？",
            body: "您想说点什么呢？",
            footer: "",

            btns: [{
                text: '取消',
                type: 'default'
            }, {
                text: '确定',
                type: 'info'
            }],

            width: "520px",
            offsetTop: false,

            top: false
        };

        this.defaults = $.extend(true, {}, this.options);

        /**
         * 初始化默认参数
         * @param  {[object]} opts [参数对象]
         * @return {[object]}      [当前modal对象]
         */
        this.init = function(opts) {
            if (opts && typeof opts === "object") {
                this.opts = opts;
                this.defaults = $.extend(true, {}, this.options, opts);
            } else {
                this.opts = {};
            }
            // console.log(this.defaults);
            return this;
        };

        /**
         * 创建HTML结构
         * @return {[html string]} [HTML结构字符串]
         */
        this.createHtml = function() {
            var modalHtml = "";
            modalHtml += '<div class="sls-modal-container">';

            // 背景遮罩
            modalHtml += '<div class="sls-modal-bg"></div>';

            //最外层的全屏容器
            /*modalHtml += '<div class="sls-modal-relative">';
            modalHtml += '</div>';*/

            //显示框内容start
            modalHtml += '<div class="sls-modal-content">';

            //是否显示头部 statt
            if (this.defaults.header) {
                modalHtml += '<div class="sls-modal-header">';
                modalHtml += this.defaults.header;
                modalHtml += this.defaults.isShowClose ? '<span class="sls-modal-close">×</span>' : '';
                modalHtml += '</div>';
            }
            //是否显示头部 end

            //body必须显示 start
            modalHtml += '<div class="sls-modal-body">';
            modalHtml += this.defaults.body;
            modalHtml += '</div>';
            //body必须显示 end

            //是否显示底部 start
            if (this.defaults.footer || (this.defaults.btns && this.defaults.btns.constructor === Array && this.defaults.btns.length)) {
                modalHtml += '<div class="sls-modal-footer">';
                if (this.defaults.footer) {
                    modalHtml += this.defaults.footer;
                } else {
                    var btns = this.defaults.btns;
                    for (var i = 0; i < btns.length; i++) {
                        var className = 'sls-self-btn-' + btns[i].className || '';
                        modalHtml += '<span class="sls-modal-btn ' + (btns[i].type ? 'sls-modal-btn-' + btns[i].type : '') + ' ' + className + '" data-index="' + i + '">';
                        modalHtml += btns[i].text;
                        modalHtml += '</span>';
                    }
                }
                modalHtml += '</div>';
            }
            //是否显示底部 end
            modalHtml += '</div>';
            //显示框内容end


            modalHtml += '</div>';
            return modalHtml;
        };
    };

    /**
     * 给modal类挂载原型
     */
    SlsModal.prototype = {

        //还原构造器
        constructor: SlsModal,

        /**
         * 设置框的样式
         * @return {[object]} [modal对象]
         */
        setCss: function() {

            var css = {
                //最外层容器
                container: {
                    width: $(window).width() + "px",
                    height: $(window).height() + "px",
                    position: "fixed",
                    top: "0",
                    left: "0",
                    display: "none",
                    zIndex: "9999999",
                },
                //背景遮罩
                bg: {
                    width: "100%",
                    height: "100%",
                    position: "fixed",
                    top: "0",
                    left: "0",
                    background: "#000",
                    opacity: "0.75",
                },
                //和背景遮罩同层的装框的容器
                /*relative: {
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    overflowY: "auto",
                    zIndex: '100'
                },*/
                //显示框容器
                content: {
                    width: "420px",
                    height: "auto",
                    background: "#FFF",
                    borderRadius: "3px",
                    // position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    // marginTop: "80px",
                    zIndex: '101'
                },
                //显示框头部
                header: {
                    width: "100%",
                    height: "52px",
                    // borderBottom: "1px solid #ccc",
                    lineHeight: "52px",
                    textAlign: "center",
                    position: "relative",
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#333',
                    borderTopLeftRadius: '3px',
                    borderTopRightRadius: '3px'
                },
                //显示框头部上的关闭×号
                close: {
                    display: "inline-block",
                    position: "absolute",
                    top: "0",
                    right: "0",
                    width: "42px",
                    height: "42px",
                    textAlign: "center",
                    lineHeight: "42px",
                    color: "#bbb",
                    fontSize: "24px",
                    cursor: "pointer",
                    fontWeight: "bold",
                },
                //显示框body内容
                body: {
                    "padding": "20px",
                },
                //显示框底部内容
                footer: {
                    width: "100%",
                    height: "62px",
                    // borderTop: "1px solid #CCC",
                    lineHeight: "62px",
                    textAlign: 'right',
                    padding: '0px 20px',
                    borderBottomLeftRadius: '3px',
                    borderBottomRightRadius: '3px'
                },
                btn: {
                    display: 'inlineBlock',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    border: '1px solid #c0ccda',
                    color: '#1f2d3d',
                    textAlign: 'center',
                    outline: 'none',
                    margin: 0,
                    padding: '10px 15px',
                    fontSize: '14px',
                    borderRadius: '4px',
                    marginRight: '16px',
                    mozUserSelect: 'none',
                    webkitUserSelect: 'none',
                    msUserSelect: 'none',
                    background: '#fff',
                },
                'btn-info': {
                    color: '#fff',
                    backgroundColor: '#31b0d5',
                    borderColor: '#269abc',
                },
                'btn-warning': {
                    color: '#fff',
                    backgroundColor: '#ec971f',
                    borderColor: '#d58512',
                },
                'btn-danger': {
                    color: '#fff',
                    backgroundColor: '#d9534f',
                    borderColor: '#d43f3a',
                },
                'btn-success': {
                    color: '#fff',
                    backgroundColor: '#449d44',
                    borderColor: '#255625',
                }
            };
            css = $.extend(true, {}, css, this.opts.css);

            var width = this.defaults.width || null;

            if (width) {
                css.content.width = width;
            }

            for (attr in css) {
                if (css.hasOwnProperty(attr)) {
                    $('.sls-modal-' + attr).css(css[attr]);
                }
            }

            return this;
        },


        /**
         * 设置容器居中------还需要先判断一下容器的高度是否大于当前窗口的高度
         */
        setCenter: function() {
            var offsetTop = this.defaults.offsetTop ? parseInt(this.defaults.offsetTop) : 0;

            //获取显示内容的容器
            var $content = $(this.container).find(".sls-modal-content");

            //容器的，高宽和二分之一
            var contentHeight = parseInt($content.css("height"));
            var contentWidth = parseInt($content.css("width"));
            var marginLeft = -(contentWidth / 2) + "px";
            var marginTop = -((contentHeight / 2) + offsetTop) + "px";
            var top = "50%";

            if (this.defaults.top !== false && typeof this.defaults.top === 'number') {
                top = this.defaults.top + 'px';
                marginTop = '0px';
            }

            // if (contentHeight < $(window).height() - 100) {
            //设置居中
            $content.css({
                position: "absolute",
                top: top,
                left: "50%",
                marginTop: marginTop,
                marginLeft: marginLeft
            });
            // };

            return this;
        },


        /**
         * 渲染弹框DOM
         * @return {[object]} [modal对象]
         */
        render: function() {
            $("body").append(this.createHtml());
            this.container = $('.sls-modal-container').get(0);
            return this;
        },


        /**
         * 显示框
         * @return {[object]} [modal对象]
         */
        show: function(flag) {
            if ($(".sls-modal-container").length || flag) {
                this.setCss().showEvent();
                return this;
            }
            this.render().setCss().showEvent().resizeEvent();
            if (this.defaults.isAutoClose) {
                this.closeBtnEvent();
                this.btnEvent();
                this.bgCloseEvent();
            }
            return this;
        },


        /**
         * 显示事件
         * @return {[object]} [modal对象]
         */
        showEvent: function() {
            if ($("html").height() > $(window).height()) {
                var scrollWidth = getScrollWidth();
                $("body").css({
                    overflow: 'hidden',
                    paddingRight: scrollWidth + 'px'
                });
            }

            this.defaults.onShowBefore && this.defaults.onShowBefore.call(this);
            $('.sls-modal-container').show();
            this.setCenter();
            this.defaults.onShowAfter && this.defaults.onShowAfter.call(this);
            return this;
        },


        /**
         * 关闭框
         * @return {[object]} [modal对象]
         */
        close: function() {
            var modalContainer = $(".sls-modal-container");
            if (!modalContainer.length) {
                return this;
            }
            modalContainer.remove();
            $("body").css({
                overflowY: 'auto',
                paddingRight: '0px'
            });
            return this;
        },


        /**
         * 点击右上角差号关闭框
         * @return {[object]} [modal对象]
         */
        closeBtnEvent: function() {
            var self = this;
            $('.sls-modal-close').on("click", function(e) {
                if (self.defaults.isClickClose) {
                    self.defaults.onCloseBefore && self.defaults.onCloseBefore.call(self, this);
                    self.close();
                    self.defaults.onCloseAfter && self.defaults.onCloseAfter.call(self, this);
                } else {
                    self.defaults.onClickClose && self.defaults.onClickClose.call(self, this);
                }
            });
            return this;
        },


        /**
         * 点击关闭按钮关闭框
         * @return {[object]} [modal对象]
         */
        btnEvent: function() {
            var self = this;
            $('.sls-modal-btn').on("click", function(e) {
                if (self.defaults.isClickBtn) {
                    self.defaults.onCloseBefore && self.defaults.onCloseBefore.call(self, this, $(this).data('index'));
                    self.close();
                    self.defaults.onCloseAfter && self.defaults.onCloseAfter.call(self, this, $(this).data('index'));
                } else {
                    self.defaults.onClickBtn && self.defaults.onClickBtn.call(self, this, $(this).data('index'));
                }
            });
            return this;
        },


        /**
         * 点击背景关闭事件
         * @return {[object]} [modal对象]
         */
        bgCloseEvent: function() {
            var self = this;
            $('.sls-modal-bg').on("click", function(e) {
                e.stopPropagation();
                e.preventDefault();
                if (self.defaults.isClickBg) {
                    self.defaults.onCloseBefore && self.defaults.onCloseBefore.call(self, this);
                    self.close();
                    self.defaults.onCloseAfter && self.defaults.onCloseAfter.call(self, this);
                } else {
                    self.defaults.onClickBg && self.defaults.onClickBg.call(self, this);
                }
            });
            return this;
        },


        /**
         * 改变窗口大小，重新计算modal大小
         * @return {[object]} modal对象
         */
        resizeEvent: function() {
            var self = this;
            $(window).resize(function(event) {
                self.show(true);
            });
            return self;
        }
    };
    return new SlsModal();
}, this);