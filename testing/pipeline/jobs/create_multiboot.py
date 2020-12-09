import sys
import os
import subprocess
import getopt

class Multiboot_Create_Class:
    def __init__(self, Arg_Path, Arg_File_Location, Arg_Device, Arg_Version):
        # These next 2 are to be set from the GIT RUNNER variable list
        self.path                  = Arg_Path
        self.file_location         = "{}/MULTIBOOT/{}/".format(Arg_File_Location, Arg_Version)
        self.Drive_Device          = Arg_Device

        self.System_Output_Log     = "/tmp/Drive_Create_Error.err"
        self.Multiboot_Image       = "{}/INITIAL_MULTIBOOT.img".format(self.file_location)
        self.EXE_List              = "{}/Additional_EXE.lst".format(self.file_location)
        self.ISO_List_UEFI         = "{}/Additional_ISO_UEFI.lst".format(self.file_location)
        self.ISO_List_Legacy       = "{}/Additional_ISO_Legacy.lst".format(self.file_location)
        self.GRUB_FILE_UEFI        = "{}/EFI/BOOT/grub.cfg".format(self.path)
        self.GRUB_FILE_LEGACY_PATH = "{}/boot/syslinux".format(self.path)
        self.GRUB_FILE_LEGACY      = "{}/syslinux.cfg".format(self.GRUB_FILE_LEGACY_PATH)
        self.GRUB_LINUX_CFG_PATH   = "{}/multiboot/menu/".format(self.path)
        self.GRUB_LINUX_CFG        = "{}/linux.cfg".format(self.GRUB_LINUX_CFG_PATH)
        self.ISO_Location          = "{}/multiboot".format(self.path)
        self.MOD_PATH              = "{}/boot/grub".format(self.path)

        self.GRUB_CFG_UEFI         = "# Menu Entry Created by CVA/H Drive Creation Pipeline\n" + \
                                     "insmod png\n"                                            + \
                                     "insmod part_msdos\n"                                     + \
                                     "insmod fat\n"                                            + \
                                     "insmod ntfs\n"                                           + \
                                     "insmod ext2\n"                                           + \
                                     "set root --label MULTIBOOT --hint hd0,msdos1\n"          + \
                                     "set timeout={}\n"                                        + \
                                     "{}\n\n"                                                  + \
                                     "if loadfont /boot/grub/fonts/unicode.pf2 ; then\n"       + \
                                     "    set gfxmode=640x480\n"                               + \
                                     "    insmod efi_gop\n"                                    + \
                                     "    insmod efi_uga\n"                                    + \
                                     "    insmod vbe\n"                                        + \
                                     "    insmod vga\n"                                        + \
                                     "    insmod gfxterm\n"                                    + \
                                     "    terminal_output gfxterm\n"                           + \
                                     "fi\n\n"                                                  + \
                                     "if background_image /boot/grub/af.png ; then\n"          + \
                                     "    set color_normal=white/black\n"                      + \
                                     "    set color_highlight=yellow/dark-gray\n"              + \
                                     "    set menu_color_highlight=yellow/black\n"             + \
                                     "else\n"                                                  + \
                                     "    set menu_color_normal=white/blue\n"                  + \
                                     "    set menu_color_highlight=yellow/black\n"             + \
                                     "fi\n\n"                                                  + \
                                     "set default={}\n\n"

        self.GRUB_REBOOT           = "menuentry \"[Reboot]\" {reboot}\n"                       + \
                                     "menuentry \"< Go back to the Main Menu\" "               + \
                                     "{configfile /EFI/BOOT/grub.cfg}\n\n"

        self.GRUB_CFG_LEGACY       = "# Menu Entry Created by CVA/H Drive Creation Pipeline\n" + \
                                     "DEFAULT Arch\n"                                          + \
                                     "PROMPT 0\n\n"                                            + \
                                     "MENU title MIP/DIP Multiboot Installer\n"                + \
                                     "INCLUDE /boot/syslinux/theme.cfg\n\n"
        self.GRUB_CFG_END          = "\n"
        self.Config_Literal        = "**********************************************************************\n"

        # NOTE: These next variables must have the same number of characters
        #       in both strings.  Ohterwise bad things happen.
        # NOTE: Special Characters (META) require the '\' in order to be
        #       process as a normal character (like the '/')
        self.MOD_ORIGINAL          = "YUMI EFI - GNU GRUB  version %s"
        self.MOD_CHANGE            = "  MIP\/DIP Multiboot Installer  "

    def Create_System_Call(self, Command):
        ret_val = os.system("{} 2>>{} 1>>{}".
                            format(Command, self.System_Output_Log, self.System_Output_Log))
        if ret_val != 0:
            print("Command \"{}\" failed\nStatus: {}".
                  format(Command, ret_val))
            print("Check file {} for details".
                  format(self.System_Output_Log))
            sys.stdout.flush()
            exit(ret_val)

    def Copy_EXE_Files(self):
        print("Creating & Copying over the BIOS Executables to MULTIBOOT.")
        sys.stdout.flush()
        self.Create_System_Call("mkdir --parent {}".
                                format(self.path))
        self.Create_System_Call("chmod -R o+w {}".
                                format(self.path))
        self.Create_System_Call("rm --recursive --force {}".
                                format(self.path))
        self.Create_System_Call("mkdir --parent {}".
                                format(self.path))
        self.Create_System_Call("cd {};tar --extract --gzip --file={}/MULTIBOOT.tgz".
                                format(self.path, self.file_location))
        with open(str(self.EXE_List), "r") as EXE:
            EXE_Line = EXE.readline()
            while EXE_Line:
                EXE_Line = EXE_Line.replace("\n", "")
                self.Create_System_Call("rsync -tr {}/{} {}{}".
                                        format(str(self.file_location), EXE_Line, self.path, EXE_Line))
                EXE_Line = EXE.readline()
        EXE.close()
        self.Create_System_Call("mkdir --parent {}".
                                format(self.GRUB_FILE_LEGACY_PATH))
        self.Create_System_Call("mkdir --parent {}".
                                format(self.GRUB_LINUX_CFG_PATH))
        self.Create_System_Call("rm -fr {} {} {}".
                                format(self.GRUB_FILE_LEGACY, self.GRUB_FILE_UEFI, self.GRUB_LINUX_CFG))
        self.LEGACY_Menu       = open(str(self.GRUB_FILE_LEGACY), "w")
        self.UEFI_Menu         = open(str(self.GRUB_FILE_UEFI), "w")
        self.GRUB_LINUX_CONFIG = open(str(self.GRUB_LINUX_CFG), "w")

    def Copy_ISO_Files_UEFI(self):
        print("Creating the UEFI GRUB Menu.")
        sys.stdout.flush()
        self.UEFI_Menu.write(self.GRUB_CFG_UEFI.format(-1, "", 0)) # TIMEOUT, addition TEST, DEFAULT

        # Currently only CLONEZILLA is here in UEFI.
        # More will be needed as other entries are added.
        with open(str(self.ISO_List_UEFI), "r") as ISO:
            ISO_Line = ISO.readline()
            while ISO_Line:
                ISO_Line = ISO_Line.strip()
                Name = ISO_Line.rsplit(".", 1)[0]
                Base = "clonezilla"
                self.Create_System_Call("mkdir --parent {}/{}/isolinux".
                                        format(self.ISO_Location, Name))
                self.Create_System_Call("rsync -tr {}/{} {}/{}".
                                        format(self.file_location, ISO_Line, self.ISO_Location, Name))
                self.Create_System_Call("rsync --recursive --times {}/{}/initrd.img {}/{}/vmlinuz {}/{}/isolinux".
                                        format(self.file_location, Base, self.file_location,
                                               Base, self.ISO_Location, Name))
                Menu_Text                                                          = \
                    "# start {}\n"                                                 + \
                    "menuentry \"Run {}\" {}\n"                                    + \
                    "    set gfxpayload=keep\n"                                    + \
                    "    loopback loop /multiboot/{}/{}\n"                         + \
                    "    linux /multiboot/{}/isolinux/vmlinuz "                    + \
                    "iso-scan/filename=/multiboot/{}/{} "                          + \
                    "boot=live noprompt components config "                        + \
                    "toram=live,syslinux,EFI,boot,.disk,utils "                    + \
                    "findiso=/multiboot/{}/{}\n"                                   + \
                    "    echo \"Loading {} - This may take several seconds...\"\n" + \
                    "    initrd /multiboot/{}/isolinux/initrd.img\n"               + \
                    "{}\n"                                                         + \
                    "# end {}\n"
                self.UEFI_Menu.write(Menu_Text.
                                     format(ISO_Line, Name, "{", Name, ISO_Line, Name, Name,
                                            ISO_Line, Name, ISO_Line, Base, Name, "}", ISO_Line))

                ISO_Line = ISO.readline()
                self.UEFI_Menu.write("\n")

        ISO.close()
        self.UEFI_Menu.write("menuentry \"[Reboot]\" {reboot}\n")

    def Copy_ISO_Files_LEGACY(self):
        print("Creating the LEGACY GRUB Menu.")
        sys.stdout.flush()
        self.LEGACY_Menu.write(self.GRUB_CFG_LEGACY)
        self.GRUB_LINUX_CONFIG.write(self.GRUB_CFG_UEFI.format(30, "", 2))
        self.GRUB_LINUX_CONFIG.write(self.GRUB_REBOOT)

        with open(str(self.ISO_List_Legacy), "r") as ISO:
            ISO_Line = ISO.readline()
            while ISO_Line:
                ISO_Line = ISO_Line.strip()
                Name = ISO_Line.rsplit(".", 1)[0]
                self.Create_System_Call("mkdir --parent {}/{}".
                                        format(self.ISO_Location, Name))
                self.Create_System_Call("chmod o+w {}/{}".
                                        format(self.ISO_Location, Name))
                self.Create_System_Call("rsync --recursive --times {}/{} {}/{}".
                                        format(self.file_location, ISO_Line,
                                               self.ISO_Location, Name))
                self.LEGACY_Menu.write("### MENU START\n")
                B_PATH="{}/{}".format(Name, ISO_Line)
                if "clonezilla" in ISO_Line.lower():
                    self.Create_System_Call("mkdir --parent {}ISO".
                                            format(self.path))
                    self.Create_System_Call("mount --options loop {}/{} {}ISO".
                                            format(self.ISO_Location, B_PATH, self.path))
                    self.Create_System_Call("rsync --recursive --times {}ISO/* {}/{}/".
                                            format(self.path, self.ISO_Location, Name))
                    self.Create_System_Call("umount {}/ISO".
                                            format(self.path))
                    self.Create_System_Call("rm --force --recursive {}ISO".
                                            format(self.path))
                    Menu_Text =                                            \
                        "LABEL - Run {}\n"                               + \
                        "MENU LABEL Run {}\n"                            + \
                        "MENU DEFAULT\n"                                 + \
                        "CONFIG /multiboot/{}/syslinux/syslinux.cfg\n"   + \
                        "APPEND /multiboot/{}/syslinux\n"
                    self.LEGACY_Menu.write(Menu_Text.
                                           format(Name, Name, Name, Name))

                    self.Create_System_Call("rm -fr {}/multiboot/{}/syslinux/syslinux.cfg".
                                            format(self.path, Name))
                    CZ_Syslinux_CFG=open("{}/multiboot/{}/syslinux/syslinux.cfg".
                                         format(self.path, Name), "w")
                    Menu_Text =	                                                                            \
                        "# Created by generate-pxe-menu and CVA/H Pipeline!\n"                            + \
                        "# Do NOT edit unless you know what you are doing!\n"                             + \
                        "# Keep those comment \"MENU DEFAULT\" and \"MENU HIDE\"! Do NOT remove them.\n"  + \
                        "# Note!!! If \"serial\" directive exists, "                                      + \
                        "it must be the first directive\n"                                                + \
                        "default /boot/syslinux/vesamenu.c32\n"                                           + \
                        "timeout 300\n"                                                                   + \
                        "prompt 0\n"                                                                      + \
                        "noescape 1\n"                                                                    + \
                        "MENU BACKGROUND /multiboot/{}/syslinux/ocswp.png\n"                              + \
                        "MENU COLOR UNSEL 7;32;41\n"                                                      + \
                        "MENU COLOR TIMEOUT_MSG 7;32;41\n"                                                + \
                        "MENU COLOR TIMEOUT 7;32;41\n"                                                    + \
                        "MENU COLOR HELP 7;32;41\n\n"                                                     + \
                        "say {}"                                                                          + \
                        "say {}, the OpenSource Clone System.\n"                                          + \
                        "say NCHC Free Software Labs, Taiwan.\n"                                          + \
                        "say clonezilla.org, clonezilla.nchc.org.tw\n"                                    + \
                        "say THIS SOFTWARE COMES WITH ABSOLUTELY NO WARRANTY! "                           + \
                        "USE AT YOUR OWN RISK!^G\n"                                                       + \
                        "say {}\n"                                                                        + \
                        "ALLOWOPTIONS 1\n\n"                                                              + \
                        "MENU TITLE clonezilla.org, clonezilla.nchc.org.tw\n\n"                           + \
                        "LABEL {} Live\n"                                                                 + \
                        "  MENU DEFAULT\n"                                                                + \
                        "  MENU LABEL {} Live (Default settings, VGA 1024x768)\n"                         + \
                        "  kernel /multiboot/{}/live/vmlinuz\n"                                           + \
                        "  append live-media-path=/multiboot/{}/live/ "                                   + \
                        "initrd=/multiboot/{}/live/initrd.img "                                           + \
                        "boot=live union=overlay username=user hostname=bionic "                          + \
                        "config quiet components noswap edd=on nomodeset noeject "                        + \
                        "locales= keyboard-layouts= "                                                     + \
                        "ocs_live_run=\"ocs-live-general\" "                                              + \
                        "ocs_live_extra_param=\"\" ocs_live_batch=\"no\" vga=791 ip= "                    + \
                        "net.ifnames=0 splash i915.blacklist=yes "                                        + \
                        "radeonhd.blacklist=yes "                                                         + \
                        "nouveau.blacklist=yes vmwgfx.enable_fbdev=1\n"                                   + \
                        "TEXT HELP\n"                                                                     + \
                        "  * Boot menu for BIOS machine\n"                                                + \
                        "  * {} live version (C) 2003-2019, NCHC, Taiwan\n"                               + \
                        "  * Disclaimer: {} comes with ABSOLUTELY NO WARRANTY\n"                          + \
                        "ENDTEXT\n"
                    CZ_Syslinux_CFG.write(Menu_Text.
                                          format(Name, self.Config_Literal, Name, self.Config_Literal, Name.upper(),
                                                 Name.upper(), Name, Name, Name, Name, Name))
                    CZ_Syslinux_CFG.close()

                    self.Create_System_Call("rm -fr {}/multiboot/menu/system.cfg".
                                            format(self.path))
                    CZ_Multi_Sys_Cfg=open("{}/multiboot/menu/system.cfg".
                                          format(self.path), "w")
                    Menu_Text                                                         = \
                        "# Menu Entry Created by YUMI & CVA/H Drive Pipeline Build\n" + \
                        "UI /boot/syslinux/vesamenu.c32\n"                            + \
                        "MENU TITLE {} Live Boot\n"                                   + \
                        "MENU TABMSG {} Live Boot\n"                                  + \
                        "MENU WIDTH 72\n"                                             + \
                        "MENU MARGIN 10\n"                                            + \
                        "MENU VSHIFT 3\n"                                             + \
                        "MENU HSHIFT 6\n"                                             + \
                        "MENU ROWS 15\n"                                              + \
                        "MENU TABMSGROW 20\n"                                         + \
                        "MENU TIMEOUTROW 22\n"                                        + \
                        "MENU color disabled 1;30;44\n"                               + \
                        "MENU color hotsel 30;47\n"                                   + \
                        "MENU color scrollbar 30;44\n"                                + \
                        "MENU color border 30;44\n"                                   + \
                        "MENU color title 1;36;44\n"                                  + \
                        "MENU color sel 7;37;40\n"                                    + \
                        "MENU color unsel 37;44\n"                                    + \
                        "MENU color help 37;40\n"                                     + \
                        "MENU color timeout_msg 37;40\n"                              + \
                        "MENU color timeout 1;37;40\n"                                + \
                        "MENU color tabmsg 31;40\n"                                   + \
                        "MENU color screen 37;40\n\n"                                 + \
                        "TIMEOUT 0\n\n"                                               + \
                        "LABEL <-- Back to Main Menu\n"                               + \
                        "CONFIG /multiboot/syslinux.cfg\n"                            + \
                        "MENU SEPARATOR\n\n"                                          + \
                        "#start {}\n"                                                 + \
                        "LABEL {}\n"                                                  + \
                        "MENU LABEL {}\n"                                             + \
                        "MENU INDENT 1\n"                                             + \
                        "CONFIG /multiboot/{}/syslinux/syslinux.cfg\n"                + \
                        "APPEND /multiboot/{}/syslinux\n"                             + \
                        "#end {}\n"
                    CZ_Multi_Sys_Cfg.write(Menu_Text.
                                           format(Name.upper(), Name.upper(), Name, Name.upper(),
                                                  Name.upper(), Name, Name, Name))
                    CZ_Multi_Sys_Cfg.close()

                elif "help" in ISO_Line.lower():
                    Menu_Text                                          = \
                        "LABEL -\n"                                    + \
                        "MENU LABEL Help!\n"                           + \
                        "LINUX /boot/syslinux/grub.exe\n"              + \
                        "APPEND --config-file=\"ls /multiboot/{} || "  + \
                        "find --set-root /multiboot/{};"               + \
                        "map --heads=0 --sectors-per-track=0 "         + \
                        "/multiboot/{} (0xff) || "                     + \
                        "map --heads=0 --sectors-per-track=0 "         + \
                        "--mem /multiboot/{} (0xff)"                   + \
                        "map --hook;chainloader (0xff)\"\n"
                    self.LEGACY_Menu.write(Menu_Text.
                            format(B_PATH, B_PATH, B_PATH, B_PATH))

                elif "fedora" in ISO_Line.lower():
                    Menu_Text                                             = \
                        "LABEL Live Boot {}\n"                            + \
                        "MENU LABEL Live Boot {}\n"                       + \
                        "KERNEL /multiboot/grub.exe\n"                    + \
                        "APPEND --config-file=/multiboot/{}/basic.lst\n"
                    self.LEGACY_Menu.write(Menu_Text.
                                           format(Name, Name, Name))

                    Menu_Text                                       = \
                        "#start {}\n"                               + \
                        "menuentry \"{}\" "                         + \
                        "{}\n"                                      + \
                        "    set gfxpayload=keep\n"                 + \
                        "    loopback loop /multiboot/{}/{}\n"      + \
                        "    linux (loop)/isolinux/vmlinuz "        + \
                        "iso-scan/filename=/multiboot/{}/{} "       + \
                        "rootfstype=auto root=live:CDLABEL={} "     + \
                        "ro rd.live.image\n"                        + \
                        "    echo \"Loading {} - "                  + \
                        "This may take several seconds...\"\n"      + \
                        "    initrd (loop)/isolinux/initrd.img\n"   + \
                        "{}\n"                                      + \
                        "#end {}\n\n"
                    self.GRUB_LINUX_CONFIG.write(Menu_Text.
                                                 format(Name, Name, "{", Name, ISO_Line, Name,
                                                        ISO_Line, Name, Name, "}", Name))

                    self.Create_System_Call("rm -fr {}/multiboot/{}/basic.lst".
                                            format(self.path, Name))
                    FEDORA_BASIC_LIST = open(str("{}/multiboot/{}/basic.lst".
                                             format(self.path, Name)), "w")
                    Menu_Text                                                    = \
                        "default 0\n"                                            + \
                        "timeout=0\n\n"                                          + \
                        "#start {}\n\n"                                          + \
                        "title Boot Fedora-lxde-31-x86_64\n"                     + \
                        "set ISO=/multiboot/{}/{}\n"                             + \
                        "find --set-root %ISO%\n\n"                              + \
                        "parttype (hd0,3) | set check=\n"                        + \
                        "set check=%check:~-5,4%\n"                              + \
                        "if \"%check%\"==\"0x00\" partnew (hd0,3) 0 0 0\n"       + \
                        "if NOT \"%check%\"==\"0x00\" "                          + \
                        "echo ERROR: Fourth partition table is not empty, "      + \
                        "please delete it if you wish to use this method && "    + \
                        "pause --wait=5 && configfile /multiboot/{}/basic.lst\n" + \
                        "partnew (hd0,3) 0x00 %ISO%\n\n"                         + \
                        "map  %ISO% (0xff)\n"                                    + \
                        "map --hook\n"                                           + \
                        "root (0xff)\n"                                          + \
                        "chainloader (0xff)\n\n"                                 + \
                        "#end {}\n"
                    FEDORA_BASIC_LIST.write(Menu_Text.
                                            format(Name, Name, ISO_Line, Name, Name))
                    FEDORA_BASIC_LIST.close()

                else:     #  Here the VMWare ESXI Images are handled.
                    if "vmware" in ISO_Line.lower():
                        if "dell" in ISO_Line.lower():
                            Label = "VMware for DELLEMC (R440)"
                        else:
                            Label = "VMware for everything else"
                        Menu_Text                                            = \
                            "LABEL - {}\n"                                   + \
                            "MENU LABEL {}\n"                                + \
                            "KERNEL /multiboot/grub.exe\n"                   + \
                            "APPEND --config-file=\"ls /multiboot/{}/{} || " + \
                            "find --set-root /multiboot/{}/{}; "             + \
                            "map --heads=0 --sectors-per-track=0 "           + \
                            "/multiboot/{}/{} (0xff) || "                    + \
                            "map --heads=0 --sectors-per-track=0 "           + \
                            "--mem /multiboot/{}/{} (0xff); "                + \
                            "map --hook;chainloader (0xff)\"\n"              + \
                            "TEXT HELP\n"                                    + \
                            "ENDTEXT\n"
                        self.LEGACY_Menu.write(Menu_Text.
                                               format(Label, Label, Name, ISO_Line, Name, ISO_Line,
                                                      Name, ISO_Line, Name, ISO_Line))

                        Menu_Text                                                          = \
                            "#start {}\n"                                                  + \
                            "menuentry \"{}\" "                                            + \
                            "{}\n"                                                         + \
                            "    set gfxpayload=keep\n"                                    + \
                            "    loopback loop /multiboot/{}/{}\n"                         + \
                            "    linux (loop)/isolinux/vmlinuz "                           + \
                            "iso-scan/filename=/multiboot/{}/{} "                          + \
                            "rootfstype=auto root=live:CDLABEL={} ro rd.live.image\n"      + \
                            "    echo \"Loading {} - This may take several seconds...\"\n" + \
                            "    initrd (loop)/isolinux/initrd.img\n"                      + \
                            "{}\n"                                                         + \
                            "#end {}\n\n"
                        self.GRUB_LINUX_CONFIG.write(Menu_Text.
                                                     format(Name, Label, "{", Name, ISO_Line, Name,
                                                            ISO_Line, Name, Name, "}", Name))

                self.LEGACY_Menu.write(self.GRUB_CFG_END)
                ISO_Line = ISO.readline()

        ISO.close()
        Menu_Text                                              = \
            "### MENU START\n"                                 + \
            "LABEL Boot from first Hard Drive\n"               + \
            "MENU LABEL Exit and boot from local hard drive\n" + \
            "KERNEL chain.c32\n"                               + \
            "APPEND hd1 1\n"                                   + \
            "### MENU END\n"
        self.LEGACY_Menu.write(Menu_Text)

    def Fix_UEFI_GRUB_Mod_Files(self):
        print("Fixing GRUB Screen Message.")
        Directories = ["i386-efi", "x86_64-efi"]
        for Directory in Directories:
            PATH = "{}/{}".format(self.MOD_PATH, Directory)
            self.Create_System_Call("cp {}/normal.mod {}/normal_original.mod".
                                    format(PATH, PATH))
            self.Create_System_Call("sed --in-place \"s/{}/{}/\" {}/normal.mod".
                                    format(self.MOD_ORIGINAL, self.MOD_CHANGE, PATH))


