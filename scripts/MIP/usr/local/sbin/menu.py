#!/bin/python3

# Info
# ====
#	file: menu.py
# 	name: Utility Menu Class

#	version: 1.00
# 		*version is major.minor format
# 		*major is update when new capability is added
# 		*minor is update on fixes & improvements

# History
# =======
# 	03Jan2017 v1.00
#		SSgt Czerwinski, Thomas J.
#		*Created

# Description
# ===========
#	Menu class to facilitate creating terminal menus

# Notes
# =====

from collections import OrderedDict
from subprocess import Popen, PIPE, STDOUT

class Menu:
    def __init__(self):
        self._options = OrderedDict([('x', ('Exit', None))])

    def register_option(self, selector, description, func):
        if selector == 'x':
            print("The 'x' selector is reserved for the exit function")
            return 'fail'

        self._options[selector] = (description, func)

    def present(self):
        print(self)

        opt = input()

        if opt in self._options:
            print('===============================\n')

            if opt == 'x':
                return 'exit'

            result = self._options[opt][1]()
            if result is not None:
                return result

        else:
            print('[ ERR ] Invalid Option')
            print('===============================\n')
            self.present()

    def __str__(self):
        msg = \
            '===============================\n'

        for opt in self._options:
            msg += '{}	{}\n'.format(opt, self._options[opt][0])

        msg += '-------------------------------'

        return msg
