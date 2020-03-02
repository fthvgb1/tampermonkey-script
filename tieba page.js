// ==UserScript==
// @name         tieba page
// @namespace    http://tampermonkey.net/
// @version      0.71
// @author       fthvgb1
// @match        https://tieba.baidu.com/*
// @grant        GM.openInTab
// @description 显示手机版贴吧里被隐藏的楼层与翻页按钮
// ==/UserScript==


(function () {
    'use strict';


    function gif3(v) {
        let imgs = v.querySelectorAll('img.BDE_Image');
        if (imgs.length > 0) {
            imgs.forEach(img => {
                let src = img.src;
                let s = /&src=(.*)/.exec(src);
                if (s != null) {
                    let x = s.length > 0 ? s[1] : src;
                    img.src = decodeURIComponent(x);
                }

            })
        }
    }

    function gif(v) {
        let imgs = v.querySelectorAll('div[data-class="BDE_Image"]');
        if (imgs.length > 0) {
            imgs.forEach(value => {
                let src = decodeURIComponent(value.getAttribute('data-url'));
                let s = /&src=(.*)/.exec(src);
                if (s != null) {
                    let ss = s[1];
                    let img = document.createElement('img');
                    img.src = (ss);
                    img.className = 'BDE_Image';
                    value.outerHTML = img.outerHTML;
                }
            })
        }
        gif3(v)
    }

    function t() {
        lz();
        $("ul#pblist>li").forEach(function (e, iii) {
            f(e);
            if (iii === 0) {
                let oo = e.querySelectorAll('.pb_img_item');
                if (oo.length > 0) {
                    oo.forEach(value => {
                        if (value.getAttribute('data-url')) {
                            value.setAttribute('data-class', 'BDE_Image');
                            value.setAttribute('src', value.getAttribute('data-url'));
                        }
                    });
                    //oo[0].parentElement.outerHTML=`<span class="wrap pbimgwapper">${oo[0].parentElement.innerHTML}</span>`
                }
                let zz = e.querySelector('#diversBanner');
                if (zz) {
                    zz.parentNode.removeChild(zz);
                }

            }
            gif(e);

            let ee = $(e);
            let tid = ee.attr("tid");
            let content = ee.find(".list_item_top");
            let x = ee.find('.list_item_top a.j_report_btn');
            let kz = 0;
            if (x && x.length > 0) {
                kz = x[0].href.match(/tid=(\d+)&/);
                kz = kz[1];
            }
            let floor = e.getElementsByClassName('pb_floow_load');
            if (floor.length > 0) {
                let text = floor[0].textContent;
                let url = `https://tieba.baidu.com/t/p/${tid}`;
                let num = parseInt(text.match(/\d+/));
                content.append(`<div style="text-align:center;background-color: #eee;margin: 8px 0 0 42px;"><a style="padding:12px;display:block;" href="javascript:void(0)" data-url="${url}" class="reply">查看剩余` + num + `条回复</a></div>`);
                let res = content.find('a.reply');
                let orgnum = num;
                //console.log(content,res);
                if (res) {
                    res.forEach(function (v, i) {
                        let page = 2;
                        v.addEventListener('click', function () {
                            let that = this;

                            if (num === orgnum) {
                                let url = this.getAttribute('data-url');
                                $.get(url, function (rst) {
                                    let dom = (new DOMParser()).parseFromString(rst, 'text/html');
                                    let r = dom.querySelector('.j_floor_panel');
                                    let lii = r.querySelectorAll('li');
                                    lii.forEach(function (li, index) {
                                        if (index < 2) {
                                            return;
                                        }
                                        let username = li.querySelector('.left>div .user_name').outerHTML;
                                        username = username.replace('</a>', ':</a>');
                                        let s = li.querySelector('.content span');
                                        s.className = 'floor_content';
                                        let c = li.querySelector('.content').innerHTML;
                                        let div = `
        <div class="fmain j_floor_main">
            <div class="floor_footer_item">
            ${username}
            ${c}
            </div>
        </div>`;
                                        li.innerHTML = div;
                                        let ll = document.createElement('li');
                                        ll.classList.add('list_item_floor');
                                        ll.classList.add('j_list_item_floor');
                                        ll.innerHTML = div;
                                        //console.log(content.find('.flist'))
                                        content.find('.flist')[0].appendChild(ll)

                                    });
                                    if (num <= 8) {
                                        that.parentNode.removeChild(that);
                                    } else {
                                        num -= 8;
                                        that.innerText = `查看剩余${num}条回复`;
                                    }
                                });
                            } else {
                                let url = `https://tieba.baidu.com/mo/q//flr?fpn=${page}&kz=${kz}&pid=${tid}&is_ajax=1&has_url_param=0&template=lzl`;
                                $.get(url, function (res) {
                                    let ht = (new DOMParser()).parseFromString(res.data.floor_html, 'text/html');
                                    let lii = ht.querySelectorAll('li');
                                    lii.forEach(function (li, index) {
                                        let username = li.querySelector('.left>div .user_name').outerHTML;
                                        username = username.replace('</a>', ':</a>');
                                        let s = li.querySelector('.content span');
                                        s.className = 'floor_content';
                                        let c = li.querySelector('.content').innerHTML;
                                        let div = `
        <div class="fmain j_floor_main">
            <div class="floor_footer_item">
            ${username}
            ${c}
            </div>
        </div>`;
                                        li.innerHTML = div;
                                        let ll = document.createElement('li');
                                        ll.classList.add('list_item_floor');
                                        ll.classList.add('j_list_item_floor');
                                        ll.innerHTML = div;
                                        //console.log(content.find('.flist'))
                                        content.find('.flist')[0].appendChild(ll)

                                    });
                                    ++page;
                                    if (num > 10) {
                                        num -= 10;
                                        that.innerText = `查看剩余${num}条回复`;
                                    } else {
                                        that.parentNode.removeChild(that);
                                    }
                                })
                            }

                        })
                    })
                }
                floor[0].parentNode.removeChild(floor[0])
            }

        });
    }

    function lz() {
        let lz = document.querySelector('span.poster_only');
        if (lz) {
            lz.onclick = null;
            let h = location.href;
            let ff = 0;
            if (h.indexOf('see_lz=1') > -1) {
                lz.textContent = '取消只看楼主';
                h = h.replace('see_lz=1', 'see_lz=0');
                ff = 1;
            }
            lz.addEventListener('click', () => {

                if (ff === 0) {
                    h = h.indexOf('?') < 0 ? h + '?see_lz=1' : h + '&see_lz=1';
                }
                location.href = h;

            });
        }
    }

    function f(value) {
        let dt = JSON.parse(value.getAttribute('data-info'));
        if (dt) {
            let fl = dt.floor_num;
            let l = document.createElement('span');
            l.style.color = 'green';
            l.textContent = fl + '楼';
            if (fl === 1) {
                l.textContent = '楼主';
            } else if (fl === 2) {
                l.textContent = '沙发';
            } else if (fl === 3) {
                l.textContent = '板凳';
            }
            value.querySelector('.list_item_time').parentNode.appendChild(l);
        }
    }

    function check() {
        let userAgentInfo = navigator.userAgent;
        let Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
        let flag = 0;
        for (let v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > -1) {
                flag = 1;
                break;
            }
        }
        return flag;
    }

    function list() {
        [
            '.frs_daoliu_for_app', '.tl_shadow_for_app_modle', '.footer_logo', '.footer_link_highlight'
        ].forEach(value => {
            let x = document.querySelector(value);
            if (x) {
                x.parentNode.removeChild(x)
            }
        });
        let ads = document.querySelectorAll('li.tl_shadow_for_app');
        if (ads.length > 0) {
            let url = document.querySelector('.tl_shadow_for_app').parentNode.querySelector('a.j_common').href;
            ads.forEach(v => {
                //v.classList.remove('tl_shadow_for_app');
                let a = v.querySelector('a.j_enter_for_app');
                let tid = v.getAttribute('data-tid');
                a.href = url.replace(/\/(\d+)\?/.exec(url)[1], tid);
                a.classList.remove('tl_shadow_for_app');
            })
        }
        let lis = document.querySelectorAll('li.tl_shadow>a[data-thread-type="0"]');
        if (lis.length > 0) {
            lis.forEach(value => {
                let url = value.href;
                value.href = 'javascript:void(0);';
                value.onclick = (v) => {
                    GM.openInTab(url, true);
                }
            })
        }


    }

    function detail() {
        document.querySelectorAll('ul#pblist>li').forEach(value => {
            if (value.classList.contains('class_hide_flag')) {
                value.classList.remove('class_hide_flag');
            }

        });
        t();

        [
            '.img_desc', '.father-cut-recommend-normal-box', '.father-cut-daoliu-normal-box',
            '#diversBanner', '.footer_logo', '.j_footer_link', '.frs_daoliu_for_app'
        ].forEach(value => {
            let x = document.querySelector(value);
            if (x) {
                x.parentNode.removeChild(x)
            }
        });


        document.querySelector('.father-cut-pager-class-no-page').classList.remove('father-cut-pager-class-no-page');


        $("#list_pager>a").on("click", function () {
            setTimeout(t, 3000);
        });
        $('.j_pager_input').blur(() => {
            setTimeout(t, 3000);
        })
    }

    try {

        if (!check()) {
            return;
        }
        let url = location.href;

        if (/\/p\/\d+/.test(url) || /kz=\d+/.test(url)) {
            detail();
        }
        if (/kw=.+/.test(url) || /word=.+/.test(url)) {
            list();
        }

    } catch (e) {
        console.log(e)
    }
})();