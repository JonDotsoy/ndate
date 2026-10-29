# bash completion for ndate
#
# Install:
#   source /path/to/completions/ndate.bash
# or copy it to your bash-completion directory, e.g.
#   cp completions/ndate.bash "$(brew --prefix)/etc/bash_completion.d/ndate"
#   cp completions/ndate.bash ~/.local/share/bash-completion/completions/ndate

_ndate_time_zones() {
  local zoneinfo
  for zoneinfo in "${TZDIR:-}" /usr/share/zoneinfo /usr/lib/zoneinfo /usr/share/lib/zoneinfo; do
    if [[ -n "$zoneinfo" && -d "$zoneinfo" ]]; then
      (cd "$zoneinfo" && find -L . -type f 2>/dev/null) |
        sed -e 's|^\./||' |
        grep -E '^[A-Z][A-Za-z0-9_+-]*(/[A-Za-z0-9_+-]+)*$' |
        grep -vE '^(posix|right|Etc/Unknown)/|^(Factory|posixrules|SystemV)$'
      return
    fi
  done
}

_ndate_locales() {
  local locales
  locales=$(locale -a 2>/dev/null |
    sed -n -e 's/^\([a-z][a-z]\)_\([A-Z][A-Z]\).*/\1-\2/p' |
    sort -u)
  printf '%s\n' ${locales:-en-US es-CL es-ES en-GB fr-FR de-DE pt-BR ja-JP}
}

_ndate() {
  local cur prev
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"

  local opts="-
    --date -d
    --date-style
    --time-style
    --hour-cycles
    --time-zone -tz
    --local -l
    --template
    --json -j
    --sheet
    --utc
    --epoch
    --epoch-ms
    --instant
    --zoned-date-time
    --plain-date-time
    --plain-date
    --plain-time
    --plain-year-month
    --plain-month-day
    --help -h
    --version -v
    --zero -z"

  case "$prev" in
    --date | -d)
      COMPREPLY=($(compgen -W "now" -- "$cur"))
      return 0
      ;;
    --date-style | --time-style)
      COMPREPLY=($(compgen -W "full long medium short none" -- "$cur"))
      return 0
      ;;
    --hour-cycles)
      COMPREPLY=($(compgen -W "h11 h12 h23 h24 none" -- "$cur"))
      return 0
      ;;
    --time-zone | -tz)
      COMPREPLY=($(compgen -W "$(_ndate_time_zones)" -- "$cur"))
      return 0
      ;;
    --local | -l)
      COMPREPLY=($(compgen -W "$(_ndate_locales)" -- "$cur"))
      return 0
      ;;
    --template)
      # Free text, e.g. '{{YYYY}}-{{MM}}-{{DD}}'
      return 0
      ;;
  esac

  COMPREPLY=($(compgen -W "$opts" -- "$cur"))
  return 0
}

complete -F _ndate ndate
