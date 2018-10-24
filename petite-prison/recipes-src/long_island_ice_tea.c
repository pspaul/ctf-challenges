#include <stdio.h>
#include <string.h>
#include <stdint.h>

/*
Compile: gcc long_island_ice_tea.c -Os -s -o ../recipes/cocktails/long\ island\ ice\ tea

Created with permutate.py, prints:
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
*/

static const int N = 1000;
static char wat[] = " _' )\n_ -\\. |. .~ |- '   .'   ._  |_` || || |_ (_ \n_ ~  | |   -.'    / -\n|\n_ - |  ~|    .`//-\n\\`    /_  \n_ -  .~\n _|..\n/| _| _`   _   ___  |.  )_     /_ |..\n  \n  _      _ - ,\n- '| `, |_ \n    _ \n   ./_   |,  _,      \n'   |_ ~|.-   \n /- / '_    _  /   \\   -'(-__  `~_ _  ||~ . |' ||  -  '     |\n . , _| ,  _ _  -|  - .  \n ~' _.   '     _  / `      _   / ~    .";

uint32_t state = 1337;
uint32_t voodoo() {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return state;
}

int main() {
    uint32_t len = strlen(wat);
    uint32_t a, b;
    for (int i = 0; i < N; i++) {
        a = voodoo() % len;
        b = voodoo() % len;
        
        if (a == b) {
            continue;
        }

        wat[a] ^= wat[b];
        wat[b] ^= wat[a];
        wat[a] ^= wat[b];
    }

    printf(wat);
}
