// Keys are bound automatically.
jt.menuDefns = [
    {
        id: 'activePanel',
        icon: 'fa fa-align-center',
        children: [
            {
                id: 'Restore',
                fn: 'jt.restorePanelEv(event);'
            },
            {
                id: 'Maximize'
            }
        ]
    },
    {
        id: 'File',
        underline: true,
        children: [
            {
                id: 'New Treatment',
                key: 'Ctrl+B',
                fn: 'jt.Panel_Treatment();'
            },
            {
                id: 'Open Treatment...',
                key: 'Ctrl+O',
                fn: 'jt.socket.emit("getAppMetadatas", "jt.showOpenTreatmentModal(message.metadatas)");'
            },
            {
                id: 'Close',
                key: 'Ctrl+L',
                fn: 'jt.closeFocussedPanel();'
            },
            'divider',
            {
                id: 'Save',
                key: 'Ctrl+S',
                fn: 'jt.saveApp();'
            }

        ]
    },
    {
        id: 'Edit',
        underline: true,
        children: [
            {
                id: 'Undo',
                key: 'Ctrl+Z',
                fn: 'jt.undo();'
            },
            'divider',
            {
                id: 'Cut',
                key: 'Ctrl+X',
                fn: 'jt.cut();'
            },
            {
                id: 'Copy',
                key: 'Ctrl+C',
                fn: 'jt.copy();'
            },
            {
                id: 'Paste',
                key: 'Ctrl+V',
                fn: 'jt.paste();'
            },
            'divider',
            {
                id: 'Find...',
                key: 'Ctrl+F',
                fn: 'jt.find();'
            },
            {
                id: 'Find Next',
                key: 'Ctrl+G',
                fn: 'jt.findNext();'
            }
        ]
    },
    {
        id: 'Treatment',
        children: [
            {
                id: 'Info',
                key: 'Ctrl+I',
                fn: 'jt.showTreatmentInfo();'
            },
            {
                id: 'View code',
                key: 'Ctrl+J',
                fn: 'jt.showFocussedTreatmentCode();'
            },
            'divider',
            {
                id: 'New Stage...',
                key: 'Ctrl+Shift+B',
                fn: 'server.appAddStage();'
            },
            {
                id: 'New Table...',
                key: 'Ctrl+??',
                fn: 'jt.copy();'
            },
            {
                id: 'New Box',
                children: [
                    {
                        id: 'Header Box...',
                        fn: 'jt.TreatmentNewHeaderBox();'
                    },
                    {
                        id: 'Standard Box...',
                        fn: 'jt.TreatmentNewStandardBox();'
                    }
                ]
            },
            'divider',
            {
                id: 'Expand All',
                key: 'Ctrl+E',
                fn: 'jt.expandAll();'
            }
        ]
    },
    {
        id: 'Run',
        children: [
            {
                id: 'Clients',
                fn: 'jt.Panel_Clients_show();'
            },
            'divider',
            {
                id: 'Shuffle Clients',
                fn: 'jt.shuffleClients();'
            },
            {
                id: 'Sort Clients',
                fn: 'jt.sortClients();'
            },
            {
                id: 'Save Client Order',
                fn: 'jt.saveClientOrder();'
            },
            'divider',
            {
                id: 'Start Treatment',
                key: 'F5',
                fn: 'jt.startTreatment();'
            },
            'divider',
            {
                id: 'globals Table',
                fn: 'jt.openGlobalsTable();'
            },
            {
                id: 'subjects Table',
                fn: 'jt.openSubjectsTable();'
            },
            {
                id: 'contracts Table',
                fn: 'jt.openContractsTable();'
            },
            {
                id: 'summary Table',
                fn: 'jt.openSummaryTable();'
            },
            {
                id: 'session Table',
                fn: 'jt.openSessionTable();'
            },
            {
                id: 'logfile Table',
                fn: 'jt.openLogFileTable();'
            }

        ]
    },
    {
        id: 'Tools',
        children: [
            {
                id: 'Info',
                fn: 'jt.undo();'
            },
            'divider',
            {
                id: 'New Stage...',
                fn: 'jt.cut();'
            },
            {
                id: 'New Table...',
                fn: 'jt.copy();'
            },
            {
                id: 'New Table Loader...',
                fn: 'jt.paste();'
            }
        ]
    },
    {
        id: 'View',
        children: [
            {
                id: 'Info',
                fn: 'jt.undo();'
            },
            'divider',
            {
                id: 'New Stage...',
                fn: 'jt.cut();'
            },
            {
                id: 'New Table...',
                fn: 'jt.copy();'
            },
            {
                id: 'New Table Loader...',
                fn: 'jt.paste();'
            }
        ]
    },
    {
        id: '?',
        children: [
            {
                id: 'About jtree...',
                fn: 'jt.about();'
            },
            {
                id: 'Keyboard shortcuts',
                key: 'Ctrl+H',
                fn: 'jt.Modal_KeyboardShortcuts_show();'
            }
        ]
    },
    {
        id: 'minPanel',
        icon: 'far fa-window-minimize'
    },
    {
        id: 'restorePanel',
        icon: 'far fa-window-restore',
        fn: 'jt.restorePanelEv(event);'
    },
    {
        id: 'closePanel',
        icon: 'far fa-window-close',
        fn: 'jt.closeFocussedPanel();'
    },

]

