#!/usr/bin/env python3

import string


output = r"""
\~~~~~/
 \   /
  \ /
   Y
   |
   |
  ---
"""[1:]

pattern = ''
inventory = ''
for c in output:
    if c in string.whitespace:
        pattern += c
    else:
        pattern += '?'
        inventory += c

print(repr(pattern))
print(repr(inventory))
