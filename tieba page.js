// ==UserScript==
// @name         tieba page
// @namespace    http://tampermonkey.net/
// @version      0.51
// @author       fthvgb1
// @match        https://tieba.baidu.com/*
// @grant        unsafeWindow
// @description 显示手机版贴吧里被隐藏的楼层与翻页按钮
// ==/UserScript==


function t() {
    lz();
    $("ul#pblist>li").forEach(function (e) {
        f(e);
        var ee = $(e);
        var tid = ee.attr("tid");
        var content = ee.find(".list_item_top");
        var x = ee.find('.list_item_top a.j_report_btn');
        if (x && x.length > 0) {
            var kz = x[0].href.match(/tid=(\d+)\&/);
            kz = kz[1];
        }

        var floor = e.getElementsByClassName('pb_floow_load');
        if (floor.length > 0) {
            var text = floor[0].textContent;
            var url = `https://tieba.baidu.com/t/p/${tid}`;
            var num = parseInt(text.match(/\d+/));
            content.append(`<div style="text-align:center;background-color: #eee;margin: 8px 0 0 42px;"><a style="padding:12px;display:block;" href="javascript:void(0)" data-url="${url}" class="reply">查看剩余` + num + `条回复</a></div>`);
            var res = content.find('a.reply');
            var orgnum = num;
            //console.log(content,res);
            if (res) {
                res.forEach(function (v, i) {
                    var page = 2;
                    v.addEventListener('click', function () {
                        var that = this;

                        if (num === orgnum) {
                            var url = this.getAttribute('data-url');
                            //console.log();
                            $.get(url, function (rst) {
                                var dom = (new DOMParser()).parseFromString(rst, 'text/html');
                                var r = dom.querySelector('.j_floor_panel');
                                var lii = r.querySelectorAll('li');
                                lii.forEach(function (li, index) {
                                    //console.log(li.className)
                                    if (index < 2) {
                                        return;
                                    }

                                    var username = li.querySelector('.left>div .user_name').outerHTML;
                                    username = username.replace('</a>', ':</a>');
                                    var s = li.querySelector('.content span');
                                    s.className = 'floor_content';
                                    var c = li.querySelector('.content').innerHTML;
                                    var div = `
        <div class="fmain j_floor_main">
            <div class="floor_footer_item">
            ${username}
            ${c}
            </div>
        </div>`;
                                    li.innerHTML = div;
                                    var ll = document.createElement('li');
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
                            var url = `https://tieba.baidu.com/mo/q//flr?fpn=${page}&kz=${kz}&pid=${tid}&is_ajax=1&has_url_param=0&template=lzl`;
                            $.get(url, function (res) {
                                var ht = (new DOMParser()).parseFromString(res.data.floor_html, 'text/html');
                                var lii = ht.querySelectorAll('li');
                                lii.forEach(function (li, index) {
                                    var username = li.querySelector('.left>div .user_name').outerHTML;
                                    username = username.replace('</a>', ':</a>');
                                    var s = li.querySelector('.content span');
                                    s.className = 'floor_content';
                                    var c = li.querySelector('.content').innerHTML;
                                    var div = `
        <div class="fmain j_floor_main">
            <div class="floor_footer_item">
            ${username}
            ${c}
            </div>
        </div>`;
                                    li.innerHTML = div;
                                    var ll = document.createElement('li');
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
    var lz = document.querySelector('span.poster_only');
    if (lz) {
        lz.onclick = null;
        var h = location.href;
        var ff = 0;
        if (h.indexOf('see_lz=1') > -1) {
            lz.textContent = '取消只看楼主';
            h = h.replace('see_lz=1', 'see_lz=0')
            ff = 1;
        }
        lz.addEventListener('click', evt => {

            if (ff === 0) {
                h = h.indexOf('?') < 0 ? h + '?see_lz=1' : h + '&see_lz=1';
            }
            location.href = h;

        });
    }
}

function f(value) {
    var dt = JSON.parse(value.getAttribute('data-info'));
    if (dt) {
        var fl = dt.floor_num;
        var l = document.createElement('span');
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
        '.frs_daoliu_for_app', '.tl_shadow_for_app_modle',
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
            v.classList.remove('tl_shadow_for_app');
            let a = v.querySelector('a.j_enter_for_app');
            let tid = v.getAttribute('data-tid');
            a.href = url.replace(/\/(\d+)\?/.exec(url)[1], tid);
            a.classList.remove('tl_shadow_for_app');
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
        var x = document.querySelector(value);
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

(function () {
    'use strict';
    if (check()) {
        let url = location.href;

        if (/\/p\/\d+/.test(url)) {
            detail();
        }
        if (/f\?kw=.+/.test(url)) {
            list();
        }
    }


})();