jt.about = function() {

}

jt.showTreatmentInfo = function() {
    var app = $('.focussed-panel').find('.jstree').data('app');
    jt.showAppPropertiesModal(app);
}

jt.showFocussedTreatmentCode = function() {
    var app = $('.focussed-panel').find('.jstree').data('app');
    jt.Modal_TreatmentCode_show(app);
}

jt.MenuEl = function(defn, focusOnHover) {
    var div = $('<div class="menu menu-active dropdown" id="menu-' + defn.id + '">');
    var textEl = $('<div class="menu-text" tabindex="-1">');

    if (defn.icon != null) {
        textEl.append('<i class="' + defn.icon + '">');
    }
    else {
        if (defn.underline != null) {
            var textElFirst = $('<div class="menu-text-first">').text(defn.id.substring(0, 1));
            var textElRest = $('<div class="menu-text-rest">').text(defn.id.substring(1));
            textEl.append(textElFirst);
            textEl.append(textElRest);
            $('#jt-menu').bind('keydown', defn.id.substring(0, 1), function(e) {
                e.preventDefault();
                if (jt.isMenuFocussed()) {
                    jt.openMenu(div);
                }
                return false;
            });
        } else {
            var textElRest = $('<div class="menu-text-rest">').text(defn.id);
            textEl.append(textElRest);
        }
    }
    div.append(textEl);

    if (defn.fn != null) {
        textEl.click(function(ev) {
            ev.stopPropagation();
            eval(defn.fn);
        });
    } else {
        if (focusOnHover === true) {
            textEl.mouseover(function(ev) {
                // Is there a menu open?
                var menuOpen = $('.menu.show').length > 0;
                var menu = $(ev.target).closest('.menu');
                if (menuOpen && !menu.hasClass('show')) {
                    $(ev.target).click();
                }
            });
        }

        textEl.click(function(ev) {
            ev.stopPropagation();
            var menu = $(ev.target).closest('.menu');
            if (menu.hasClass('show')) {
                jt.closeMenu();
            } else {
                jt.openMenu(menu);
            }
        });

        div.bind('keydown', 'left', function(e) {
            e.preventDefault();
            var menuEl = $(jt.selMenu).closest('.dropdown');
            var allMenus = $('.menu-active');
            var index = allMenus.index(menuEl[0]);
            if (index === 0) {
                index = allMenus.length-1;
            } else {
                index--;
            }
            var nextMenuEl = $(allMenus[index]).find('.menu-text');
            var isMenuOpen = menuEl.hasClass('show');
            jt.closeMenu();
            jt.focusMenuButton(nextMenuEl);
            if (isMenuOpen) {
                var menu = nextMenuEl.closest('.menu');
                jt.openMenu(menu);
                var dropdown = $(menu).find('.menu-dropdown');
                dropdown.find('.menudditem')[0].focus();
            }
            return false;
        });

        div.bind('keydown', 'right', function(e) {
            e.preventDefault();
            var menuEl = $(jt.selMenu).closest('.menu-active');
            var allMenus = $('.menu-active');
            var index = allMenus.index(menuEl[0]);
            if (index === allMenus.length-1) {
                index = 0;
            } else {
                index++;
            }
            var nextMenuEl = $(allMenus[index]).find('.menu-text');
            var isMenuOpen = menuEl.hasClass('show');
            jt.closeMenu();
            jt.focusMenuButton(nextMenuEl);
            if (isMenuOpen) {
                var menu = nextMenuEl.closest('.menu');
                jt.openMenu(menu);
                var dropdown = $(menu).find('.menu-dropdown');
                dropdown.find('.menudditem')[0].focus();
            }
            return false;
        });

        div.bind('keydown', 'down', function(e) {
            // If menu header was selected, go down into the menu
            e.preventDefault();
            if (e.target === textEl[0]) {
                var menu = $(textEl.closest('.menu'));
                jt.openMenu(menu);
                var dropdown = $(menu).find('.menu-dropdown');
                dropdown.find('.menudditem')[0].focus();
            }
            // Otherwise, move to next menu item.
            else {
                var menudditem = $($(e.target).closest('.menudditem')[0]);
                var nextEls = menudditem.nextAll('.menudditem');
                var nextMenuEl;
                if (nextEls.length > 0) {
                    nextMenuEl = nextEls[0];
                } else {
                    var els = menudditem.parent().find('.menudditem');
                    nextMenuEl = els[0];
                }
                nextMenuEl.focus();
            }
            return false;
        });

        div.bind('keydown', 'up', function(e) {
            // If menu header was selected, go down into the menu
            e.preventDefault();
                var menudditem = $($(e.target).closest('.menudditem')[0]);
                var nextEls = menudditem.prevAll('.menudditem');
                var nextMenuEl;
                if (nextEls.length > 0) {
                    nextMenuEl = nextEls[0];
                } else {
                    var els = menudditem.parent().find('.menudditem');
                    nextMenuEl = els[els.length-1];
                }
                nextMenuEl.focus();
            return false;
        });

        var dropdown = $('<div class="dropdown-menu menu-dropdown">');
        div.append(dropdown);
        for (var i in defn.children) {
            var child = defn.children[i];
            dropdown.append(jt.MenuItem(child));
        }

    }
    return $(div);
}

