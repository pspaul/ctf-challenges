#include <stdio.h>

/*
Compile: gcc cosmopolitan.c -Os -s -o ../recipes/cocktails/cosmopolitan

Created with pattern.py, prints:
\~~~~~/
 \   /
  \ /
   Y
   |
   |
  ---
*/

char* pattern = "???????\n ?   ?\n  ? ?\n   ?\n   ?\n   ?\n  ???\n";
char* inventory = "\\~~~~~/\\/\\/Y||---";


int pattern_pos = 0;
int inventory_pos = 0;

char get_from_pattern() {
    return pattern[pattern_pos++];
}

char get_from_inventory() {
    return inventory[inventory_pos++];
}

int main() {
    char c;
    while ((c = get_from_pattern()) != 0) {
        printf("%c", c == '?' ? get_from_inventory() : c);
    }
}
