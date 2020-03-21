---
post_id: 315
title: Adding git status to the bash prompt
date: 2013-10-24T09:54:22+00:00
author: pcon
layout: post
permalink: /2013/10/24/adding-git-status-to-bash/
redirect_from:
- /blog/2013/10/24/adding-git-status-to-bash/
dsq_thread_id:
- "2280798131"
categories:
- linux
tags:
- bash
- git
---
After talking to a friend of mine [Jeff Larkin](http://about.me/jefflarkin) about bash prompts, I decided to modify what he did into a single line bash prompt.  By adding the following to your _.bashrc_ you'll get the branch your on in git (if current directory is tracked), a color denoting the status of the branch as well as the return code of the last command (if non-zero)

```bash
#
# Define some colors first: Capitals denote bold
#
red='\e[0;31m'
RED='\e[1;31m'
green='\e[0;32m'
GREEN='\e[1;32m'
yellow='\e[0;33m'
YELLOW='\e[1;33m'
blue='\e[0;34m'
BLUE='\e[1;34m'
magenta='\e[0;35m'
MAGENTA='\e[1;35m'
cyan='\e[0;36m'
CYAN='\e[1;36m'
NC='\e[0m' # No Color

# Taken from http://www.opinionatedprogrammer.com/2011/01/colorful-bash-prompt-reflecting-git-status/
function _git_prompt() {
  local git_status="`git status -unormal 2>&1`"
  if ! [[ "$git_status" =~ Not\ a\ git\ repo ]]; then
    if [[ "$git_status" =~ nothing\ to\ commit ]]; then
      local ansi=$GREEN
    elif [[ "$git_status" =~ nothing\ added\ to\ commit\ but\ untracked\ files\ present ]]; then
      local ansi=$RED
    else
      local ansi=$YELLOW
    fi
    if [[ "$git_status" =~ On\ branch\ ([^[:space:]]+) ]]; then
      branch=${BASH_REMATCH[1]}
      #test "$branch" != master || branch=' '
    else
      # Detached HEAD.  (branch=HEAD is a faster alternative.)
      branch="(`git describe --all --contains --abbrev=4 HEAD 2> /dev/null ||
      echo HEAD`)"
    fi
    echo -n '[\['"$ansi"'\]'"$branch"'\[\e[0m\]]'
  fi
}

function report_status() {
  RET_CODE=$?
  if [[ $RET_CODE -ne 0 ]] ; then
    echo -ne "[\[$RED\]$RET_CODE\[$NC\]]"
  fi
}

export _PS1="\[$NC\][\u@\h \W]"
export PS2="\[$NC\]> "
export PROMPT_COMMAND='_status=$(report_status);export PS1="$(_git_prompt)${_status}${_PS1}\$ ";unset _status;'
```
![Bash Prompt](/assets/img/2013/10/24/bash_prompt.png)