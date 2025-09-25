
local dt = require "darktable"
local du = require "lib/dtutils"
local df = require "lib/dtutils.file"
local dtsys = require "lib/dtutils.system"

local title_widget = dt.new_widget("entry")
{
   placeholder="slideshow title"
}

local dest_dir_widget = dt.new_widget("file_chooser_button")
{
   title = "select output folder",
   tooltip = "select output folder",
   value = "",
   is_directory = true
}

local gallery_widget = dt.new_widget("box")
{
    orientation=vertical,
    dt.new_widget("label"){label = "gallery title"},
    title_widget,
    dt.new_widget("label"){label = "destination directory"},
    dist_dir_widget
}

local compare = default_compare
local escape_special_chars = 1
local indent = 0
local out = {}

function table_count(T)
  local count = 0
  for _ in pairs(T) do count = count + 1 end
  return count
end

function escape_chars(str)
  -- Escape backslashes (I couldn't get this to work with gsub / regexes)
  local chars = {}
  for i = 1, #str do
    local cur_char = str:sub(i, i)
    if cur_char == "\\" then
      chars[#chars + 1] = "\\"
    end
    chars[#chars + 1] = cur_char
  end

  local item = table.concat(chars)
  -- Escape escape sequences (see http://www.lua.org/manual/5.1/manual.html#2.1)
  return item:gsub("[\a\b\f\n\r\t\v\\\"']", {
    ["\a"] = "\\a",
    ["\b"] = "\\b",
    ["\f"] = "\\f",
    ["\n"] = "\\n",
    ["\r"] = "\\r",
    ["\t"] = "\\t",
    ["\v"] = "\\v",
    ['"'] = '\\"',
    ["'"] = "\\'",
  })
end

function format_string(value)
  local result = escape_special_chars and escape_chars(value) or value
  emit(([["%s"]]):format(result), true)
end

local pairs_by_keys = function(tbl, compare)
  local keys = {}
  for key, _ in pairs(tbl) do
    table.insert(keys, key)
  end
  table.sort(keys, compare)
  local i = 0
  -- Return an iterator function
  return function()
    i = i + 1
    return keys[i] and keys[i], tbl[keys[i]] or nil
  end
end

function format_table(value, add_indent)
  local tbl_count = table_count(value)
  emit("{\n", add_indent)
  indent = indent + 2
  local prev_indent = indent
  local i = 1
  for k, v in pairs_by_keys(value, compare) do
    emit(('"%s": '):format(k), true)
    if type(v) == "string" then
      -- Reset indent temporarily
      indent = 0
    end
    format_value(v)
    indent = prev_indent
    if i == tbl_count then
      emit("\n")
    else
      emit(",\n")
    end
    i = i + 1
  end
  indent = indent - 2
  emit("}", true)
end

function format_array(value)
  local array_count = #value
  emit("[\n")
  indent = indent + 2
  for i, item in ipairs(value) do
    -- Also indent the following items
    format_value(item, true)
    if i == array_count then
      emit("\n")
    else
      emit(",\n")
    end
  end
  indent = indent - 2
  emit("]", true)
end

function emit(value, add_indent)
  if add_indent then
    out[#out + 1] = (" "):rep(indent)
  end
  out[#out + 1] = value
end

function format_value(value, add_indent)
  if value == nil then
    emit("null")
  end
  local _type = type(value)
  if _type == "string" then
    format_string(value)
  elseif _type == "number" then
    emit(tostring(value), add_indent)
  elseif _type == "table" then
    local count = table_count(value)
    if count == 0 then
      emit("{}")
    elseif #value > 0 then
      format_array(value)
    else
      format_table(value, add_indent)
    end
  end
end

local default_compare = function(a, b)
  return a:lower() < b:lower()
end

function pretty_print(data, compare, escape_special_chars)
  
  format_value(data)
  return table.concat(out)
end

local function get_file_name(file)
      return file:match("[^/]*.$")
end

local function build_gallery(storage, images_table, extra_data)
   if not df.check_if_bin_exists("convert") then
      dt.print_error("convert not found")
      return
   end
   if not df.check_if_bin_exists("mkdir") then
      dt.print_error("mkdir not found")
      return
   end
   
   local imageFoldername = dt.configuration.tmp_dir.."/dtgal/images/"
   df.mkdir(imageFoldername)
   
   local title = "Darktable export"
   if title_widget.text ~= "" then
      title = title_widget.text
   end
   
   local gallerydata = { name = title }
   -- local files = { "image1.jpg", "image2.jpg", "image3.jpg" }

   local images = {}
   local index = 1
   print("populate JSON images table")
   for image, filename in pairs(images_table) do
      local convertToThumbCommand = "convert -size 512x512 "..filename.." -resize 512x512 +profile \"*\" "..imageFoldername.."thumb_"..get_file_name(filename)
      dt.control.execute( convertToThumbCommand)
      df.file_move(filename, imageFoldername..get_file_name(filename))
      local entry = {filename = "images/"..get_file_name(filename), width = image.final_width, height = image.final_height}
      images[index] = entry
      index = index + 1
   end
   
   gallerydata.images = images
   
   local fileOut, errr = io.open(dt.configuration.tmp_dir.."/dtgal/images.json", 'w+')
   if fileOut then
      print("write JSON file")
      fileOut:write(pretty_print(gallerydata))
   else
      log.msg(log.error, errr)
   end

   fileOut:close()
end

local script_data = {}

script_data.metadata = {
   name = "export web gallery (new)",
   purpose = "create a web gallery from exported images",
  author = "Tino Mettler <tino+darktable@tikei.de>",
  help = "https://docs.darktable.org/lua/stable/lua.scripts.manual/scripts/contrib/TODO"
}

script_data.destroy = nil -- function to destory the script
script_data.destroy_method = nil -- set to hide for libs since we can't destroy them commpletely yet, otherwise leave as nil
script_data.restart = nil -- how to restart the (lib) script after it's been hidden - i.e. make it visible again
script_data.show = nil -- only required for libs since the destroy_method only hides them

local function destroy()
  dt.destroy_storage("module_webgallery_new")
end

local function show_status(storage, image, format, filename,
  number, total, high_quality, extra_data)
    dt.print(string.format("export image %i/%i", number, total))
end

dt.register_storage("module_webgallery_new", "export web gallery (new)", show_status, build_gallery, nil, nil, gallery_widget)

script_data.destroy = destroy

return script_data
