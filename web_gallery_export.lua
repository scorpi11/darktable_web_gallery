--[[
   TODO:
   - JS: touch support https://medium.com/codex/image-slider-using-vanilla-html-css-and-javascript-b95c7fe16955 https://github.com/briquet9/image-slider/tree/main
   - Lua: remove dir if already existent
   - Lua: use share_dir once available in the API
   - Lua: implement "supported" callback to limit export to suited file formats
   - JS: implement zoom function as present in PhotoSwipe
   - Lua: export thumbnail images instead of using imagemagigk/convert
   - JS: fix transition of modal image view to not show old images when fading in
   - JS: change JSON loading to avoid browser warning
   - Lua: translations
   - copyright headers
]]

local dt = require "darktable"
local df = require "lib/dtutils.file"
local json_pretty_print = require "lib/json_pretty_print"

local temp = dt.preferences.read('web_gallery', 'title', 'string')
if temp == nil then temp = 'Darktable gallery' end
print("title: "..temp)

local title_widget = dt.new_widget("entry")
{
   text = temp
}

local temp = dt.preferences.read('web_gallery', 'destination_dir', 'string')
if temp == nil then temp = '' end

local dest_dir_widget = dt.new_widget("file_chooser_button")
{
   title = "select output folder",
   tooltip = "select output folder",
   value = temp,
   is_directory = true,
   changed_callback = function(this) dt.preferences.write('web_gallery', 'destination_dir', 'string', this.value) end
}

local gallery_widget = dt.new_widget("box")
{
    orientation=vertical,
    dt.new_widget("label"){label = "gallery title"},
    title_widget,
    dt.new_widget("label"){label = "destination directory"},
    dest_dir_widget
}

local function get_file_name(file)
      return file:match("[^/]*.$")
end

local function build_gallery(storage, images_table, extra_data)
   if not df.check_if_bin_exists("convert") then
      dt.print_error("convert not found")
      return
   end
   
   local imageFoldername = dest_dir_widget.value.."/images/"
   df.mkdir(imageFoldername)
   
   local title = "Darktable export"
   if title_widget.text ~= "" then
      title = title_widget.text
   end

   local images_ordered = extra_data["images"] -- process images in the correct order
   
   local gallerydata = { name = title }

   local images = {}
   local index = 1
   print("populate JSON images table")
   for i, image in pairs(images_ordered) do
      local filename = images_table[image]
      local convertToThumbCommand = "convert -size 512x512 "..filename.." -resize 512x512 +profile \"*\" "..imageFoldername.."thumb_"..get_file_name(filename)
      dt.control.execute( convertToThumbCommand)
      df.file_move(filename, imageFoldername..get_file_name(filename))
      local entry = {filename = "images/"..get_file_name(filename), width = image.final_width, height = image.final_height}
      images[index] = entry
      index = index + 1
   end
   
   gallerydata.images = images
   
   local fileOut, errr = io.open(dest_dir_widget.value.."/images.json", 'w+')
   if fileOut then
      print("write JSON file")
      fileOut:write(json_pretty_print:pretty_print(gallerydata))
   else
      log.msg(log.error, errr)
   end

   fileOut:close()
   gfsrc = dt.configuration.config_dir
   gfiles = {
      "index.html",
      "gallery.css",
      "gallery.js",
      "fullscreen.js"
   }

   for _, file in ipairs(gfiles) do
      df.file_copy(gfsrc.."/"..file, dest_dir_widget.value.."/"..file)
   end
end

local script_data = {}

script_data.metadata = {
   name = "export web gallery (new)",
   purpose = "create a web gallery from exported images",
  author = "Tino Mettler <tino+darktable@tikei.de>",
  help = "https://docs.darktable.org/lua/stable/lua.scripts.manual/scripts/contrib/TODO"
}

script_data.destroy_method = nil -- set to hide for libs since we can't destroy them commpletely yet, otherwise leave as nil
script_data.restart = nil -- how to restart the (lib) script after it's been hidden - i.e. make it visible again
script_data.show = nil -- only required for libs since the destroy_method only hides them

local function destroy()
   print("destroy: write title "..title_widget.text)
   dt.preferences.write('web_gallery', 'title', 'string', title_widget.text)
   dt.destroy_storage("module_webgallery")
end
script_data.destroy = destroy

local function show_status(storage, image, format, filename,
  number, total, high_quality, extra_data)
    dt.print(string.format("export image %i/%i", number, total))
end

local function initialize(storage, img_format, images, high_quality, extra_data)
   print("init: write title "..title_widget.text)
   dt.preferences.write('web_gallery', 'title', 'string', title_widget.text)
   extra_data["images"] = images -- needed, to preserve images order
end

dt.register_storage("module_webgallery", "Web gallery", show_status, build_gallery, nil, initialize, gallery_widget)

return script_data
