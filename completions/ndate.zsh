#compdef ndate
#
# zsh completion for ndate
#
# Install: copy this file as `_ndate` into a directory on your $fpath, e.g.
#   mkdir -p ~/.zsh/completions
#   cp completions/ndate.zsh ~/.zsh/completions/_ndate
#   # in ~/.zshrc, before compinit:
#   fpath=(~/.zsh/completions $fpath)
#   autoload -Uz compinit && compinit
# With Homebrew, it can live at "$(brew --prefix)/share/zsh/site-functions/_ndate".

_ndate_locales() {
  local -a locales
  locales=(${(u)${(f)"$(locale -a 2>/dev/null | sed -n -e 's/^\([a-z][a-z]\)_\([A-Z][A-Z]\).*/\1-\2/p')"}})
  (( ${#locales} )) || locales=(en-US es-CL es-ES en-GB fr-FR de-DE pt-BR ja-JP)
  _describe -t locales 'locale' locales
}

_ndate_template_properties() {
  local -a properties
  properties=(
    'epoch:unix time in seconds'
    'epoch_ms:unix time in milliseconds'
    'json:ISO 8601 (alias of iso8601)'
    'iso:ISO 8601 (alias of iso8601)'
    'iso8601:ISO 8601'
    'utc:RFC 7231 (alias of rfc7231)'
    'rfc7231:RFC 7231'
    'time:date.getTime()'
    'instant:same as --instant'
    'zoned_date_time:same as --zoned-date-time'
    'plain_date_time:same as --plain-date-time'
    'plain_date:same as --plain-date'
    'plain_time:same as --plain-time'
    'plain_year_month:same as --plain-year-month'
    'plain_month_day:same as --plain-month-day'
    'full_year:date.getFullYear()'
    'utc_full_year:date.getUTCFullYear()'
    'month:date.getMonth()'
    'utc_month:date.getUTCMonth()'
    'date:date.getDate()'
    'utc_date:date.getUTCDate()'
    'day:date.getDay()'
    'utc_day:date.getUTCDay()'
    'hours:date.getHours()'
    'utc_hours:date.getUTCHours()'
    'minutes:date.getMinutes()'
    'utc_minutes:date.getUTCMinutes()'
    'seconds:date.getSeconds()'
    'utc_seconds:date.getUTCSeconds()'
    'milliseconds:date.getMilliseconds()'
    'utc_milliseconds:date.getUTCMilliseconds()'
    'timezone_offset:date.getTimezoneOffset()'
    'local:Intl.DateTimeFormat.format'
    'local_day:day part of Intl.DateTimeFormat'
    'local_dayPeriod:dayPeriod part of Intl.DateTimeFormat'
    'local_era:era part of Intl.DateTimeFormat'
    'local_hour:hour part of Intl.DateTimeFormat'
    'local_literal:literal part of Intl.DateTimeFormat'
    'local_minute:minute part of Intl.DateTimeFormat'
    'local_month:month part of Intl.DateTimeFormat'
    'local_second:second part of Intl.DateTimeFormat'
    'local_timeZoneName:timeZoneName part of Intl.DateTimeFormat'
    'local_weekday:weekday part of Intl.DateTimeFormat'
    'local_year:year part of Intl.DateTimeFormat'
    'YYYY:full year in local time'
    'MM:month in local time'
    'DD:day of month in local time'
    'hh:hour in local time'
    'mm:minute in local time'
    'ss:second in local time'
    'ms:millisecond in local time'
  )

  # Complete a property after an opening "{{" that is not closed yet.
  if [[ $PREFIX == *'{{'* && ${PREFIX##*'{{'} != *'}}'* ]]; then
    compset -P '*{{'
    _describe -t properties 'template property' properties -S '}}'
  else
    _message -e templates "template, e.g. '{{YYYY}}-{{MM}}-{{DD}}'"
  fi
}

_ndate() {
  local -a styles=(full long medium short none)

  _arguments -S \
    '(- *)'{--help,-h}'[show help]' \
    '(- *)'{--version,-v}'[show the ndate version]' \
    '-[read the date from stdin]' \
    '(--date -d)'{--date,-d}'[date to format: now or any value accepted by new Date()]:date:(now)' \
    "--date-style[date style of the locale format]:date style:(${styles})" \
    "--time-style[time style of the locale format]:time style:(${styles})" \
    '--hour-cycles[hour cycle of the locale format]:hour cycle:((h11\:"0-11" h12\:"1-12" h23\:"0-23, 24 hours" h24\:"1-24" none))' \
    '(--time-zone -tz)'{--time-zone,-tz}'[IANA time zone, default: $TZ]:time zone:_time_zone' \
    '(--local -l)'{--local,-l}'[locale, default: $LANG]:locale:_ndate_locales' \
    '--template[render the date with a template]:template:_ndate_template_properties' \
    '(--json -j)'{--json,-j}'[print as ISO 8601]' \
    '--sheet[print as a spreadsheet formula =DATE()+TIME()]' \
    '--utc[print as RFC 7231]' \
    '--epoch[print as unix time in seconds]' \
    '--epoch-ms[print as unix time in milliseconds]' \
    '--instant[print as Temporal.Instant]' \
    '--zoned-date-time[print as Temporal.ZonedDateTime]' \
    '--plain-date-time[print as Temporal.PlainDateTime]' \
    '--plain-date[print as Temporal.PlainDate]' \
    '--plain-time[print as Temporal.PlainTime]' \
    '--plain-year-month[print as Temporal.PlainYearMonth]' \
    '--plain-month-day[print as Temporal.PlainMonthDay]' \
    '(--zero -z)'{--zero,-z}'[do not print the final new line]'
}

_ndate "$@"
