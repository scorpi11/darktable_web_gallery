#!/bin/sh -ex

rm -rf  ~/.config/darktable/dtgal ~/.config/darktable/lua/contrib/web_gallery_export.lua
cp website_gallery_export.lua ~/.config/darktable/lua/contrib/
cp -a website_gallery ~/.config/darktable/lua/data/website_gallery
