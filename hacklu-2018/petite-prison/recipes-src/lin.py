#!/usr/bin/env python3

import random


def random_lin_eq(val):
    x = val
    m = random.random()
    b = random.random()
    y = m*x + b

    return y, m, b


output=r"""
                   /
                  /
   ______________/___
   \            /   /
    \^^^^^^^^^^/^^^/
     \     ___/   /
      \   (   )  /
       \  (___) /
        \ /    /
         \    /
          \  /
           \/
           ||
           ||
           ||
           ||
           ||
           /\
          /;;\
     ==============
"""[1:]

for c in output:
    print('\tjohny_johny_yes_papa({}, {}, {});'.format(*random_lin_eq(ord(c))))
