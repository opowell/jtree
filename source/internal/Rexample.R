# Clean the workspace
rm(list = ls())

# The path to the folder containing the jtree output files (*.csv).
WORK_DIR = "~/GitHub/jtree_080"

# Set working directory and load jtree functions.
setwd(WORK_DIR)
source(paste0(WORK_DIR, "/jtree.R"))

## BASIC COMMAND
jtData = jtree()
# Reads all .csv files in the current working folder and all subfolders.
# Output is stored in the following data frames:
# $sessions
# $sessionConstants
# $apps
# $appConstants
# $groups
# $groupConstants
# $players
# $playerConstants
# $participants
# $participantConstants
View(jtData$groups)
View(jtData$players)

## ADDITIONAL COMMANDS
# Reads a specific file in the current working folder.
#jtData2 = jtree('20190627-111408-742.csv')

# Reads a specific file with options.
#jtData3 = jtree('20190627-111408-742.csv', sep=';')
