#!/usr/bin/env python

import re
import sys
import random


def bigrams(s):
    return [char_a + char_b for char_a, char_b in zip(s[:-1], s[1:])]


def generate_password(s):
    # prepare text to avoid non-alphanumeric
    s = re.sub(r'[^a-zA-Z0-9]', ' ', s)

    next_char_map = {}
    for bigram in bigrams(s):
        #print('"{}"'.format(bigram))
        char_a, char_b = bigram[0], bigram[1]
        if char_a not in next_char_map:
            next_char_map[char_a] = []
        next_char_map[char_a].append(char_b)
    #print(next_char_map)

    # delete anything that maps to space to avoid a password
    # that consists of characters that were previously removed
    del next_char_map[' ']

    next_char_map_ = next_char_map.copy()
    password = random.choice(random.choice(list(next_char_map.keys())))
    while len(password) < 16:
        #print(''.join(password))
        last_char = password[-1]
        if last_char not in next_char_map:
            next_char_map = next_char_map_.copy()
            password = random.choice(random.choice(list(next_char_map.keys())))
            continue
        next_char = random.choice(next_char_map[last_char])
        del next_char_map[last_char]
        password += next_char

    return ''.join(password)


def generate_password_from_file(textfile):
    with open(textfile, 'r') as f:
        text = f.read()
        password = generate_password(text)
        return password


def main(textfile):
    password = generate_password_from_file(textfile)
    print('[+] Password: {}'.format(password))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: {} <textfile>'.format(sys.argv[0]))
    else:
        main(sys.argv[1])
