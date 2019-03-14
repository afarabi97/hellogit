"""
This script takes the creates a self-extracting zip archive for Windows.

It takes a list of files, zips them into an archive, and then concatenates that archive with
an extractor file into an executable.
"""
__author__ = 'Warren Couvillion'

from zipfile import ZipFile
import argparse
from os import remove, getpid
from os.path import basename, isfile
from uuid import uuid4


parser = argparse.ArgumentParser(description = "Build a self-extracting zip archive")
parser.add_argument('-d', '--dest', '--destination', 
  help='<Required> self-extracting archive name', required=True)
parser.add_argument('-f', '--files', nargs='+', help='<Required>file list', required=True)
parser.add_argument('-x', '--extractor', default='unz552xn.exe', help='self-extractor file')
try:
  args=parser.parse_args()
except:
  exit(1)

outerArchiveName = args.dest
if outerArchiveName[-4:] != '.exe':
  outerArchiveName += '.exe'

files = [ f for f in args.files if isfile(f) ]
extractorName = args.extractor

innerArchiveName = 'files.{}.zip'.format(str(uuid4()))

#Create the inner archive
with ZipFile(innerArchiveName, 'w') as archive:
  for f in files:
    archive.write(f, basename(f))

#Concatenate inner archive and extractor file
with open(outerArchiveName, 'wb') as archive:
  with open(extractorName, 'rb') as extractor:
    archive.write(extractor.read())
  with open(innerArchiveName, 'rb') as innerArchive:
    archive.write(innerArchive.read())

#Delete inner archive
remove(innerArchiveName)
