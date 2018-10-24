#!/usr/bin/env python3

import math
from random import randint
from numpy import polyfit, polyval


def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in range(0, len(l), n):
        yield l[i:i + n], i


def poly_eval(p, n, x):
    val = 0.0
    for i in range(n):
        val += p[i] * x**(n - i - 1)
    return val


# What the recipe should print
output = r"""
    _.._..,_,_ 
   (          )
    ]~,"-.-~~[ 
  .=])' (;  ([ 
  | ]:: '    [ 
  '=]): .)  ([ 
    |:: '    | 
     ~~----~~  
"""[1:] # Strip first newline for convenience

data_pairs = [(x, ord(c)) for x, c in enumerate(output)]

points_per_poly = 16

# find and check polys
polys = []
poly_out = ''
for points, i in chunks(data_pairs, points_per_poly):
    x = [p[0] - i for p in points]
    y = [p[1] for p in points]
    
    p = polyfit(x, y, points_per_poly - 1)
    p_y = [poly_eval(p, points_per_poly, _x) for _x in x]
    
    polys.append(p)
    poly_out += ''.join([chr(int(round(_y))) for _y in p_y])

    print('    foo({}, {}, {});'.format(i, points_per_poly, ', '.join(str(coeff) for coeff in p)))

print(poly_out)
print('Flawless? {}'.format('Yes' if poly_out == output else 'No'))
