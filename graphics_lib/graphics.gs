// HIVE Graphics Library by Murphy

Graphics = {}
Graphics.name = "HiveGFX"
Graphics.version = "1.0.4"
Graphics.author = "murphy"
Graphics.last_updated = "2022-12-01"
Graphics.info = function()
    Logger.info("Using " + Graphics.name.bold() + " by " + Graphics.author.emphasize(Color.YELLOW))
    Logger.info("Version " + Graphics.version.bold() + " updated on " + Graphics.last_updated)
end function


Color = {}
Color.RED = "#ffb3ba"
Color.ORANGE = "#ffdfba"
Color.YELLOW = "#ffffba"
Color.GREEN = "#baffc9"
Color.BLUE = "#bae1ff"


Logger = {}
Logger.INFO_COLOR = Color.BLUE
Logger.WARN_COLOR = Color.ORANGE
Logger.ERROR_COLOR = Color.RED
Logger.info = function(text)
    print("[" + "INFO".emphasize(Logger.INFO_COLOR) + "] " + text)
end function
Logger.warn = function(text)
    print("[" + "WARN".emphasize(Logger.WARN_COLOR) + "] " + text)
end function
Logger.error = function(text)
    print("[" + "ERROR".emphasize(Logger.ERROR_COLOR) + "] " + text)
end function


string.INDENT_SIZE = 4
string.NEWLINE = char(10)
string.format = function(text)
    return self.replace("%s", text)
end function
string._format_multiline = function(pattern)
    multiline = self.split(string.NEWLINE)
    if multiline.len() > 1 then
        formatted = []
        for line in multiline
            formatted.push(pattern.format(line))
        end for
        return formatted.join(string.NEWLINE)
    end if
    return pattern.format(self)
end function
string.bold = function()
    return self._format_multiline("<b>%s</b>")
end function
string.italic = function()
    return self._format_multiline("<i>%s</i>")
end function
string.underline = function()
    return self._format_multiline("<u>%s</u>")
end function
string.strike = function()
    return self._format_multiline("<s>%s</s>")
end function
string.color = function(color)
    return self._format_multiline("<color=" + color + ">%s</color>")
end function
string.highlight = function(color=null)
    if color == null then color = Color.YELLOW
    return self._format_multiline("<mark=" + color + ">%s</mark>")
end function
string.emphasize = function(color=null)
    if color then
        return self.bold().color(color)
    else
        return self.bold()
    end if
end function
string.indent = function(size=null, delim=" ")
    if size == null then size = string.INDENT_SIZE
    padding = delim * size
    multiline = self.split(string.NEWLINE)
    if multiline.len() > 1 then
        padded_multiline = []
        for line in multiline
            padded_multiline.push(padding + line)
        end for
        return padded_multiline.join(string.NEWLINE)
    end if
    return padding + self
end function
string.header = function(color=null, pattern="--<[ %s ]>--")
    return pattern.format(self.emphasize(color))
end function
string.center = function(size, delim=" ")
    padding = size - self.len()
    left = delim * floor(padding/2)
    right = delim * ceil(padding/2)
    return left + self + right
end function
string.ljust = function(size, margin=0, delim=" ")
    padding = size - self.len()
    right = delim * (padding - margin)
    left = delim * margin
    return left + self + right
end function
string.rjust = function(size, margin=0, delim=" ")
    padding = size - self.len()
    left = delim * (padding - margin)
    right = delim * margin
    return left + self + right
end function
string.strip_tags = function()
    // TODO: Make this more robust, currently only works for outer tags
    if self.split(string.NEWLINE).len() > 1 then
        Logger.error("string.strip_tags does not work with multiple lines.")
        return self
    end if
    if self.indexOf(">") == null or self.indexOf("<") == null then
        return self
    end if
    open = false
    last_tag_loc = 0
    idx = 0
    for chr in self.values
        if chr == "<" then
            open = true
        else if chr == ">" and open then
            open = false
            last_tag_loc = idx
        else if chr == "/" then
            if idx > 0 then
                if self[idx - 1] == "<" then
                    open = false
                end if
            end if
        end if
        idx = idx + 1
    end for
    return self[last_tag_loc+1:].split("<")[0]
end function
string.raw_len = function()
    return self.strip_tags().len()
end function
string.is_ip = function()
    octets = self.trim().split(".")
    if octets.len() == 4 then
        valid = true
        for octet in octets
            num = octet.to_int()
            if num < 0 or num > 255 then
                valid = false
            end if
        end for
        return valid
    end if
    return false
end function


