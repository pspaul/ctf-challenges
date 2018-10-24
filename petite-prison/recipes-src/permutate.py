#!/usr/bin/env python3

from random import randint


state = 1337
def voodoo():
    global state
    state ^= (state << 13) % 2**32
    state ^= (state >> 17) % 2**32
    state ^= (state << 5) % 2**32
    return state


output=r"""
                        //
                       //
                      //
                     //
              _______||
         ,-'''       ||`-.
        (            ||   )
        |`-..._______,..-'|
        |            ||   |
        |     _______||   |
        |,-'''_ _  ~ ||`-.|
        |  ~ / `-.\ ,-'\ ~|
        |`-...___/___,..-'|
        |    `-./-'_ \/_| |
        | -'  ~~     || -.|
        (   ~      ~   ~~ )
         `-..._______,..-'
"""[1:]


length = len(output)
N = 1000
arr = list(output)
for i, swap in enumerate([(voodoo() % length, voodoo() % length) for _ in range(N)][::-1]):
    a = swap[0]
    b = swap[1]
    #print('#{}: Swapping {} and {}'.format(i, a, b))
    if a == b:
        continue
    arr[a], arr[b] = arr[b], arr[a]

print(''.join(arr))
print()
print(repr(''.join(arr)))
