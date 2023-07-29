def parse_time(time):
  centiseconds = time % 100
  res = time // 100
  seconds = res % 60
  res = res // 60
  minutes = res % 60
  hours = res // 60
  return (hours, minutes, seconds, centiseconds)

def FormatStandard(time, trim_zeros):
  hours, minutes, seconds, centiseconds = parse_time(time)
  centiseconds_section = '' if trim_zeros and not centiseconds else '.%02d' % centiseconds 
  if hours > 0:
    return '%d:%02d:%02d' % (hours, minutes, seconds)
  elif minutes >= 10:
    return '%d:%02d' % (minutes, seconds)
  elif minutes > 0:
    return '%d:%02d%s' % (minutes, seconds, centiseconds_section)
  else:
    return '%01d%s' % (seconds, centiseconds_section)

def FormatVerbose(time, trim_zeros, short_units):
  if time >= 6000:
    return FormatStandard(time, trim_zeros)
  else:
    if short_units:
      unit = 'sec'
    elif time == 100:
      unit = 'second'
    else:
      unit = 'seconds'
    return '%s %s' % (FormatStandard(time, trim_zeros), unit)

def FormatMultiBlindOld(time, verbose, trim_zeros, short_units):
  time_in_seconds = time % 100000
  res = time // 100000
  attempted = res % 100
  solved = 199 - res // 100

  if verbose:
    return '%d out of %d cubes in %s' % (
               solved, attempted,
               FormatStandard(time_in_seconds * 100, trim_zeros))
  else:
    return '%d/%d %s' % (solved, attempted,
                         FormatStandard(time_in_seconds * 100, trim_zeros))

def FormatMultiBlind(time, verbose, trim_zeros, short_units):
  missed = time % 100
  res = time // 100
  time_in_seconds = res % 100000
  delta = 99 - res // 100000
  solved = missed + delta
  attempted = solved + missed

  if verbose:
    return '%d out of %d cubes in %s' % (
               solved, attempted,
               FormatStandard(time_in_seconds * 100, trim_zeros))
  else:
    return '%d/%d %s' % (solved, attempted,
                         FormatStandard(time_in_seconds * 100, trim_zeros))

def FormatFewestMoves(time, is_average, verbose, short_units):
  result = str(time)
  if is_average:
    result = '%d.%02d' % (time // 100, time % 100)
  if short_units:
    return result
  if verbose:
    return '%s moves%s' % (result, ' (average)' if is_average else '')
  else:
    return result

def FormatTime(time, event_key, is_average, verbose=False,
               trim_zeros=False, short_units=False):
  if time == -1:
    return 'DNF'
  elif time == -2:
    return 'DNS'
  elif event_key.id() == '333fm':
    return FormatFewestMoves(time, is_average, verbose, short_units)
  elif event_key.id() in ('333mbf', '333mbo'):
    if time > 1000000000:
      return FormatMultiBlindOld(time, verbose, trim_zeros, short_units)
    else:
      return FormatMultiBlind(time, verbose, trim_zeros, short_units)
  elif verbose:
    return FormatVerbose(time, trim_zeros, short_units)
  else:
    return FormatStandard(time, trim_zeros)

def FormatQualifying(time, event_key, is_average, short_units=False):
  if event_key.id() == '333fm':
    return FormatFewestMoves(time, is_average, verbose=False, short_units=short_units)
  elif event_key.id() == '333mbf':
    return '%d %s' % (99 - time // 10000000, 'pts' if short_units else 'points')
  else:
    return FormatVerbose(time, trim_zeros=True, short_units=short_units)

def FormatResult(result, verbose=False):
  is_average = result.fmt.id() in ('a', 'm')
  if is_average:
    return FormatTime(result.average, result.event, True, verbose)
  else:
    return FormatTime(result.best, result.event, False, verbose)

def FormatDate(date):
  return '%s, %s %d' % (date.strftime('%A'), date.strftime('%B'), date.day)

def FormatClockTime(time):
  return time.strftime('%I:%M %p').lstrip('0')