jt.MenuItem = function(item) {
    if (item === 'divider') {
        return $('<div class="dropdown-divider">');
    }

    var div = $('<div class="dropdown-item menudditem menu-link" tabindex="-1">');
    var textEl = $('<div class="menudditem-text">');

    if (item.icon == null) {
        item.icon = '';
    }
    textEl.append('<i class="' + item.icon + '">');
    if (item.underline != null) {
        var textElFirst = $('<div class="menu-text-first">').text(item.id.substring(0, 1));
        var textElRest = $('<div class="menu-text-rest">').text(item.id.substring(1));
        textEl.append(textElFirst);
        textEl.append(textElRest);
        // TODO: add keyboard shortcut
        // $('#jt-menu').bind('keydown', defn.id.substring(0, 1), function(e) {
        //     e.preventDefault();
        //     if (jt.isMenuFocussed()) {
        //         jt.openMenu(div);
        //     }
        //     return false;
        // });
    } else {
        var textElRest = $('<div class="menu-text-rest">').text(item.id);
        textEl.append(textElRest);
    }
    if (item.children == null) {
        div.click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            jt.closeMenu();
            eval(item.fn);
        });
    } else {
        div.click(function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var menu = $(ev.target).closest('.menudditem');
            jt.openMenuItem(menu);
        });
    }
    div.append(textEl);

    var shortcutEl = $('<div class="menudditem-shortcut">').text(item.key);
    div.append(shortcutEl);

    div.bind('keydown', 'return', function(e) {
        e.preventDefault();
        jt.closeMenu();
        eval(item.fn);
        return false;
    });

    if (item.children != null) {
        var arrow = $('<div class="menudditem-arrow">').text('>');
        div.append(arrow);
        div.mouseenter(function(ev) {
            var menu = $(ev.target).closest('.menudditem');
            jt.openMenuItem(menu);
        });
        div.click(function(ev) {
            var menu = $(ev.target).closest('.menudditem');
            jt.openMenuItem(menu);
        });
        div.mouseleave(function(ev) {
            console.log('mouseleave');
            var hoveredChild = $(ev.target).find('.menuitem-dropright').is(":hover");
            if (!hoveredChild) {
                jt.closeMenuItem();
            }
        });
        var dropdown = $('<div class="dropdown-menu menu-dropdown menuitem-dropright">');
        arrow.append(dropdown);
        for (var i in item.children) {
            var child = item.children[i];
            dropdown.append(jt.MenuItem(child));
        }
    } else {
        var arrow = $('<div class="menudditem-arrow">');
        div.append(arrow);
    }

    if (item.key != null && item.fn != null) {
        jt.bindKey(item);
    }

    return $(div);
}