def Multiboot_Create(Argument_Path, Argument_File_Location, Argument_Drive_Device, Argument_Version):
    MB_Create = Multiboot_Create_Class(Argument_Path, Argument_File_Location,
                                       Argument_Drive_Device, Argument_Version)
    Return_MB_Image = MB_Create.Multiboot_Image
    os.system("rm --recursive --force {} 2>/dev/null 1>/dev/null".
              format(MB_Create.System_Output_Log))
    MB_Create.Copy_EXE_Files()
    MB_Create.Copy_ISO_Files_UEFI()
    MB_Create.Copy_ISO_Files_LEGACY()
    MB_Create.Fix_UEFI_GRUB_Mod_Files()
    MB_Create.UEFI_Menu.close()
    MB_Create.LEGACY_Menu.close()
    MB_Create.GRUB_LINUX_CONFIG.close()
    os.system("rm --recursive --force {} 2>/dev/null 1>/dev/null".
              format(MB_Create.System_Output_Log))
    return Return_MB_Image

def main():
    Multiboot_short_options = "d:f:p:"
    Multiboot_long_options = ["device=", "file_location=", "path="]
    try:
        arguments, values = getopt.getopt(sys.argv[1:], Multiboot_short_options, Multiboot_long_options)
    except getopt.error as err:
        pass

    device="/dev/sdc"
    file_location="/mnt/drive_creation/MULTIBOOT"
    path="/mnt/drive_creation/v3.5"
    for current_argument, current_value in arguments:
        if current_argument in ("-d", "--device"):
            device=current_value
        elif current_argument in ("-f", "--file_location"):
            file_location=current_value
        elif current_argument in ("-p", "--path"):
            path=current_value

    Test_MB_Image = Multiboot_Create( Argument_Path          = path,
                                      Argument_File_Location = file_location,
                                      Argument_Drive_Device  = device)

    print("MB Image: {} - ".
        format(Test_MB_Image))

if __name__ == "__main__":
    main()

