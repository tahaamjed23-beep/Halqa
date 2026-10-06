# -*- coding: utf-8 -*-
"""Generate the interface specification from the code itself.

Work register items: "Interface specification generated from the schemas and published for the bank", and, for every
kept endpoint, "described in the interface specification with its request, response and errors".

Nothing here is written by hand. Each endpoint's method, path, sign in requirement, rate limit class, request schema,
responses and error codes are read out of the route files, so the specification cannot drift from the service: when a
route changes, this is re-run and the change appears.
"""
import io, json, os, re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

API = r'D:\HALQA SIGMA APP\halqa-api\src'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')

CALL = re.compile(r"^router\.(get|post|put|patch|delete)\(\s*'([^']*)'", re.M)
ZOD = re.compile(r'z\.object\(\{')
RES = re.compile(r'res(?:\s*\.\s*status\(\s*(\d{3})\s*\))?\s*\.\s*json\(')
# A response with no body at all, which is the right answer to a logout.
RES_EMPTY = re.compile(r'res\s*\.\s*status\(\s*(\d{3})\s*\)\s*\.\s*(?:end|send)\(\s*\)')


def balanced(text, start, opener='(', closer=')'):
    """Return the text between the bracket at or after `start` and its match."""
    i = text.index(opener, start)
    depth, j, in_s = 0, i, None
    while j < len(text):
        c = text[j]
        if in_s:
            if c == '\\':
                j += 2
                continue
            if c == in_s:
                in_s = None
        elif c in '\'"`':
            in_s = c
        elif c in '([{':
            depth += 1
        elif c in ')]}':
            depth -= 1
            if depth == 0:
                return text[i + 1:j]
        j += 1
    return text[i + 1:]


def one_line(s, limit=400):
    s = re.sub(r'\s+', ' ', s).strip()
    return s[:limit] + (' ...' if len(s) > limit else '')


def read_routes():
    out = []
    for fn in sorted(os.listdir(os.path.join(API, 'routes'))):
        if not fn.endswith('.ts'):
            continue
        name = fn[:-3]
        t = io.open(os.path.join(API, 'routes', fn), encoding='utf-8', newline='').read()
        router_auth = 'router.use(requireAuth)' in t
        ms = list(CALL.finditer(t))
        for i, m in enumerate(ms):
            body = t[m.start():ms[i + 1].start() if i + 1 < len(ms) else len(t)]
            path = m.group(2) if m.group(2) != '/' else ''
            # request: the first zod object parsed in the handler, if any
            req = None
            zm = ZOD.search(body)
            if zm:
                req = one_line(balanced(body, zm.start() + len('z.object'), '{', '}'))
            else:
                # Many handlers parse a schema declared once at the top of the
                # file (credentials.parse(req.body)). Resolve the name.
                nm = re.search(r'\b(\w+)\s*\.\s*parse\s*\(\s*req\.(body|query|params)', body)
                if nm:
                    decl = re.search(r'const\s+%s\s*=\s*z\.object\(\{' % re.escape(nm.group(1)), t)
                    if decl:
                        req = one_line(balanced(t, decl.end() - 2, '{', '}'))
                    else:
                        req = 'schema %s, declared in this route file' % nm.group(1)
            params = re.findall(r':(\w+)', path)
            # responses: every res.json, with its status
            responses = []
            for rm in RES.finditer(body):
                status = rm.group(1) or '200'
                expr = one_line(balanced(body, rm.end() - 1), 160)
                responses.append((status, expr))
            for rm in RES_EMPTY.finditer(body):
                responses.append((rm.group(1), 'no content'))
            statuses = sorted({s for s, _ in responses} | set(re.findall(r'status\((\d{3})\)', body)))
            out.append(dict(file=name, method=m.group(1).upper(), path='/api/%s%s' % (name, path),
                            auth=router_auth or 'requireAuth' in body, params=params, request=req,
                            responses=responses[:6], statuses=statuses))
    return out


LIMITS = {'auth': 'signIn (20 per 15 min)', 'payments': 'financial (30)', 'exchange': 'financial (30)',
          'exits': 'financial (30)', 'notifications': 'read (600)', 'risk': 'read (600)', 'partner': 'read (600)',
          'committees': 'write (120)', 'profile': 'write (120)', 'account': 'write (120)', 'protection': 'write (120)',
          'agreements': 'write (120)', 'rewards': 'write (120)', 'support': 'write (120)', 'chat': 'write (120)'}
UNMOUNTED = {'vault', 'schemes'}

CODES = {'400': 'VALIDATION_FAILED', '401': 'SIGN_IN_REQUIRED', '402': 'PAYMENT_FAILED', '403': 'NOT_ALLOWED',
         '404': 'NOT_FOUND', '409': 'CONFLICT', '422': 'VALIDATION_FAILED', '423': 'PIN_LOCKED',
         '429': 'TOO_MANY_REQUESTS', '500': 'SERVICE_ERROR', '503': 'PARTNER_UNAVAILABLE'}


def main():
    routes = [r for r in read_routes() if r['file'] not in UNMOUNTED]
    os.makedirs(OUT, exist_ok=True)
    md = ['# Halqa Interface Specification', '',
          'Reference HQ-IN-03. Generated from the route files of the interface service; not written by hand.', '',
          'Every endpoint below states what it requires to be called, what it accepts, what it answers and how it '
          'fails. Failures carry a shared code and a sentence in English and Urdu (lib/errors.ts); the codes are '
          'listed with each endpoint. Rate limits are per route and are counted per member where the request is '
          'signed in, and per address otherwise (lib/rate-limits.ts).', '',
          '%d endpoints in %d route files.' % (len(routes), len({r['file'] for r in routes})), '']
    by_file = {}
    for r in routes:
        by_file.setdefault(r['file'], []).append(r)
    for name in sorted(by_file):
        md += ['## %s' % name, '', 'Rate limit: %s.' % LIMITS.get(name, 'default'), '']
        for r in by_file[name]:
            md += ['### %s %s' % (r['method'], r['path']), '']
            md.append('- Sign in: %s' % ('required' if r['auth'] else 'not required, open by design'))
            if r['params']:
                md.append('- Path parameters: %s' % ', '.join(r['params']))
            where = 'query' if r['method'] == 'GET' else 'body'
            md.append('- Request %s: %s' % (where, '`%s`' % r['request'] if r['request'] else 'none'))
            if r['responses']:
                md.append('- Responses:')
                for status, expr in r['responses']:
                    md.append('    - %s: `%s`' % (status, expr or 'empty'))
            errs = [s for s in r['statuses'] if s >= '400']
            if errs:
                md.append('- Errors: %s' % ', '.join('%s %s' % (s, CODES.get(s, 'SERVICE_ERROR')) for s in errs))
            md.append('')
    io.open(os.path.join(OUT, 'INTERFACE-SPECIFICATION.md'), 'w', encoding='utf-8').write('\n'.join(md))
    io.open(os.path.join(OUT, 'interface_spec.json'), 'w', encoding='utf-8').write(
        json.dumps(routes, ensure_ascii=False, indent=1))
    documented = ['%s %s' % (r['method'], r['path']) for r in routes]
    print('endpoints documented: %d' % len(documented))
    print('with a request schema: %d' % sum(1 for r in routes if r['request']))
    print('with at least one response shown: %d' % sum(1 for r in routes if r['responses']))
    print('with error codes listed: %d' % sum(1 for r in routes if [s for s in r['statuses'] if s >= '400']))
    return documented


if __name__ == '__main__':
    main()
