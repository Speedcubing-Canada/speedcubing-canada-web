from dataclasses import dataclass


@dataclass
class ParsedTime:
    hours: int
    minutes: int
    seconds: int
    centiseconds: int


def parse_time(time):
    centiseconds = time % 100
    res = time // 100
    seconds = res % 60
    res = res // 60
    minutes = res % 60
    hours = res // 60
    return ParsedTime(hours, minutes, seconds, centiseconds)


def format_standard(time, trim_zeros):
    parsed = parse_time(time)
    centiseconds_section = '' if trim_zeros and not parsed.centiseconds else f'.{parsed.centiseconds:02d}'
    if parsed.hours > 0:
        return f'{parsed.hours}:{parsed.minutes:02d}:{parsed.seconds:02d}'
    elif parsed.minutes >= 10:
        return f'{parsed.minutes}:{parsed.seconds:02d}'
    elif parsed.minutes > 0:
        return f'{parsed.minutes}:{parsed.seconds:02d}{centiseconds_section}'
    else:
        return f'{parsed.seconds:01d}{centiseconds_section}'


def format_verbose(time, trim_zeros, short_units):
    if time >= 6000:
        return format_standard(time, trim_zeros)
    else:
        if short_units:
            unit = 'sec'
        elif time == 100:
            unit = 'second'
        else:
            unit = 'seconds'
        return f'{format_standard(time, trim_zeros)} {unit}'


def format_multi_blind_old(time, verbose, trim_zeros, short_units):
    time_in_seconds = time % 100000
    res = time // 100000
    attempted = res % 100
    solved = 199 - res // 100

    if verbose:
        return f'{solved} out of {attempted} cubes in {format_standard(time_in_seconds * 100, trim_zeros)}'
    else:
        return f'{solved}/{attempted} {format_standard(time_in_seconds * 100, trim_zeros)}'


def format_multi_blind(time, verbose, trim_zeros, short_units):
    missed = time % 100
    res = time // 100
    time_in_seconds = res % 100000
    delta = 99 - res // 100000
    solved = missed + delta
    attempted = solved + missed

    if verbose:
        return f'{solved} out of {attempted} cubes in {format_standard(time_in_seconds * 100, trim_zeros)}'
    else:
        return f'{solved}/{attempted} {format_standard(time_in_seconds * 100, trim_zeros)}'


def format_fewest_moves(time, is_average, verbose, short_units):
    result = str(time)
    if is_average:
        result = f'{time // 100}.{time % 100:02d}'
    if short_units:
        return result
    if verbose:
        return f'{result} moves{" (average)" if is_average else ""}'
    else:
        return result


def format_time(time, event_key, is_average, verbose=False,
                trim_zeros=False, short_units=False):
    if time == -1:
        return 'DNF'
    elif time == -2:
        return 'DNS'
    elif event_key.id() == '333fm':
        return format_fewest_moves(time, is_average, verbose, short_units)
    elif event_key.id() in ('333mbf', '333mbo'):
        if time > 1000000000:
            return format_multi_blind_old(time, verbose, trim_zeros, short_units)
        else:
            return format_multi_blind(time, verbose, trim_zeros, short_units)
    elif verbose:
        return format_verbose(time, trim_zeros, short_units)
    else:
        return format_standard(time, trim_zeros)


def format_qualifying(time, event_key, is_average, short_units=False):
    if event_key.id() == '333fm':
        return format_fewest_moves(time, is_average, verbose=False, short_units=short_units)
    elif event_key.id() == '333mbf':
        return f'{99 - time // 10000000} {"pts" if short_units else "points"}'
    else:
        return format_verbose(time, trim_zeros=True, short_units=short_units)


def format_result(result, verbose=False):
    is_average = result.fmt.id() in ('a', 'm')
    if is_average:
        return format_time(result.average, result.event, True, verbose)
    else:
        return format_time(result.best, result.event, False, verbose)


def format_date(date):
    return f"{date.strftime('%A')}, {date.strftime('%B')} {date.day}"


def FormatClockTime(time):
    return time.strftime('%I:%M %p').lstrip('0')