number.to_hex = function(pad=0)
    hex = []
    num = self
    while num != 0
        temp = num % 16
        if temp < 10 then
            hex.push(char(temp + 48))
        else
            hex.push(char(temp + 55))
        end if
        num = floor(num / 16)
    end while
    if pad > 0 then
        to_pad = pad - hex.len()
        if to_pad > 0 then
            hex = hex + ["0"*to_pad]
        end if
    end if
    hex.reverse()
    return "0x" + hex.join("")
end function


list.to_bullet = function(symbol="*", indent=0)
    output = []
    for item in self
        if typeof(item) == "list" then
            sub_dir = item.to_bullet(symbol, string.INDENT_SIZE)
            output.push(sub_dir)
        else if typeof(item) == "string" then
            output.push(symbol + " " + item)
        end if
    end for
    return output.join(string.NEWLINE).indent(indent)
end function
list.to_number_list = function(pattern="%s.", indent=0)
    output = []
    for i in range(0, self.len()-1)
        item = self[i]
        if typeof(item) == "list" then
            sub_dir = item.to_number_list(pattern, string.INDENT_SIZE)
            output.push(sub_dir)
        else if typeof(item) == "string" then
            output.push(pattern.format(str(i + 1)) + " " + item)
        end if
    end for
    return output.join(string.NEWLINE).indent(indent)
end function


Table = {}
Table.HORIZONTAL_CHAR = "―"
Table.VERTICAL_CHAR = "¦"
Table.CORNER_CHAR = "+"
Table.headings = []
Table.rows = []
Table.highlight_table = {}
Table.clear = function()
    self.headings = []
    self.rows = []
    self.highlight_table = {}
end function
Table.add_heading = function(heading)
    self.headings.push(heading)
end function
Table.set_headings = function(headings)
    if typeof(headings) != "list" then
        Logger.error("Headings should be a list")
        return null
    end if
    self.headings = headings
end function
Table.set_rows = function(rows)
    if typeof(rows) != "list" then
        Logger.error("Rows should be a list")
        return null
    end if
    self.rows = rows
end function
Table.insert_row = function(row, color=null)
    if typeof(row) != "list" then
        Logger.error("Row should be a list")
        return null
    end if
    if self.headings.len() == 0 then
        Logger.error("Headings are empty, please add a heading first.")
        return null
    end if
    if row.len() != self.headings.len() then
        Logger.error("Row size (" + row.len() + ") must be equal to heading size (" + self.headings.len() + ").")
        return null
    end if
    if color then
        idx = self.rows.len()
        self.highlight_table[idx] = color
    end if
    self.rows.push(row)
end function
Table._display_separator = function(column_sizes)
    separator = []
    for i in range(0, self.headings.len()-1)
        length = column_sizes[i]
        separator.push(self.HORIZONTAL_CHAR * length)
    end for
    return self.CORNER_CHAR + separator.join(self.CORNER_CHAR) + self.CORNER_CHAR
end function
Table._display_row = function(row, column_sizes, color=null)
    output_row = []
    for i in range(0, row.len()-1)
        length = column_sizes[i]
        text = row[i].ljust(length, 1)
        if color then
            text = text.color(color)
        end if
        output_row.push(text)
    end for
    return self.VERTICAL_CHAR + output_row.join(self.VERTICAL_CHAR) + self.VERTICAL_CHAR
end function
Table.to_string = function()
    output = []
    padding_size = 2
    column_sizes = {}
    for column in range(0, self.headings.len()-1)
        column_length = self.headings[column].raw_len() + padding_size
        if column_sizes.hasIndex(column) then
            if column_length > column_sizes[column] then
                column_sizes[column] = column_length
            end if
        else
            column_sizes[column] = column_length
        end if
    end for
    for row in self.rows
        for column in range(0, row.len()-1)
            column_length = row[column].raw_len() + padding_size
            if column_sizes.hasIndex(column) then
                if column_length > column_sizes[column] then
                    column_sizes[column] = column_length
                end if
            else
                column_sizes[column] = column_length
            end if
        end for
    end for

    // Build top border
    output.push(self._display_separator(column_sizes))
    // Build headings
    output.push(self._display_row(self.headings, column_sizes, Color.RED))
    // Build headings border
    output.push(self._display_separator(column_sizes))
    // Build rows
    idx = 0
    for row in self.rows
        color = null
        if self.highlight_table.hasIndex(idx) then
            color = self.highlight_table[idx]
        end if
        output.push(self._display_row(row, column_sizes, color))
        idx = idx + 1
    end for
    // Build bottom border
    output.push(self._display_separator(column_sizes))
    return output.join(string.NEWLINE)
end function
Table.display = function(bold=false)
    table_str = self.to_string()
    if bold then
        table_str = table_str.bold()
    end if
    print(table_str)
end function