// ==UserScript==
// @name         tieba page
// @namespace    https://github.com/fthvgb1/tampermonkey-script
// @version      0.986
// @author       fthvgb1
// @match        https://tieba.baidu.com/*
// @match        https://tiebac.baidu.com/*
// @match        http://tieba.baidu.com/*
// @grant        GM.openInTab
// @grant        GM_xmlhttpRequest
// @description  显示手机版贴吧里被隐藏的楼层与翻页按钮,回贴，顺便拦点儿广告
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

    function gp() {
        let tttid = '';
        let xxjj = $('html').html();
        let pp = /tid: (\d+)/.exec(xxjj);
        tttid = pp[1];
        let fo_name = /forum_name: "(.*?)"/.exec(xxjj)[1];
        document.querySelector('#pblist').addEventListener('click', event => {
            let t = event.target;

            if (t.nodeName !== 'IMG') {
                return
            }
            if (t.classList.contains('BDE_Image')) {
                t.src = t.dataset.src;
                obs = t
            }

            let imgs = $(t).parents('#pb_imgs_div');
            if (imgs.length > 0) {
                let ff = decodeURIComponent(t.src).split('/');
                let c = ff[ff.length - 1].split('.')[0];

                location.href = `/mo/q/album?word=${fo_name}&tid=${tttid}}&template=slide_image&img_quality=100&click_url=${c}`;

                event.stopPropagation();
                event.preventDefault();

            }


        }, true);
    }


    function replayPage(res, el, call) {
        let ht = (new DOMParser()).parseFromString(res.data.floor_html, 'text/html');
        let lii = ht.querySelectorAll('li');
        let x = [];
        lii.forEach(function (li, index) {
            let uuu = li.querySelector('.left>div .user_name');
            let ct = li.querySelector('.user_name + p').innerText;
            let info = JSON.parse(li.dataset.info);
            let username = uuu.outerHTML;
            username = username.replace('</a>', `</a> : <span style="color: #8fa391">${ct}</span>`).replace('javascript:;', `/home/main?un=${info.un}`);
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
            ll.setAttribute('data-info', li.dataset.info);
            x.push(ll);
        });
        if (call) {
            call(x);
        }
        x.forEach(v => {
            el.appendChild(v);
        });

    }

    function tpage(tot, el, call) {
        tot = parseInt(tot);
        let d = document.createElement('div');
        d.classList.add('pagexx');
        d.style.cssText = 'text-align: center;';
        let a = document.createElement('a');
        a.href = 'javascript:void(0)';
        a.innerText = '<';
        let i = document.createElement('input');
        d.append(a);
        a.style.cssText = `
        height: 20px;
    line-height: 20px;
    display: inline-block;
    text-align: center;
    color: #fff;
    width: 20px;
    background-color: rgba(0,0,0,.3);
    `;
        let r = a.cloneNode(true);
        a.classList.add('l');
        [a, r].forEach(v => {
            v.addEventListener('click', ev => {
                let r = parseInt(i.dataset.r);
                if (v.classList.contains('r') && r < tot) {
                    ppage(r + 1);
                }
                if (v.classList.contains('l') && r > 1) {
                    ppage(r - 1);
                }

            });
        });
        d.appendChild(a);
        d.appendChild(i);
        d.appendChild(r);
        el.parentNode.appendChild(d);
        r.innerText = '>';
        r.classList.add('r');
        i.style.width = '60px';
        i.style.margin = '0 6px';
        i.style.textAlign = 'center';
        i.type = 'text';
        i.value = '1/' + tot;
        i.dataset.o = tot;
        i.dataset.r = '1';

        function ppage(page) {
            i.dataset.r = page;
            i.type = 'text';
            i.value = page + '/' + tot;
            el.innerHTML = '';
            if (call) {
                call(page);
            }
        }

        i.addEventListener('click', ev => {
            i.value = '';
            i.type = 'number';
            i.step = '1';
            i.min = '1';
        });
        i.addEventListener('keyup', ev => {
            if (ev.key === 'Enter') {
                i.blur();
            }
        });
        i.addEventListener('blur', ev => {
            let page = parseInt(i.value);
            if (page > 0 && page <= tot) {
                ppage(page);
            } else {
                i.type = 'text';
                i.value = i.dataset.r + '/' + tot;
            }
        })
    }

    function lo(reference, target) {
        //因为我们会将目标元素的边框纳入递归公式中，这里先减去对应的值
        let result = {
            left: -target.clientLeft,
            top: -target.clientTop
        };
        let node = target;
        while (node !== reference && node !== document) {
            result.left = result.left + node.offsetLeft + node.clientLeft;
            result.top = result.top + node.offsetTop + node.clientTop;
            node = node.parentNode;
        }
        if (isNaN(reference.scrollLeft)) {
            result.right = document.documentElement.scrollWidth - result.left;
            result.bottom = document.documentElement.scrollHeight - result.top;
        } else {
            result.right = reference.scrollWidth - result.left;
            result.bottom = reference.scrollHeight - result.top;
        }
        return result;
    }

    function t() {
        lz();
        gp();

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
            let ee = $(e);
            let tid = ee.attr("tid");
            let x = ee.find('.list_item_top a.j_report_btn');
            let kz = 0;
            if (x && x.length > 0) {
                kz = x[0].href.match(/tid=(\d+)&/);
                kz = kz[1];
            }
            let floor = e.getElementsByClassName('pb_floow_load');
            if (floor.length > 0) {
                let a = floor[0];
                let text = floor[0].textContent;
                let url = `/t/p/${tid}`;
                let num = parseInt(text.match(/\d+/)[0]);
                a.innerText = `还有${num}条回复`;
                a.dataset.url = url;
                a.classList.remove('j_enter_lzl_daoliu');
                $(a).unbind('click');
                let orgnum = num;
                let page = 2;
                let tot = Math.ceil(orgnum / 10);
                let el = a.previousElementSibling;
                a.addEventListener('click', function () {
                    let that = this;
                    if (num === orgnum) {
                        let url = this.getAttribute('data-url');
                        $.get(url, function (rst) {
                            replayPage({data: {floor_html: rst}}, el, ls => {
                                ls.splice(0, 2)
                            });
                            if (num <= 8) {
                                that.parentNode.removeChild(that);
                            } else {
                                num -= 8;
                                that.innerText = `还有${num}条回复`;
                                if (orgnum > 20) {
                                    a.style.display = 'none';
                                    tpage(tot, el, (page) => {
                                        if (a.style.display !== 'none') {
                                            a.style.display = 'none';
                                        }
                                        let url = `/mo/q//flr?fpn=${page}&kz=${kz}&pid=${tid}&is_ajax=1&has_url_param=0&template=lzl`;
                                        $.get(url, res => {
                                            replayPage(res, el);
                                            let l = lo(document, el);
                                            window.scrollTo({top: l.top - 20, left: 0, behavior: "smooth"});
                                        })
                                    });
                                }
                            }
                        });
                    } else {
                        let url = `/mo/q//flr?fpn=${page}&kz=${kz}&pid=${tid}&is_ajax=1&has_url_param=0&template=lzl`;
                        $.get(url, function (res) {
                            replayPage(res, el);
                            let i = el.parentNode.querySelector('.pagexx input');
                            if (i) {
                                i.dataset.r = `${page}`;
                                i.type = 'text';
                                i.value = page + '/' + tot;
                            }
                            ++page;
                            if (num > 10) {
                                num -= 10;
                                that.innerText = `还有${num}条回复`;
                            } else {
                                that.parentNode.removeChild(that);
                            }
                        })
                    }
                });
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
        return navigator.userAgent.toLowerCase().indexOf('mobile') > -1;
    }

    function createTime() {
        let url = location.href.replace('&mo_device=1', '');

        if (url[url.length - 1] === '&') {
            url = url + 'tab=main&'
        }
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
            onload: function (res) {

                let r = (new DOMParser()).parseFromString(res.responseText, 'text/html');
                let w = r.getElementById('pagelet_html_frs-list/pagelet/thread_list').innerHTML;
                let ul = w.replace('<!--', '').replace('-->', '');
                let u = document.createElement('div');
                u.innerHTML = ul;
                let lis = u.querySelectorAll('li.j_thread_list');

                if (lis.length > 0) {
                    lis.forEach(li => {
                        let time = li.querySelector('.is_show_create_time');
                        if (!time) {
                            return
                        }
                        time = time.textContent;
                        let tid = li.dataset.tid;
                        if (tid !== null || tid !== 'null') {
                            let tar = document.querySelector('li[data-tid="' + tid + '"] .ti_author_icons');
                            let ttt = document.querySelector('li[data-tid="' + tid + '"] .ti_time');
                            if (!tar) {
                                return;
                            }

                            ttt.innerHTML = li.querySelector('span[class="tb_icon_author_rely j_replyer"]').title.split(':')[1] + '&nbsp;&nbsp;' + ttt.innerHTML;

                            let d = document.createElement('span');
                            d.style.marginLeft = '1rem';
                            d.style.color = '#9999b3';
                            d.innerText = time;
                            tar.appendChild(d);
                        }
                    })
                }
            },

        });
    }


    function list() {
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

    function god() {
        let targetNode = document.querySelector("#glob");
        let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        window.onpopstate = e => {
            if (targetNode.style.visibility === 'hidden' && window.hhxx === 1) {
                targetNode.style.visibility = 'visible';
                window.hhxx = 0;
            }
        };

        let observer = new MutationObserver((mutations) => {
            let m = mutations[0];
            if (m.target.style.display === 'none') {
                setTimeout(() => {
                    m.target.style.display = 'block';
                    m.target.style.visibility = 'hidden';
                    window.hhxx = 1;
                }, 300);
            }
        });
        let observerOptions = {
            attributes: true,
            attributeFilter: ['style']
        };
        observer.observe(targetNode, observerOptions);

        (new MutationObserver(m => {
            if (m[0].addedNodes.length > 0) {
                let n = m[0].addedNodes[0];
                n.parentNode.removeChild(n);
            }

        })).observe(document.querySelector('#po_list'), {
            childList: true,
        });

    }

    function detail() {

        god();
        document.querySelector('a[class="ui_button ui_back j_span_back"]').addEventListener('click', event => {
            obs.src = obs.dataset.ss
        });

        reply();


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
            t();
        });

        observer.observe(list, {
            attributes: true,
            childList: true,
            characterData: true
        });


    }

    let book;
    let svgss;
    function clickControl() {

        let el = ['list_item_top_name', 'j_new_header_reply', 'list_item_user_wrap', 'user_img', 'user_name', 'icon_tieba_edit', 'reply_num', 'for_app_label_text_tag'];
        document.querySelector('body').addEventListener('click', ev => {
            for (let i in el) {
                if (ev.target.classList.contains(el[i])) {
                    ev.stopPropagation();
                    ev.preventDefault();
                }
            }

            if (ev.target.tagName === 'svg') {
                if ([...svgss].indexOf(ev.target.parentNode)) {
                    return;
                }
                ev.stopPropagation();
                ev.preventDefault();
                if (ev.target.innerHTML.indexOf('remind_on') > -1) {
                    location.href = '/mo/q/msg'
                }
                if (ev.target.innerHTML.indexOf('topbar_search') > -1) {
                    location.href = '/mo/q/searchpage'
                }
            }

            if (ev.target.tagName === 'A' && ev.target.classList.contains('notice')) {
                ev.stopPropagation();
                ev.preventDefault();
                location.href = '/mo/q/msg';
            }

            if (ev.target.tagName === 'A' && ev.target.className === 'item comment itemonly') {
                ev.stopPropagation();
                ev.preventDefault();
            }

            if (ev.target.classList.contains('j_new_header_reply')) {
                F.use('spb/widget/normal_post_list', function (threadList) {
                    if (!window.xxLL) {
                        window.xxLL = new threadList(window.conxx)
                    }
                    window.xxLL.floorReply(ev);
                });
            }

            if (ev.target.classList.contains('user_img')) {
                ev.stopPropagation();
                ev.preventDefault();
                let name = $(ev.target).parents('li').find('span.user_name').text();
                location.href = `/home/main?un=${name}`;
            }
            let ii;
            if (ev.target.tagName === 'IMG' && (ii = ev.target.parentNode, ii.classList.contains('ti_avatar'))) {
                ev.stopPropagation();
                ev.preventDefault();
                location.href = ii.dataset.url;
            }

            if (ev.target.classList.contains('user_name')) {
                ev.stopPropagation();
                ev.preventDefault();
                location.href = `/home/main?un=${ev.target.innerText}`;
            }
            if (ev.target.tagName === 'SPAN' && ev.target.classList.contains('forumname')) {
                ev.preventDefault(), ev.stopPropagation();
                if (ev.target.innerText.lastIndexOf('吧') === ev.target.innerText.length - 1) {
                    ev.target.innerText = ev.target.innerText.substring(0, ev.target.innerText.length - 1)
                }
                location.href = `/f?kw=${ev.target.innerText}&pn=0&`;

            }
            if (ev.target.tagName === 'SPAN' && (ev.target.classList.contains('createtime') || ev.target.classList.contains('ti_time') || ev.target.classList.contains('ti_author'))) {
                ev.stopPropagation();
                ev.preventDefault();
            }
            if (ev.target.tagName === 'SPAN' && ev.target.classList.contains('btn_icon')) {
                ev.stopPropagation();
                ev.preventDefault();
            }

            if (ev.target.tagName === 'SPAN' && ev.target.classList.contains('message')) {
                ev.stopPropagation();
                ev.preventDefault();
                location.href = '/mo/q/msg';
            }

            if (ev.target.classList.contains('j_like')) {
                ev.stopPropagation();
                ev.preventDefault();
                let a = /function\(SignArrow\)\{(.*?)\}\)\;\}\)/.exec($('html').html())[1].replace('new SignArrow', '');
                let _sl = (new Function(a + ';return _sl'))();
                F.use(['sfrs/widget/sign_arrow'], SignArrow => {
                    let sl = new SignArrow(_sl);
                    sl.likeHandle();
                });
            }

            if (ev.target.classList.contains('bookmark_icon')) {
                ev.stopPropagation();
                ev.preventDefault();
                let a = /function\(MoreNewSpinner\)\{((.*?)moreNewSpinner\.init\(\);)/.exec($('html').html())[2].replace('new MoreNewSpinner', '');
                let c = (new Function(a + ';return moreNewSpinner'))();
                F.use(['spb/widget/more_newspinner'], MoreNewSpinner => {
                    if (!book) {
                        book = new MoreNewSpinner(c);
                        book.init();
                    }
                    book.handleCollect(ev);
                });

            }

            if (ev.target.classList.contains('j_sign')) {
                ev.stopPropagation();
                ev.preventDefault();
                let a = /function\(SignArrow\)\{(.*?)\}\)\;\}\)/.exec($('html').html())[1].replace('new SignArrow', '');
                let _sl = (new Function(a + ';return _sl'))();
                F.use(['sfrs/widget/sign_arrow'], SignArrow => {
                    let sl = new SignArrow(_sl);
                    sl.signHandle();
                });
            }

            if (ev.target.tagName === 'H4' && ev.target.classList.contains('title')) {
                ev.stopPropagation();
                ev.preventDefault();
                location.href = `/home/main?un=${ev.target.innerText}`;
            }
            if (ev.target.classList.contains('icon_tieba_edit')) {
                //todo 发帖 似乎没相关的调用模块？？？
            }
            //console.log(ev.target, ev.target.tagName);

        }, true);
    }

    function reply() {
        let h = document.querySelector('html').innerHTML;
        let co = /spb\/widget\/normal_post_list', function \(threadList\) \{            new threadList\((.*?)\}\);/.exec(h);
        let con = co[1] + '}';
        let conf = (new Function("return " + con))();

        window.conxx = conf;
        window.xxLL = null;

        document.querySelectorAll('.j_nreply_btn').forEach(value => {
            value.addEventListener('click', evt => {
                evt.preventDefault();
                evt.stopPropagation();
                F.use('spb/widget/normal_post_list', function (threadList) {
                    if (!window.xxLL) {
                        window.xxLL = new threadList(conf)
                    }
                    window.xxLL.floorReply(evt);
                });

            })
        })
    }

    function fnav() {
        let d = document.createElement('div');
        d.style.cssText = `position: fixed;width: 45px;right: 10px;bottom: 50px;`;
        d.innerHTML = `
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path>
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M256 504c137 0 248-111 248-248S393 8 256 8 8 119 8 256s111 248 248 248zm0-448c110.5 0 200 89.5 200 200s-89.5 200-200 200S56 366.5 56 256 145.5 56 256 56zm20 328h-40c-6.6 0-12-5.4-12-12V256h-67c-10.7 0-16-12.9-8.5-20.5l99-99c4.7-4.7 12.3-4.7 17 0l99 99c7.6 7.6 2.2 20.5-8.5 20.5h-67v116c0 6.6-5.4 12-12 12z"></path>
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z"></path>
    </svg>

    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M290.59 192c-20.18 0-106.82 1.98-162.59 85.95V192c0-52.94-43.06-96-96-96-17.67 0-32 14.33-32 32s14.33 32 32 32c17.64 0 32 14.36 32 32v256c0 35.3 28.7 64 64 64h176c8.84 0 16-7.16 16-16v-16c0-17.67-14.33-32-32-32h-32l128-96v144c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V289.86c-10.29 2.67-20.89 4.54-32 4.54-61.81 0-113.52-44.05-125.41-102.4zM448 96h-64l-64-64v134.4c0 53.02 42.98 96 96 96s96-42.98 96-96V32l-64 64zm-72 80c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16zm80 0c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16z"></path>
    </svg>
        `;
        let svgs = svgss = d.querySelectorAll('svg');
        let f = 1;

        function dd() {
            [svgs[0], svgs[1], svgs[2]].forEach(el => {
                el.style.display = f === 1 ? 'block' : 'none'
            });
            f = f === 1 ? 2 : 1;
        }

        svgs.forEach((value, key) => {

            if (key !== 3) {
                value.style.display = 'none';
            }
            value.style.fill = 'rgba(77, 74, 210,.3)';
            value.addEventListener('click', ev => {
                switch (key) {
                    case 0:
                        location.href = '/mo/q/searchpage';
                        break;
                    case 1:
                        window.scrollTo({top: 0, left: 0, behavior: "smooth"});
                        dd();
                        break;
                    case 2:
                        window.scrollTo({top: document.documentElement.scrollHeight, left: 0, behavior: "smooth"});
                        dd();
                        break;
                    case 3:
                        dd();
                        break;

                }
            });
        });
        document.querySelector('body').appendChild(d);
    }

    try {

        if (!check()) {
            return;
        }
        fnav();
        clickControl();
        let css = document.createElement('style');
        css.textContent = `
        .class_hide_flag{display:block!important;}.father-cut-pager-class-no-page>#list_pager{visibility: visible!important;height: 44px!important;}#glob,body{margin-top: 0px!important;}.father_cut_list_class{padding-bottom: 0px!important;}.father-cut-recommend-normal-box,.father-cut-daoliu-normal-box,.fixed_bar,.pb,.frs,.no_mean,.addbodybottom,.img_desc,.top-guide-wrap,.open-style,.index-feed-cards .hot-topic,.appPromote_wrapper,.ui_image_header_bottom,.videoFooter,#diversBanner,.tb-footer-wrap,.interest-bar,.footer-wrap,.client-btn,.daoliu{display:none!important;}.tl_shadow:not([data-tid]),#pblist>li:not([data-tid]){display:none!important;}.navbar-view{top:24px!important;}.navbar-box{top:44px!important;} 
        .footer_logo,.footer-version { display:none!important} 
        .fr_list .list_item_floor  { padding-top:6px;}
        .floor_footer_item .user_name { color:#125bc7; }
        .floor_content a { color:#498bef; }     
        `;
        document.querySelector('head').append(css);

        delElement(['.ui_image_header_bottom']);

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