$(document).click(function() {
    jt.closeMenu();
})

jt.closeMenu = function() {
    // console.log('closing menu');
    $('.menu').removeClass('show');
    $('.menu-dropdown').removeClass('show');
    $('.menu-focussed').removeClass('menu-focussed');
    jt.selMenu = null;
    if ($(document.activeElement).closest('.menu').length > 0) {
        document.activeElement.blur();
    }
    $('#jt-menu').removeClass('menubar-focussed');
}

jt.closeMenuItem = function() {
    $('.menudditem').removeClass('show');
    $('.menudditem .menu-dropdown').removeClass('show');
    $('.menudditem .menu-focussed').removeClass('menu-focussed');
    // if ($(document.activeElement).closest('.menu').length > 0) {
    //     document.activeElement.blur();
    // }
    // $('#jt-menu').removeClass('menubar-focussed');
}

jt.openMenu = function(el) {
    jt.closeMenu();
    $(el).addClass('show');
    var menuEl = $(el).find('.menu-text');
    jt.selMenu = menuEl[0];
    menuEl.addClass('menu-focussed');
    menuEl.focus();
    var dropdown = $(el).find('.menu-dropdown')[0];
    $(dropdown).addClass('show');
}

jt.openMenuItem = function(el) {
    jt.closeMenuItem();
    $(el).addClass('show');
    var menuEl = $(el).find('.menu-text');
    jt.selMenu = menuEl[0];
    menuEl.addClass('menu-focussed');
    menuEl.focus();
    var dropdown = $(el).find('.menu-dropdown')[0];
    $(dropdown).addClass('show');
}

jt.registerKeyEvents = function() {

    $(document).bind('keydown', 'alt', function(e) {
        // console.log('pressed alt');
        e.preventDefault();
        jt.toggleMainMenuFocus();
        return false;
    });

}

jt.toggleMainMenuFocus = function() {
    var focMenus = $('.menu-text.menu-focussed');
    // If a menu element has focus, close it and clear focus.
    if (focMenus.length > 0) {
        jt.closeMenu();
    }
    // If no menu is open, focus on first active menu element.
    else {
        jt.focusMenuButton($('#jt-menu .menu-active').find('.menu-text')[0]);
    }
}

jt.selMenu = null;

jt.openSelectedFile = function() {
    var file = $('#openFileDialog')[0].files[0];

    var r = new FileReader();
    r.onload = function(e) {
	    var contents = e.target.result;
        server.createAppFromFile(file.name, contents);
    }
    r.readAsText(file);
}

jt.closeFocussedPanel = function() {
    jt.closePanel($('.focussed-panel'));
}

jt.isMenuFocussed = function() {
    return $('#jt-menu').hasClass('menubar-focussed')
}

jt.focusMenuButton = function(el) {
    jt.selMenu = $(el)[0];
    $(el).addClass('menu-focussed');
    jt.selMenu.focus();
    $('#jt-menu').addClass('menubar-focussed');
}

jt.openMenuName = function(x) {
    $('#menu-' + x).click();
}
