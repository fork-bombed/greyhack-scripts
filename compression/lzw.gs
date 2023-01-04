lzw = {}
lzw.DICT_SIZE = 256
lzw.dict = {}
lzw.str = ""
lzw.init = function()
    for i in range(0, self.DICT_SIZE - 1)
        self.dict[char(i)] = i
    end for
end function
lzw.compress = function(text)
    compressed = []
    for chr in text
        str_plus_symbol = self.str + chr
        if self.dict.hasIndex(str_plus_symbol) then
            self.str = str_plus_symbol
        else
            compressed.push(self.dict[self.str])
            if self.dict.len() <= 16000 then
                self.dict[str_plus_symbol] = self.DICT_SIZE
                self.DICT_SIZE = self.DICT_SIZE + 1
            end if
            lzw.str = chr
        end if
    end for
    if self.dict.hasIndex(self.str) then
        compressed.push(self.dict[self.str])
    end if
    raw_output = []
    for chr in compressed
        raw_output.push(char(chr))
    end for
    return raw_output.join("")
end function

get_file = function(path)
    local = get_shell.host_computer
    file = local.File(path)
    if file != null then
        return file
    end if
end function

get_file_content = function(path)
    file = get_file(path)
    if file != null then
        return file.get_content()
    end if
end function

write_file_content = function(path, content, ext="lzw")
    file = get_file(path)
    filename = file.name.split(".")[0] + "." + ext
    parent_path = file.parent.path
    get_shell.host_computer.touch(parent_path, filename)
    new_file = get_file(parent_path + "/" + filename)
    new_file.set_content(content)
end function

file_content = get_file_content(params[0])
print("Original file size: " + file_content.len())

compressor = new lzw
compressor.init()
compressed = compressor.compress(file_content)
print("Compressed file size: " + compressed.len())
reduction = (100 - ((compressed.len() / file_content.len()) * 100))
print("File reduced by " + round(reduction, 2) + "%")
write_file_content(compressed)