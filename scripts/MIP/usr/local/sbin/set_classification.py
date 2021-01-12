#!/bin/python3

#
# ********************************************************************************
# *										*
# *	This  script  will handle changing the CLASSIFICATION BANNER that	*
# *	is displayed on this system.  The CLASSIFICATION BANNER files are	*
# *	located in the "/usr/local/scripts/set_classification" directory.	*
# *										*
# ********************************************************************************
#
#	History:
#
#	07-Oct-2020	ceburkhard
#	Version 3.0
#	Re-written from a BORNE shell script into PYTHON for RHEL 8.2
#
# ********************************************************************************
#

import os
import os.path
import shutil
import signal
import subprocess
import time

from common_routines import Check_Root_User, Clear_The_Screen, Execute_Command
from os import path
from subprocess import check_output


class Classification_Banner_Class:
    def __init__(self):
        self.Script_Dir = "/usr/local/scripts/set_classification"
        self.Class_File = "classification-banner-{}"
        self.level = 0
        self.Classification_Type = ""
        self.Background_Color = ""
        self.Foreground_Color = ""
        self.Version = "v3.0"
        self.Classification_Titles = [
            "unclass", "confidential", "secret", "ts", "tssci"]
        self.Classification_Colors = [
            "green", "blue", "red", "orange", "yellow"]
        self.Custom_Background = ["black", "blue", "brown", "green", "grey",
                                  "orange", "purple", "red", "white", "yellow"]
        self.Custom_Foreground = ["black", "red", "white"]
        self.Custom_Class_Message = ""
        self.Custom_Class_File = "classification-banner-custom"
        self.ETC_Classification_Banner = "/etc/classification_banner"
        self.CVAH_Logo = "/usr/local/share/pixmaps/cvah-logo.png"
        self.Share_Background = "/usr/share/backgrounds/{}-background.jpg"
        self.Boot_Background = "/boot/grub2/{}-background.jpg"
        self.Banner_Process_Name = "banner.service"

        self.Classification_Menu =                                  \
            "The current version of this script is {}.\n" + \
            "*************************************************\n" + \
            "*                                               *\n" + \
            "*          C L A S S I F I C A T I O N          *\n" + \
            "*                                               *\n" + \
            "*************************************************\n" + \
            "*                                               *\n" + \
            "*              [1]   Unclassified               *\n" + \
            "*                                               *\n" + \
            "*              [2]   Confidential               *\n" + \
            "*                                               *\n" + \
            "*              [3]   Secret                     *\n" + \
            "*                                               *\n" + \
            "*              [4]   Top Secret                 *\n" + \
            "*                                               *\n" + \
            "*              [5]   TSSCI                      *\n" + \
            "*                                               *\n" + \
            "*              [6]   Custom                     *\n" + \
            "*                                               *\n" + \
            "*              [x]   Exit                       *\n" + \
            "*                                               *\n" + \
            "*************************************************"

        self.Custom_Foreground_Color =                              \
            "*************************************************\n" + \
            "*        B A C K G R O U N D   C O L O R        *\n" + \
            "*************************************************\n" + \
            "*                                               *\n" + \
            "*              [1]   black                      *\n" + \
            "*                                               *\n" + \
            "*              [2]   red                        *\n" + \
            "*                                               *\n" + \
            "*              [3]   white                      *\n" + \
            "*                                               *\n" + \
            "*              [x]   exit                       *\n" + \
            "*                                               *\n" + \
            "*************************************************"

        self.Custom_Background_Color =                              \
            "*************************************************\n" + \
            "*        B A C K G R O U N D   C O L O R        *\n" + \
            "*************************************************\n" + \
            "*                                               *\n" + \
            "*              [0]   black                      *\n" + \
            "*                                               *\n" + \
            "*              [1]   blue                       *\n" + \
            "*                                               *\n" + \
            "*              [2]   brown                      *\n" + \
            "*                                               *\n" + \
            "*              [3]   green                      *\n" + \
            "*                                               *\n" + \
            "*              [4]   grey                       *\n" + \
            "*                                               *\n" + \
            "*              [5]   orange                     *\n" + \
            "*                                               *\n" + \
            "*              [6]   purple                     *\n" + \
            "*                                               *\n" + \
            "*              [7]   red                        *\n" + \
            "*                                               *\n" + \
            "*              [8]   white                      *\n" + \
            "*                                               *\n" + \
            "*              [9]   yellow                     *\n" + \
            "*                                               *\n" + \
            "*              [X]   exit                       *\n" + \
            "*                                               *\n" + \
            "*************************************************"

        file = open("{}/sysname".format(self.Script_Dir), "r")
        Line = file.read()
        self.Sys_Name = Line.replace('\n', '')
        file.close()

    def Classification_Error(self, Error_Text: str):
        print(Error_Text)
        input("Press Enter to exit")
        return False

    def Classification_File_Missing(self):
        Classification_File = self.Class_File.format(self.Classification_Type)
        Classification_File_Full = "{}/{}".format(
            self.Script_Dir, Classification_File)
        if path.exists(Classification_File_Full) == False:
            return self.Classification_Error(
                "Configuration file {} is missing.".format(Classification_File_Full))

        return self.Background_File_Missing()

    def run(self):
        return self.Classification_File_Missing()

    def Background_File_Missing(self):
        Background_File = "{}/{}-{}.jpg".format(
            self.Script_Dir, self.Sys_Name, self.Background_Color)
        if path.exists(Background_File) == False:
            return self.Classification_Error(
                "Background color file {} is missing".format(Background_File))
        return self.Copy_And_Create_Classification_Files()

    def Classification_Copy_File(self, Input: str, Output: str):
        try:
            shutil.copyfile(Input, Output)
        except BaseException:
            print("Error copying file {} to file {}".format(Input, Output))

    def Copy_And_Create_Classification_Files(self):
        Classification_File = self.Class_File.format(self.Classification_Type)
        Input_File = "{}/{}".format(self.Script_Dir, Classification_File)
        Output_File = self.ETC_Classification_Banner
        self.Classification_Copy_File(Input_File, Output_File)
        Input_File = "{}/cvah-logo-{}.png".format(
            self.Script_Dir, self.Background_Color)
        Output_File = self.CVAH_Logo
        self.Classification_Copy_File(Input_File, Output_File)
        Input_File = "{}/{}-{}.jpg".format(self.Script_Dir,
                                           self.Sys_Name, self.Background_Color)
        Output_File = self.Share_Background.format(self.Sys_Name)
        try:
            os.remove(Output_File)
        except BaseException:
            pass
        try:
            os.symlink(Input_File, Output_File)
        except BaseException:
            return self.Classification_Error(
                "Cannot symlink file {} to file {}".format(
                    Input_File, Output_File))
        Output_File = self.Boot_Background.format(self.Sys_Name)
        self.Classification_Copy_File(Input_File, Output_File)
        self.Restart_Classification_Banner()
        return True

    def Restart_Classification_Banner(self):
        # Starts and enables banner service
        try:
            cmd = "sudo systemctl list-unit-files grep banner.service"
            cmd_output = Execute_Command(cmd.split()).stdout.split()
            if "disabled" in cmd_output:
                start_banner = "sudo systemctl start banner.service"
                enable_banner = "sudo systemctl enable banner.service"
                subprocess.Popen(start_banner.split(), stdout=subprocess.PIPE)
                subprocess.Popen(enable_banner.split(), stdout=subprocess.PIPE)
                time.sleep(1)
        except Exception as e:
            print(e)
            return self.Classification_Error(
                "Cannot start {}".format(
                    self.Banner_Process_Name))

        # Restarts banner service
        try:
            cmd = "sudo systemctl restart banner.service"
            subprocess.Popen(cmd.split(), stdout=subprocess.PIPE)
        except Exception as e:
            return self.Classification_Error(
                "Cannot stop current classification process")
        return True

    def Set_GSETTINGS(self):
        command = 'gsettings set org.gnome.desktop.background picture-uri "none"'.split()
        set_none = Execute_Command(command)
        time.sleep(1)
        if set_none.returncode != 0:
            return self.Classification_Error(
                'Failed to execute {}'.format(set_none))

        Output_File = self.Share_Background.format(self.Sys_Name)

        su = 'su - {} -c'.format(os.getusername())
        command = '"gsettings set org.gnome.desktop.background picture-uri "file://{}""'.format(
            Output_File).split()
        set_bkgrnd = subprocess.Popen([su, command])

        if set_bkgrnd.returncode != 0:
            return self.Classification_Error(
                'Failed to execute {}'.format(command))

        print(
            "Classification banner & background successfully changed to {}".format(
                self.Classification_Type))
        return True

    def Custom_Classification(self):
        Clear_The_Screen()
        print(self.Custom_Background_Color)
        Background_Color_Select = input(
            "Please select a custom background color: ")
        if Background_Color_Select >= '0' and Background_Color_Select <= '9':
            Number = int(Background_Color_Select)
            self.Background_Color = self.Custom_Background[Number]

        elif Background_Color_Select == 'X' or Background_Color_Select == 'x':
            return True

        else:
            return self.Classification_Error(
                "Selection of background color '{}' is not known.". format(Background_Color_Select))

        Clear_The_Screen()
        print(self.Custom_Foreground_Color)
        Foreground_Color_Select = input(
            "Please choose a custom foreground (test) color: ")
        if Foreground_Color_Select >= '1' and Foreground_Color_Select <= '3':
            Number = int(Foreground_Color_Select) - 1
            self.Foreground_Color = self.Custom_Foreground[Number]

        elif Foreground_Color_Select == 'X' or Foreground_Color_Select == 'x':
            return True

        else:
            return self.Classification_Error(
                "Selection of foreground color '{}' is not known.". format(Foreground_Color_Select))

        print("Please enter the classification level message (i.e. UNCLASSIFIED//FOUO):")
        self.Custom_Class_Message = input("? )")

        Custom_File = open("{}/{}".format(self.Script_Dir,
                                          self.Custom_Class_File), "w")
        Custom_File.write("[global]\n")
        Custom_File.write("message='{}'\n".format(self.Custom_Class_Message))
        Custom_File.write("fgcolor='{}'\n".format(self.Foreground_Color))
        Custom_File.write("bgcolor='{}'\n".format(self.Background_Color))
        Custom_File.write("face='liberation-sans'\n")
        Custom_File.write("size='small'\n")
        Custom_File.write("weight='bold'\n")
        Custom_File.write("show_top=True\n")
        Custom_File.write("show_bottom=False\n")
        Custom_File.close()
        self.Classification_Type = "custom"

        return True

    def Standard_Classification(self):
        Clear_The_Screen()
        print(self.Classification_Menu.format(self.Version))
        Classification = input("Please select a classification level: ")
        if Classification >= '1' and Classification <= '5':
            Number = int(Classification) - 1
            self.Classification_Type = self.Classification_Titles[Number]
            self.Background_Color = self.Classification_Colors[Number]

        elif Classification == '6':
            self.Custom_Classification()

        elif Classification.lower() == 'x':
            return False

        else:
            self.Classification_Error(
                "Selection of '{}' is not known.".format(Classification))
        if not self.run():
            print('Classification setup failed.')
        return True


def Set_Classification():
    if not Check_Root_User():
        print("You must be ROOT to run this script.")

    else:
        Set_Class_Banner = Classification_Banner_Class()
        while(Set_Class_Banner.Standard_Classification()):
            pass


def main():
    Set_Classification()


if __name__ == "__main__":
    main()
