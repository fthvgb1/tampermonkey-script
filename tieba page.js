// ==UserScript==
// @name         tieba page
// @namespace    http://tampermonkey.net/
// @version      0.76
// @author       fthvgb1
// @match        https://tieba.baidu.com/*
// @grant        GM.openInTab
// @grant        GM_xmlhttpRequest
// @description 显示手机版贴吧里被隐藏的楼层与翻页按钮
// ==/UserScript==


(function () {
    'use strict';
    let obs;

    function gif3(v) {
        let imgs = v.querySelectorAll('img.BDE_Image');
        if (imgs.length > 0) {
            imgs.forEach(img => {
                let src = img.src;
                let s = /&src=(.*)/.exec(src);
                if (s != null) {
                    let x = s.length > 0 ? s[1] : src;
                    img.src = decodeURIComponent(x);
                    img.setAttribute('data-ss', img.src);

                    img.setAttribute('data-src', src)
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
                    img.setAttribute('data-src', src);
                    img.setAttribute('data-ss', ss);
                    value.outerHTML = `<div class="pb_img_item" data-url="${ss}">${img.outerHTML}</div>`;
                }
            })
        }
        gif3(v)
    }

    function delElement(selectors) {
        selectors.forEach(value => {
            let x = document.querySelector(value);
            if (x) {
                x.parentNode.removeChild(x)
            }
        });
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

            }
            let videos = e.querySelectorAll('.video');
            if (videos.length > 0) {
                videos.forEach(video => {
                    let src = video.getAttribute('data-vhsrc');
                    let img = video.querySelector('img');
                    video.outerHTML = `<video poster="${img.src}" src="${src}" controls="controls"  style="max-width:100%;min-width:100%"></video>`;
                });
            }
            delElement(['#diversBanner', '.j_videoFootDownBtn']);
            gif(e);

            document.querySelector('#pblist').addEventListener('click', event => {
                let t = event.target;
                if (t.classList.contains('BDE_Image')) {
                    t.src = t.dataset.src;
                    obs = t
                }
            });

            let ee = $(e);
            let bt = e.querySelector('.j_nreply_btn');
            if (bt) {

            }

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
                content.append(`<div style="text-align:center;background-color: #eee;width: 50%;margin-left: 30%;"><a style="padding:12px;display:block;" href="javascript:void(0)" data-url="${url}" class="reply">还有` + num + `条回复</a></div>`);
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
                                        that.innerText = `还有${num}条回复`;
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
                                        that.innerText = `还有${num}条回复`;
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

    function createTime() {
        let url = location.href.replace('&mo_device=1', '');
        url = decodeURIComponent(url);
        if (url.indexOf('/mo/') > -1) {
            let word = /word=(.*?)&/.exec(url)[1];
            url = url.replace('mo/q/m', 'f').replace(/word=(.*?)&/, 'kw=' + word + '&');

        }
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            headers: {
                "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36'
            },
            //responseType: obj.responseType,
            onload: function (res) {

                let r = (new DOMParser()).parseFromString(res.responseText, 'text/html');
                let w = r.getElementById('pagelet_html_frs-list/pagelet/thread_list').innerHTML;
                let ul = w.replace('<!--', '').replace('-->', '');
                let u = document.createElement('div');
                u.innerHTML = ul;
                let lis = u.querySelectorAll('li.j_thread_list');
                if (lis.length > 0) {
                    lis.forEach(li => {
                        //debugger
                        let time = li.querySelector('.is_show_create_time');
                        if (!time) {
                            return
                        }
                        time = time.textContent;
                        let tid = li.dataset.tid;


                        if (tid !== null || tid !== 'null') {
                            let tar = document.querySelector('li[data-tid="' + tid + '"] .ti_author_icons');
                            if (!tar) {
                                return;
                            }

                            let d = document.createElement('span');
                            d.style.marginLeft = '1rem';
                            d.innerHTML = `<span style="color: #9999b3">${time}</span>`;
                            tar.appendChild(d)
                        }

                    })
                }
            },

        });
    }

    function list() {
        let css = document.createElement('style');
        css.innerText = `
        #frslistcontent>li:not([data-tid]):not(.tl_gap) { display:none; }
        `;
        document.querySelector('head').append(css);
        delElement([
            '.frs_daoliu_for_app', '.tl_shadow_for_app_modle', '.footer_logo', '.footer_link_highlight',
            '.appBottomPromote', '.appPromote',
        ]);
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

        createTime();


        let list = document.querySelector('#tlist');
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        let observer = new MutationObserver((mutations) => {
            if (mutations.length > 0) {
                createTime();
            }
        });

        observer.observe(list, {
            attributes: true,
            childList: true,
            characterData: true
        });

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


        document.querySelector('a[class="ui_button ui_back j_span_back"]').addEventListener('click', event => {
            obs.src = obs.dataset.ss
        });


        let css = document.createElement('style');
        css.innerText = `#pblist>li:not(.list_item) { display:none; } .ui_image_header_bottom { display:none !important; }`;
        document.querySelector('head').append(css);
        document.querySelectorAll('ul#pblist>li').forEach(value => {
            if (value.classList.contains('class_hide_flag')) {
                value.classList.remove('class_hide_flag');
            }
        });
        t();

        delElement([
            '.img_desc', '.father-cut-recommend-normal-box', '.father-cut-daoliu-normal-box',
            '#diversBanner', '.footer_logo', '.j_footer_link', '.frs_daoliu_for_app',
            '.j_videoFootDownBtn', '.appBottomPromote', '.appPromote',
        ]);


        document.querySelector('.father-cut-pager-class-no-page').classList.remove('father-cut-pager-class-no-page');

        let list = document.querySelector('ul#pblist');
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        let observer = new MutationObserver((mutations) => {
            if (mutations.length > 0) {
                t();
            }
        });

        observer.observe(list, {
            attributes: true,
            childList: true,
            characterData: true
        });


    }

    try {

        if (!check()) {
            return;
        }

        if (document.querySelector('#pblist')) {
            detail();
        }
        if (document.querySelector('#tlist')) {
            list();
        }

    } catch (e) {
        console.log(e)
    }
})();