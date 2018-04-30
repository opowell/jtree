This tutorial details some of the common steps to be taken when running jtree in a laboratory environment. In contrast to a field or classroom environment, in the lab you generally have prior access to the machines on which subjects will participate in the experiment. This means that they can be customized in certain ways, if so desired.

### Full-screen ("Kiosk") mode

Most browsers can be setup to run in full-screen ("Kiosk") mode. This will only show the page that the client is currently on, hide all of the usual toolbars and buttons, and disable certain keys that allow debugging and changing the window size. The following demonstrates how to setup Kiosk mode on Google Chrome for Windows. For other browsers and operating systems, see the browser's own documentation.

1. Create a shortcut to Google Chrome on your Desktop.
2. Right click this shortcut and select `Properties`.
3. Add `--kiosk http://<jtree-link>` to the end of the `Shortcut` field, where `<jtree-link>` is the participant link provided by jtree.

Make sure the browser is not already running when you are ready to start Kiosk mode. Then simply double-click the shortcut. Press `Alt-F4` or `Ctrl-W` to exit the browser. Use `Alt-Tab` to switch to another program, and the `Windows` key to open the Start Menu.

### Autostart

Most operating systems let you specify a list of applications to start automatically when the computer boots up. To start jtree automatically in Windows, do the following:

1. Press `Windows-R`.
2. Type `shell:startup` and press enter. Windows Explorer should open the "Autostart" folder.
3. Add a shortcut to open jtree in Google Chrome to this folder (see above).

Now jtree will open in Google Chrome whenever the computer starts up.
