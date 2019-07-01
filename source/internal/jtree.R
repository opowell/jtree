# jtree Copyright (C) 2019, Owen Powell
# This program comes with ABSOLUTELY NO WARRANTY
# This is free software, and you are welcome to redistribute it
# under certain conditions. See the enclosed LICENSE for details.

# Output is a list of the following data frames:
# - sessions
# - apps
# - periods
# - groups
# - players
# - participants
#
# Each data frame has the following fixed fields:
# - session: id
# - app: sessionId, id
# - group: sessionId, appId, periodId, id
# - player: sessionId, appId, periodId, groupId, id
# - participant: sessionId, id
#
########

jtree = function(
  filenames = NULL,
  sep = ",",
  jtree.silent=getOption("jtree.silent"),
  jtree.encoding=getOption("jtree.encoding"),
  ignore.errors=FALSE
) {
  if(is.null(jtree.silent))
    jtree.silent = FALSE
  if(is.null(jtree.encoding))
    jtree.encoding = 'utf-8'
  if (is.null(filenames)) {
    filenames = list.files(".",".csv",recursive=TRUE)
  }
    
  sessions = data.frame(id=NA)
  apps = data.frame(sessionId=NA, id=NA, fullPath=NA)
  groups = data.frame(sessionId=NA, appId=NA, id=NA)
  players = data.frame(sessionId=NA, appId=NA, groupId=NA, id=NA)
  participants = data.frame(sessionId=NA, appId=NA, id=NA)
  
  for (filename in filenames) {

    curTable = NULL
    curTableName = 'none'
    fileObj = file(filename,"r",encoding=jtree.encoding)
    fileContent = readLines(fileObj)
    newTable = FALSE
    for (line in fileContent) {
      # Process table name.
      if (!newTable) {
        values = strsplit(line, ' ')[[1]]
        newTableName = values[1]
        if (newTableName %in% c('SESSION', 'APP', 'GROUPS', 'PLAYERS', 'PARTICIPANTS')) {
          newTable = TRUE
        }
        
        # If starting to write a new table, store the previous one, if any.
        if (newTable) {
          if (curTableName == 'SESSION') {
            sessions = curTable
          }
          if (curTableName == 'APP') {
            apps = curTable
          }
          if (curTableName == 'GROUPS') {
            groups = curTable
          }
          if (curTableName == 'PLAYERS') {
            players = curTable
          }
          if (curTableName == 'PARTICIPANTS') {
            participants = curTable
          }
          
          curTableName = newTableName
          
          if (newTableName == 'SESSION') {
            curTable = sessions
          }
          if (newTableName == 'APP') {
            curTable = apps
            curAppId = values[2]
          }
          if (newTableName == 'GROUPS') {
            numExistingGroups = nrow(groups) - 1
            curTable = groups
          }
          if (newTableName == 'PLAYERS') {
            curTable = players
          }
          if (newTableName == 'PARTICIPANTS') {
            curTable = participants
          }
          next
        }
        # Not reading a table name, proceed.
      }

      # Process row of headers.
      if (newTable) {
        values = strsplit(line, ',')[[1]]
        curHeaders = values
        curHeaderIndices = c()
        for (i in 1:length(values)) {
          value = values[i]
          # If the header does not already exist, create it.
          if (!(value %in% colnames(curTable))) {
            curTable[value] = NA
          }
          curHeaderIndices[i] = match(value, colnames(curTable))
        }
        newTable = FALSE
        next
      }
      
      # Process row of data.
      
      # - Add extra row at end of table
      row = nrow(curTable)
      curTable[row+1,] = list(NA)

      # - Correct for commas inside square brackets.
      newline = ''
      index = 1
      bracketCount = 0
      while (index < nchar(line)) {
        curChar = substr(line, start = index, stop = index)
        if (curChar == '[') {
          bracketCount = bracketCount + 1
          newline = paste0(newline,curChar)
        } else if (curChar == ']') {
          bracketCount = bracketCount - 1
          newline = paste0(newline,curChar)
        } else {
          if (bracketCount > 0 && curChar == ',') {
            newline = paste0(newline,';')
          } else {
            newline = paste0(newline,curChar)
          }
        }
        index = index + 1
      }

      # - Fill in next to last row
      values = strsplit(newline, ',')[[1]]
      curInd = 1
      
      # - Session values
      if (curTableName == 'SESSION') {
        curSessionId = row
      }
      # - App values
      if (curTableName == 'APP') {
        curTable[row,]$sessionId = curSessionId
        curTable[row,]$id = row
        curInd = 3
        curAppId = row
      }
      # - Group values
      if (curTableName == 'GROUPS') {
        curTable[row,]$sessionId = curSessionId
        curTable[row,]$appId = curAppId
        curTable[row,]$id = row
        curInd = 4
      }
      # - Player values
      if (curTableName == 'PLAYERS') {
        curTable[row,]$sessionId = curSessionId
        curTable[row,]$appId = curAppId
        x = subset(groups, (appId == curAppId) & (period.id == values[1]) & (group.id == values[2]))
        curTable[row,]$groupId = x[1,'id']
        curTable[row,]$id = row
        curInd = 5
      }
      # - Participant values
      if (curTableName == 'PARTICIPANTS') {
        curTable[row,]$sessionId = curSessionId
        curTable[row,]$appId = curAppId
        curTable[row,]$id = row
        curInd = 4
      }
      
      for (i in 1:length(values)) {
        col = curHeaderIndices[i]
        curTable[row,col] = values[i]
      }
      
    }
    
  }
  
  output = c()
  output$sessions = sessions[1:nrow(sessions)-1,]
  output$apps = apps[1:nrow(apps)-1,]
  output$groups = groups[1:nrow(groups)-1,]
  output$players = players[1:nrow(players)-1,]
  output$participants = participants[1:nrow(participants)-1,]
  
  # output = fixCols(output)
  
  x = extractConstants(output$sessions)
  output$sessions = x$data
  output$sessionConstants = x$constants

  x = extractConstants(output$apps)
  output$apps = x$data
  output$appConstants = x$constants
  
  x = extractConstants(output$groups)
  output$groups = x$data
  output$groupsConstants = x$constants
  
  x = extractConstants(output$players)
  output$players = x$data
  output$playerConstants = x$constants
  
  x = extractConstants(output$participants)
  output$participants = x$data
  output$participantConstants = x$constants
  
  return(output)
}

extractConstants = function(data) {
  out = data.frame(V1=NA)
  nrows = nrow(data)
  for (col in colnames(data)) {
    value = data[1, col]
    valNA = is.na(value)
    match = TRUE
    for (row in 2:nrows) {
      datNA = is.na(data[row, col])
      if (datNA) {
        if (!valNA) {
          match = FALSE
          break
        }
      } else {
        if (valNA) {
          match = FALSE
          break
        } else if ((data[row, col] != value)) {
          match = FALSE
          break
        }
      }
    }
    if (match) {
      data[col] = NULL
      out[col] = value
    }
  }
  outDF = c()
  outDF$data = data
  outDF$constants = out
  return(outDF)
}

fixCols = function(out, newHeader=F) {
  i = 1
  while (i < length(out)) {
    # convert to numeric, if possible
    x = tryCatch(as.numeric(out[[i]]), warning=function(x) NULL)
    if (!is.null(x))
      out[i] = x
    
    # remove empty columns
    if (sum(is.na(out[,i]))==nrow(out)) {
      out[i] = NULL
      i = i-1
    } else {
      
      # create new column name, if required
      if (names(out)[i]!="filename" & (newHeader | names(out)[i]=="")) {
        names(out)[i] = out[!is.na(out[,i]) & out[,i] != "",i][1]
      }
    }
    i = i+1
  }
  return(out)
}
  
